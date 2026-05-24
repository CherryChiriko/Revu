-- -- TEMPORARY BREAKING SCHEMA MIGRATION (FIXED ORDER) --
-- Make sure you have deployed your updated functions from supabase_sql.sql FIRST.

-- 1. Standardize cards_a timestamp naming.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cards_a'
      and column_name = 'createdAt'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cards_a'
      and column_name = 'created_at'
  ) then
    alter table public.cards_a rename column "createdAt" to created_at;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cards_a'
      and column_name = 'createdAt'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cards_a'
      and column_name = 'created_at'
  ) then
    update public.cards_a
    set created_at = coalesce(created_at, "createdAt");

    alter table public.cards_a drop column "createdAt";
  end if;
end;
$$;

alter table public.cards_a
  alter column created_at set default now();

-- 2. Make the optimized count columns explicit and non-null.
alter table public.decks
  add column if not exists due_count integer not null default 0,
  add column if not exists waiting_count integer not null default 0,
  add column if not exists new_count integer not null default 0,
  add column if not exists mastered_count integer not null default 0,
  add column if not exists suspended_count integer not null default 0,
  add column if not exists active_cards_count integer not null default 0;

alter table public.daily_deck_stats
  add column if not exists suspended_count integer not null default 0;

-- 3. Tighten progress table defaults and deck ownership denormalization.
update public.card_a_progress cp
set deck_id = c.deck_id
from public.cards_a c
where c.id = cp.card_id
  and cp.deck_id is distinct from c.deck_id;

update public.card_c_progress cp
set deck_id = c.deck_id
from public.cards_c c
where c.id = cp.card_id
  and cp.deck_id is distinct from c.deck_id;

update public.card_a_progress
set
  ease_factor = coalesce(ease_factor, 2.5),
  review_interval = coalesce(review_interval, 0),
  repetitions = coalesce(repetitions, 0),
  status = case
    when status in ('new', 'waiting', 'due', 'mastered') then status
    else 'new'
  end,
  suspended = coalesce(suspended, false);

update public.card_c_progress
set
  ease_factor = coalesce(ease_factor, 2.5),
  review_interval = coalesce(review_interval, 0),
  repetitions = coalesce(repetitions, 0),
  status = case
    when status in ('new', 'waiting', 'due', 'mastered') then status
    else 'new'
  end,
  suspended = coalesce(suspended, false);

alter table public.card_a_progress
  alter column deck_id set not null,
  alter column ease_factor set default 2.5,
  alter column ease_factor set not null,
  alter column review_interval set default 0,
  alter column review_interval set not null,
  alter column repetitions set default 0,
  alter column repetitions set not null,
  alter column status set default 'new',
  alter column status set not null,
  alter column suspended set default false,
  alter column suspended set not null;

alter table public.card_c_progress
  alter column deck_id set not null,
  alter column ease_factor set default 2.5,
  alter column ease_factor set not null,
  alter column review_interval set default 0,
  alter column review_interval set not null,
  alter column repetitions set default 0,
  alter column repetitions set not null,
  alter column status set default 'new',
  alter column status set not null,
  alter column suspended set default false,
  alter column suspended set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'card_a_progress_status_check'
      and conrelid = 'public.card_a_progress'::regclass
  ) then
    alter table public.card_a_progress
      add constraint card_a_progress_status_check
      check (status in ('new', 'waiting', 'due', 'mastered'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'card_c_progress_status_check'
      and conrelid = 'public.card_c_progress'::regclass
  ) then
    alter table public.card_c_progress
      add constraint card_c_progress_status_check
      check (status in ('new', 'waiting', 'due', 'mastered'));
  end if;
end;
$$;

-- 4. Drop old RPC signatures.
drop function if exists public.refresh_deck_counts(uuid);
drop function if exists public.ensure_today_stats_for_user(uuid);
drop function if exists public.refresh_daily_stats_for_user(uuid);
drop function if exists public.refresh_today_availability_for_user(uuid);
drop function if exists public.update_streaks_after_session(uuid, uuid[], integer, integer, integer, integer);
drop function if exists public.resolve_inactive_streaks();
drop function if exists public.resolve_inactive_streaks(integer, integer);

-- 5. Refresh existing cached deck counts using the NEW function code.
-- (This assumes your newly deployed function handles the new column layout!)
do $$
declare
  r record;
begin
  for r in
    select id
    from public.decks
  loop
    perform public.refresh_deck_counts(r.id, 'UTC');
  end loop;
end;
$$;

-- 6. NOW it is safe to drop the unreleased legacy deck columns.
alter table public.decks
  drop column if exists new,
  drop column if exists learning,
  drop column if exists mastered;