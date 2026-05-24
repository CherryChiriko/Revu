-- Canonical Supabase study-state migration.
-- Covers card lifecycle, deck counts, timezone-local daily rows, streak activation,
-- missed streak resolution, and freeze handling.

alter table public.daily_deck_stats
  add column if not exists cards_reviewed integer not null default 0,
  add column if not exists cards_learned integer not null default 0,
  add column if not exists review_available_count integer not null default 0,
  add column if not exists learn_available_count integer not null default 0;

alter table public.decks
  add column if not exists status text not null default 'learning',
  add column if not exists mastered_at timestamp with time zone;

alter table public.cards_a
  alter column "createdAt" set default now();

alter table public.cards_c
  alter column created_at set default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'decks_status_check'
      and conrelid = 'public.decks'::regclass
  ) then
    alter table public.decks
      add constraint decks_status_check
      check (status in ('learning', 'mastered'));
  end if;
end;
$$;

create or replace function public.card_mastered_interval_days()
returns integer
language sql
immutable
as $$
  select 180;
$$;

create or replace function public.local_study_date(
  p_user_timezone text default 'UTC'
)
returns date
language sql
stable
as $$
  select (now() at time zone coalesce(nullif(p_user_timezone, ''), 'UTC'))::date;
$$;

create or replace function public._trg_normalize_card_progress_state()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(new.suspended, false) then
    return new;
  end if;

  new.status :=
    case
      when new.last_studied is null
        and coalesce(new.repetitions, 0) = 0
        and new.due_date is null
        then 'new'
      when coalesce(new.review_interval, 0) >= public.card_mastered_interval_days()
        then 'mastered'
      when new.due_date is not null and new.due_date <= now()
        then 'due'
      else 'waiting'
    end;

  return new;
end;
$$;

create or replace function public.normalize_deck_card_states(
  p_deck_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  select user_id into v_user_id
  from public.decks
  where id = p_deck_id;

  if v_user_id is null then
    return;
  end if;

  update public.card_a_progress cp
  set status = states.status
  from (
    select
      cp.card_id,
      case
        when cp.last_studied is null
          and coalesce(cp.repetitions, 0) = 0
          and cp.due_date is null
          then 'new'
        when coalesce(cp.review_interval, 0) >= public.card_mastered_interval_days()
          then 'mastered'
        when cp.due_date is not null and cp.due_date <= now()
          then 'due'
        else 'waiting'
      end as status
    from public.card_a_progress cp
    join public.cards_a c on c.id = cp.card_id
    where c.deck_id = p_deck_id
      and cp.user_id = v_user_id
      and not coalesce(cp.suspended, false)
  ) states
  where cp.card_id = states.card_id
    and cp.user_id = v_user_id
    and cp.status is distinct from states.status;

  update public.card_c_progress cp
  set status = states.status
  from (
    select
      cp.card_id,
      case
        when cp.last_studied is null
          and coalesce(cp.repetitions, 0) = 0
          and cp.due_date is null
          then 'new'
        when coalesce(cp.review_interval, 0) >= public.card_mastered_interval_days()
          then 'mastered'
        when cp.due_date is not null and cp.due_date <= now()
          then 'due'
        else 'waiting'
      end as status
    from public.card_c_progress cp
    join public.cards_c c on c.id = cp.card_id
    where c.deck_id = p_deck_id
      and cp.user_id = v_user_id
      and not coalesce(cp.suspended, false)
  ) states
  where cp.card_id = states.card_id
    and cp.user_id = v_user_id
    and cp.status is distinct from states.status;
end;
$$;

create or replace function public.refresh_deck_counts(
  p_deck_id uuid,
  p_user_timezone text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_today date := public.local_study_date(p_user_timezone);
begin
  select user_id into v_user_id
  from public.decks
  where id = p_deck_id;

  if v_user_id is null then
    return;
  end if;

  perform public.normalize_deck_card_states(p_deck_id);

  insert into public.daily_deck_stats (user_id, deck_id, date, updated_at)
  values (v_user_id, p_deck_id, v_today, now())
  on conflict (user_id, deck_id, date) do nothing;

  with unified_cards as (
    select
      c.id,
      coalesce(cp.suspended, false) as suspended,
      case
        when cp.card_id is null then 'new'
        when cp.last_studied is null
          and coalesce(cp.repetitions, 0) = 0
          and cp.due_date is null
          then 'new'
        when coalesce(cp.review_interval, 0) >= public.card_mastered_interval_days()
          then 'mastered'
        when cp.due_date is not null and cp.due_date <= now()
          then 'due'
        else 'waiting'
      end as status,
      cp.last_studied
    from public.cards_a c
    left join public.card_a_progress cp
      on cp.card_id = c.id
     and cp.user_id = v_user_id
    where c.deck_id = p_deck_id

    union all

    select
      c.id,
      coalesce(cp.suspended, false) as suspended,
      case
        when cp.card_id is null then 'new'
        when cp.last_studied is null
          and coalesce(cp.repetitions, 0) = 0
          and cp.due_date is null
          then 'new'
        when coalesce(cp.review_interval, 0) >= public.card_mastered_interval_days()
          then 'mastered'
        when cp.due_date is not null and cp.due_date <= now()
          then 'due'
        else 'waiting'
      end as status,
      cp.last_studied
    from public.cards_c c
    left join public.card_c_progress cp
      on cp.card_id = c.id
     and cp.user_id = v_user_id
    where c.deck_id = p_deck_id
  ),
  counts as (
    select
      count(*)::integer as total_count,
      count(*) filter (where status = 'new' and not suspended)::integer as new_count,
      count(*) filter (where status = 'waiting' and not suspended)::integer as waiting_count,
      count(*) filter (where status = 'due' and not suspended)::integer as due_count,
      count(*) filter (where status = 'mastered' and not suspended)::integer as mastered_count,
      max(last_studied)::date as last_reviewed
    from unified_cards
  )
  update public.decks d
  set
    cards_count = counts.total_count,
    new = counts.new_count,
    learning = counts.waiting_count + counts.due_count,
    mastered = counts.mastered_count,
    last_reviewed = counts.last_reviewed,
    status = case
      when counts.total_count > 0 and counts.mastered_count = counts.total_count
        then 'mastered'
      else 'learning'
    end,
    mastered_at = case
      when counts.total_count > 0 and counts.mastered_count = counts.total_count
        then coalesce(d.mastered_at, now())
      else null
    end
  from counts
  where d.id = p_deck_id;

  with unified_cards as (
    select
      coalesce(cp.suspended, false) as suspended,
      case
        when cp.card_id is null then 'new'
        when cp.last_studied is null
          and coalesce(cp.repetitions, 0) = 0
          and cp.due_date is null
          then 'new'
        when coalesce(cp.review_interval, 0) >= public.card_mastered_interval_days()
          then 'mastered'
        when cp.due_date is not null and cp.due_date <= now()
          then 'due'
        else 'waiting'
      end as status
    from public.cards_a c
    left join public.card_a_progress cp
      on cp.card_id = c.id
     and cp.user_id = v_user_id
    where c.deck_id = p_deck_id

    union all

    select
      coalesce(cp.suspended, false) as suspended,
      case
        when cp.card_id is null then 'new'
        when cp.last_studied is null
          and coalesce(cp.repetitions, 0) = 0
          and cp.due_date is null
          then 'new'
        when coalesce(cp.review_interval, 0) >= public.card_mastered_interval_days()
          then 'mastered'
        when cp.due_date is not null and cp.due_date <= now()
          then 'due'
        else 'waiting'
      end as status
    from public.cards_c c
    left join public.card_c_progress cp
      on cp.card_id = c.id
     and cp.user_id = v_user_id
    where c.deck_id = p_deck_id
  ),
  counts as (
    select
      count(*) filter (where status = 'new' and not suspended)::integer as new_count,
      count(*) filter (where status = 'waiting' and not suspended)::integer as waiting_count,
      count(*) filter (where status = 'due' and not suspended)::integer as due_count
    from unified_cards
  )
  update public.daily_deck_stats dds
  set
    new_count = counts.new_count,
    waiting_count = counts.waiting_count,
    due_count = counts.due_count,
    review_available_count = greatest(dds.review_available_count, counts.due_count),
    learn_available_count = greatest(dds.learn_available_count, counts.new_count),
    updated_at = now()
  from counts
  where dds.user_id = v_user_id
    and dds.deck_id = p_deck_id
    and dds.date = v_today;
end;
$$;

create or replace function public.refresh_deck_counts(
  p_deck_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_deck_counts(p_deck_id, 'UTC');
end;
$$;

create or replace function public.ensure_today_stats_for_user(
  p_user_id uuid,
  p_user_timezone text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := public.local_study_date(p_user_timezone);
  v_yesterday date := v_today - 1;
  r record;
begin
  insert into public.daily_user_stats (
    user_id,
    date,
    global_streak,
    max_global_streak,
    streak_state,
    cards_reviewed,
    cards_learned,
    updated_at
  )
  values (
    p_user_id,
    v_today,
    0,
    0,
    'inactive',
    0,
    0,
    now()
  )
  on conflict (user_id, date) do nothing;

  update public.daily_user_stats today
  set
    global_streak = coalesce(yesterday.global_streak, today.global_streak, 0),
    max_global_streak = greatest(
      coalesce(today.max_global_streak, 0),
      coalesce(yesterday.max_global_streak, 0),
      coalesce(yesterday.global_streak, 0)
    ),
    streak_state = 'inactive',
    updated_at = now()
  from public.daily_user_stats yesterday
  where today.user_id = p_user_id
    and today.date = v_today
    and today.cards_reviewed = 0
    and today.cards_learned = 0
    and yesterday.user_id = p_user_id
    and yesterday.date = v_yesterday;

  insert into public.daily_deck_stats (
    user_id,
    deck_id,
    date,
    deck_streak,
    max_streak,
    streak_state,
    cards_reviewed,
    cards_learned,
    review_available_count,
    learn_available_count,
    updated_at
  )
  select
    d.user_id,
    d.id,
    v_today,
    coalesce(y.deck_streak, 0),
    coalesce(y.max_streak, 0),
    'inactive',
    0,
    0,
    0,
    0,
    now()
  from public.decks d
  left join public.daily_deck_stats y
    on y.user_id = d.user_id
   and y.deck_id = d.id
   and y.date = v_yesterday
  where d.user_id = p_user_id
  on conflict (user_id, deck_id, date) do nothing;

  for r in
    select id from public.decks where user_id = p_user_id
  loop
    perform public.refresh_deck_counts(r.id, p_user_timezone);
  end loop;
end;
$$;

create or replace function public.ensure_today_stats_for_user(
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_today_stats_for_user(p_user_id, 'UTC');
end;
$$;

create or replace function public.refresh_daily_stats_for_user(
  p_user_id uuid,
  p_user_timezone text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_today_stats_for_user(p_user_id, p_user_timezone);
end;
$$;

create or replace function public.refresh_daily_stats_for_user(
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_daily_stats_for_user(p_user_id, 'UTC');
end;
$$;

create or replace function public.update_streaks_after_session(
  p_user_id uuid,
  p_deck_results jsonb,
  p_review_limit integer,
  p_learn_limit integer,
  p_user_timezone text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := public.local_study_date(p_user_timezone);
  v_yesterday date := v_today - 1;
  r record;
  v_new_deck_streak integer;
  v_global_completed boolean := false;
begin
  if p_review_limit <= 0 or p_learn_limit <= 0 then
    raise exception 'review and learn limits must be positive';
  end if;

  perform public.ensure_today_stats_for_user(p_user_id, p_user_timezone);

  for r in
    select
      (value->>'deck_id')::uuid as deck_id,
      greatest(coalesce((value->>'cards_reviewed')::integer, 0), 0) as cards_reviewed,
      greatest(coalesce((value->>'cards_learned')::integer, 0), 0) as cards_learned
    from jsonb_array_elements(coalesce(p_deck_results, '[]'::jsonb))
  loop
    if not exists (
      select 1
      from public.decks d
      where d.id = r.deck_id
        and d.user_id = p_user_id
    ) then
      raise exception 'deck % does not belong to user %', r.deck_id, p_user_id;
    end if;

    update public.daily_deck_stats d
    set
      cards_reviewed = d.cards_reviewed + r.cards_reviewed,
      cards_learned = d.cards_learned + r.cards_learned,
      updated_at = now()
    where d.user_id = p_user_id
      and d.deck_id = r.deck_id
      and d.date = v_today;

    update public.daily_user_stats u
    set
      cards_reviewed = u.cards_reviewed + r.cards_reviewed,
      cards_learned = u.cards_learned + r.cards_learned,
      updated_at = now()
    where u.user_id = p_user_id
      and u.date = v_today;

    select coalesce(y.deck_streak, 0) + 1
    into v_new_deck_streak
    from public.daily_deck_stats d
    left join public.daily_deck_stats y
      on y.user_id = d.user_id
     and y.deck_id = d.deck_id
     and y.date = v_yesterday
    where d.user_id = p_user_id
      and d.deck_id = r.deck_id
      and d.date = v_today
      and d.streak_state is distinct from 'active'
      and (
        d.cards_reviewed >= p_review_limit
        or d.cards_learned >= p_learn_limit
      );

    if v_new_deck_streak is not null then
      update public.daily_deck_stats d
      set
        deck_streak = v_new_deck_streak,
        max_streak = greatest(coalesce(d.max_streak, 0), v_new_deck_streak),
        streak_state = 'active',
        updated_at = now()
      where d.user_id = p_user_id
        and d.deck_id = r.deck_id
        and d.date = v_today
        and d.streak_state is distinct from 'active';

      v_global_completed := true;
    end if;

    perform public.refresh_deck_counts(r.deck_id, p_user_timezone);
    v_new_deck_streak := null;
  end loop;

  if v_global_completed then
    update public.daily_user_stats u
    set
      global_streak = coalesce(y.global_streak, 0) + 1,
      max_global_streak = greatest(
        coalesce(u.max_global_streak, 0),
        coalesce(y.global_streak, 0) + 1
      ),
      streak_state = 'active',
      updated_at = now()
    from public.daily_user_stats y
    where u.user_id = p_user_id
      and u.date = v_today
      and u.streak_state is distinct from 'active'
      and y.user_id = p_user_id
      and y.date = v_yesterday;

    update public.daily_user_stats u
    set
      global_streak = 1,
      max_global_streak = greatest(coalesce(u.max_global_streak, 0), 1),
      streak_state = 'active',
      updated_at = now()
    where u.user_id = p_user_id
      and u.date = v_today
      and u.streak_state is distinct from 'active'
      and not exists (
        select 1
        from public.daily_user_stats y
        where y.user_id = p_user_id
          and y.date = v_yesterday
      );
  end if;
end;
$$;

create or replace function public.update_streaks_after_session(
  p_user_id uuid,
  p_deck_ids uuid[],
  p_cards_reviewed integer,
  p_cards_learned integer,
  p_review_limit integer,
  p_learn_limit integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(cardinality(p_deck_ids), 0) <> 1 then
    raise exception
      'legacy update_streaks_after_session cannot split counts across multiple decks; call the jsonb overload instead';
  end if;

  perform public.update_streaks_after_session(
    p_user_id,
    jsonb_build_array(jsonb_build_object(
      'deck_id', p_deck_ids[1],
      'cards_reviewed', p_cards_reviewed,
      'cards_learned', p_cards_learned
    )),
    p_review_limit,
    p_learn_limit,
    'UTC'
  );
end;
$$;

create or replace function public.resolve_inactive_streaks(
  p_review_limit integer,
  p_learn_limit integer,
  p_user_timezone text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_yesterday date := public.local_study_date(p_user_timezone) - 1;
begin
  if p_review_limit <= 0 or p_learn_limit <= 0 then
    raise exception 'review and learn limits must be positive';
  end if;

  update public.daily_deck_stats d
  set
    deck_streak = 0,
    streak_state = 'inactive',
    updated_at = now()
  where d.date = v_yesterday
    and d.streak_state = 'inactive'
    and (
      d.review_available_count >= p_review_limit
      or d.learn_available_count >= p_learn_limit
    );

  update public.daily_deck_stats d
  set
    streak_state = 'frozen',
    updated_at = now()
  where d.date = v_yesterday
    and d.streak_state = 'inactive'
    and d.review_available_count < p_review_limit
    and d.learn_available_count < p_learn_limit;

  update public.daily_user_stats u
  set
    global_streak = 0,
    streak_state = 'inactive',
    updated_at = now()
  where u.date = v_yesterday
    and u.streak_state = 'inactive'
    and exists (
      select 1
      from public.daily_deck_stats d
      where d.user_id = u.user_id
        and d.date = v_yesterday
        and (
          d.review_available_count >= p_review_limit
          or d.learn_available_count >= p_learn_limit
        )
    );

  update public.daily_user_stats u
  set
    streak_state = 'frozen',
    updated_at = now()
  where u.date = v_yesterday
    and u.streak_state = 'inactive'
    and not exists (
      select 1
      from public.daily_deck_stats d
      where d.user_id = u.user_id
        and d.date = v_yesterday
        and (
          d.review_available_count >= p_review_limit
          or d.learn_available_count >= p_learn_limit
        )
    );
end;
$$;

create or replace function public.resolve_inactive_streaks(
  p_review_limit integer,
  p_learn_limit integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.resolve_inactive_streaks(p_review_limit, p_learn_limit, 'UTC');
end;
$$;

create or replace function public.resolve_inactive_streaks()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'resolve_inactive_streaks now requires review and learn limits';
end;
$$;

create or replace function public._trg_card_progress_refresh()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_deck_id uuid;
begin
  if pg_trigger_depth() > 1 then
    return coalesce(new, old);
  end if;

  if tg_table_name = 'card_a_progress' then
    select deck_id into v_deck_id
    from public.cards_a
    where id = coalesce(new.card_id, old.card_id);
  else
    select deck_id into v_deck_id
    from public.cards_c
    where id = coalesce(new.card_id, old.card_id);
  end if;

  if v_deck_id is not null then
    perform public.refresh_deck_counts(v_deck_id);
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function public._trg_cards_refresh()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(new.deck_id, old.deck_id) is not null then
    perform public.refresh_deck_counts(coalesce(new.deck_id, old.deck_id));
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists card_a_progress_refresh_trigger on public.card_a_progress;
drop trigger if exists card_c_progress_refresh_trigger on public.card_c_progress;
drop trigger if exists trg_refresh_a on public.card_a_progress;
drop trigger if exists trg_refresh_c on public.card_c_progress;
drop trigger if exists trg_normalize_card_a_progress on public.card_a_progress;
drop trigger if exists trg_normalize_card_c_progress on public.card_c_progress;

create trigger trg_normalize_card_a_progress
before insert or update on public.card_a_progress
for each row execute function public._trg_normalize_card_progress_state();

create trigger trg_normalize_card_c_progress
before insert or update on public.card_c_progress
for each row execute function public._trg_normalize_card_progress_state();

create trigger trg_refresh_a
after insert or update or delete on public.card_a_progress
for each row execute function public._trg_card_progress_refresh();

create trigger trg_refresh_c
after insert or update or delete on public.card_c_progress
for each row execute function public._trg_card_progress_refresh();

drop trigger if exists cards_a_refresh_trigger on public.cards_a;
drop trigger if exists cards_c_refresh_trigger on public.cards_c;
drop trigger if exists trg_cards_a on public.cards_a;
drop trigger if exists trg_cards_c on public.cards_c;

create trigger trg_cards_a
after insert or update or delete on public.cards_a
for each row execute function public._trg_cards_refresh();

create trigger trg_cards_c
after insert or update or delete on public.cards_c
for each row execute function public._trg_cards_refresh();

grant execute on function public.card_mastered_interval_days() to authenticated;
grant execute on function public.local_study_date(text) to authenticated;
grant execute on function public.normalize_deck_card_states(uuid) to authenticated;
grant execute on function public.refresh_deck_counts(uuid) to authenticated;
grant execute on function public.refresh_deck_counts(uuid, text) to authenticated;
grant execute on function public.ensure_today_stats_for_user(uuid) to authenticated;
grant execute on function public.ensure_today_stats_for_user(uuid, text) to authenticated;
grant execute on function public.refresh_daily_stats_for_user(uuid) to authenticated;
grant execute on function public.refresh_daily_stats_for_user(uuid, text) to authenticated;
grant execute on function public.update_streaks_after_session(uuid, jsonb, integer, integer, text) to authenticated;
grant execute on function public.update_streaks_after_session(uuid, uuid[], integer, integer, integer, integer) to authenticated;
grant execute on function public.resolve_inactive_streaks() to authenticated;
grant execute on function public.resolve_inactive_streaks(integer, integer) to authenticated;
grant execute on function public.resolve_inactive_streaks(integer, integer, text) to authenticated;
