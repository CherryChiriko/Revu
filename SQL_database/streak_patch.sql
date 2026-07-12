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
  v_total_xp integer := 0;
begin
  if p_review_limit <= 0 or p_learn_limit <= 0 then
    raise exception 'review and learn limits must be positive';
  end if;

  perform public.ensure_today_stats_for_user(p_user_id, p_user_timezone);

  for r in
    select
      (value->>'deck_id')::uuid as deck_id,
      greatest(coalesce((value->>'cards_reviewed')::integer, 0), 0) as cards_reviewed,
      greatest(coalesce((value->>'cards_learned')::integer, 0), 0) as cards_learned,
      greatest(coalesce((value->>'xp_earned')::integer, 0), 0) as xp_earned
    from jsonb_array_elements(coalesce(p_deck_results, '[]'::jsonb))
  loop
    if not exists (select 1 from public.decks d where d.id = r.deck_id and d.user_id = p_user_id) then
      raise exception 'deck % does not belong to user %', r.deck_id, p_user_id;
    end if;

    -- Update review and learning aggregates safely
    update public.daily_deck_stats d
    set cards_reviewed = d.cards_reviewed + r.cards_reviewed,
        cards_learned = d.cards_learned + r.cards_learned,
        updated_at = now()
    where d.user_id = p_user_id and d.deck_id = r.deck_id and d.date = v_today;

    update public.daily_user_stats u
    set cards_reviewed = u.cards_reviewed + r.cards_reviewed,
        cards_learned = u.cards_learned + r.cards_learned,
        updated_at = now()
    where u.user_id = p_user_id and u.date = v_today;

    v_total_xp := v_total_xp + r.xp_earned;

    -- FIX: Only update streaks if the current target row is NOT already marked 'active' for today
    select coalesce(y.deck_streak, 0) + 1
    into v_new_deck_streak
    from public.daily_deck_stats d
    left join public.daily_deck_stats y
      on y.user_id = d.user_id and y.deck_id = d.deck_id and y.date = v_yesterday
    where d.user_id = p_user_id and d.deck_id = r.deck_id and d.date = v_today
      and d.streak_state is distinct from 'active' -- Guardrail checking today's state
      and (d.cards_reviewed >= p_review_limit or d.cards_learned >= p_learn_limit);

    if v_new_deck_streak is not null then
      update public.daily_deck_stats d
      set deck_streak = v_new_deck_streak,
          max_streak = greatest(coalesce(d.max_streak, 0), v_new_deck_streak),
          streak_state = 'active',
          updated_at = now()
      where d.user_id = p_user_id and d.deck_id = r.deck_id and d.date = v_today;
      v_global_completed := true;
    end if;

    perform public.refresh_deck_counts(r.deck_id, p_user_timezone);
    v_new_deck_streak := null;
  end loop;

  -- Apply accumulated XP
  if v_total_xp > 0 then
    update public.daily_user_stats u
    set total_xp = coalesce(u.total_xp, 0) + v_total_xp,
        updated_at = now()
    where u.user_id = p_user_id and u.date = v_today;

    update public.profiles
    set lifetime_xp = lifetime_xp + v_total_xp
    where id = p_user_id;
  end if;

  -- Global Streak safe updates
  if v_global_completed then
    update public.daily_user_stats u
    set global_streak = coalesce(y.global_streak, 0) + 1,
        max_global_streak = greatest(coalesce(u.max_global_streak, 0), coalesce(y.global_streak, 0) + 1),
        streak_state = 'active', updated_at = now()
    from public.daily_user_stats y
    where u.user_id = p_user_id and u.date = v_today
      and u.streak_state is distinct from 'active'
      and y.user_id = p_user_id and y.date = v_yesterday;

    update public.daily_user_stats u
    set global_streak = 1,
        max_global_streak = greatest(coalesce(u.max_global_streak, 0), 1),
        streak_state = 'active', updated_at = now()
    where u.user_id = p_user_id and u.date = v_today
      and u.streak_state is distinct from 'active'
      and not exists (select 1 from public.daily_user_stats y where y.user_id = p_user_id and y.date = v_yesterday);
  end if;
end;
$$;


-- Resets any daily streaks where yesterday had zero activity, breaking the infinite chain
update public.daily_deck_stats today
set deck_streak = 1, streak_state = 'active'
where today.date = current_date
  and today.streak_state = 'active'
  and not exists (
    select 1 from public.daily_deck_stats yesterday
    where yesterday.deck_id = today.deck_id
      and yesterday.user_id = today.user_id
      and yesterday.date = today.date - 1
      and yesterday.streak_state = 'active'
  );




  -- ============================================================
-- Wipe all streak history (test data) — clean slate.
-- Run the ensure_today_stats_for_user fix from the prior migration
-- FIRST if you haven't already, so new rows are created correctly
-- going forward.
-- ============================================================

-- 1. Delete all historical daily rows entirely (deck + user level).
delete from public.daily_deck_stats;
delete from public.daily_user_stats;

-- 2. Zero out anything cached elsewhere that mirrors streak state.
update public.profiles
set global_streak = 0,
    global_max_streak = 0,
    global_last_active = null;

-- Note: decks table itself doesn't store streak columns (deck_streak/
-- max_streak live only in daily_deck_stats, which is now empty), so
-- nothing further to reset there.


-- ============================================================
-- Fix: gap-blind streak resolution + broken max_streak sourcing
-- Replaces ensure_today_stats_for_user only.
-- resolve_inactive_streaks is no longer called by anything after
-- this migration (its job is folded in below) — left in place,
-- unused, in case you want it back for a future cron-based setup.
-- ============================================================

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
  r record;
begin
  -- ── Global (user-level) row ────────────────────────────────
  -- Find the single most recent existing row for this user, whatever
  -- date it is. No assumption that it's "yesterday".
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
  select
    p_user_id,
    v_today,
    case
      -- last row IS today already (shouldn't normally hit insert due to
      -- on conflict below, but keep it correct if it ever does)
      when last_row.date = v_today then coalesce(last_row.global_streak, 0)
      -- last row was exactly 1 day ago: streak survives only if that
      -- day met its limit (streak_state = 'active' means it did)
      when last_row.date = v_today - 1 and last_row.streak_state = 'active'
        then coalesce(last_row.global_streak, 0)
      -- last row was exactly 1 day ago but wasn't active (missed it) → dead
      when last_row.date = v_today - 1
        then 0
      -- gap of 2+ days, or no prior row at all → definitely dead
      else 0
    end,
    greatest(
      coalesce(last_row.max_global_streak, 0),
      case
        when last_row.date = v_today - 1 and last_row.streak_state = 'active'
          then coalesce(last_row.global_streak, 0)
        else 0
      end
    ),
    'inactive',
    0,
    0,
    now()
  from (
    select global_streak, max_global_streak, streak_state, date
    from public.daily_user_stats
    where user_id = p_user_id
    order by date desc
    limit 1
  ) last_row
  on conflict (user_id, date) do nothing;

  -- if no prior row existed at all (brand new user), the select above
  -- returns nothing to insert — cover that case explicitly
  insert into public.daily_user_stats (
    user_id, date, global_streak, max_global_streak, streak_state,
    cards_reviewed, cards_learned, updated_at
  )
  values (p_user_id, v_today, 0, 0, 'inactive', 0, 0, now())
  on conflict (user_id, date) do nothing;

  -- ── Per-deck rows ───────────────────────────────────────────
  for r in
    select id as deck_id from public.decks where user_id = p_user_id
  loop
    insert into public.daily_deck_stats (
      user_id, deck_id, date, deck_streak, max_streak, streak_state,
      cards_reviewed, cards_learned, review_available_count,
      learn_available_count, updated_at
    )
    select
      p_user_id,
      r.deck_id,
      v_today,
      case
        when last_row.date = v_today - 1 and last_row.streak_state = 'active'
          then coalesce(last_row.deck_streak, 0)
        else 0
      end,
      greatest(
        coalesce(last_row.max_streak, 0),
        case
          when last_row.date = v_today - 1 and last_row.streak_state = 'active'
            then coalesce(last_row.deck_streak, 0)
          else 0
        end
      ),
      'inactive',
      0, 0, 0, 0, now()
    from (
      select deck_streak, max_streak, streak_state, date
      from public.daily_deck_stats
      where user_id = p_user_id and deck_id = r.deck_id
      order by date desc
      limit 1
    ) last_row
    on conflict (user_id, deck_id, date) do nothing;

    -- brand new deck with zero prior rows
    insert into public.daily_deck_stats (
      user_id, deck_id, date, deck_streak, max_streak, streak_state,
      cards_reviewed, cards_learned, review_available_count,
      learn_available_count, updated_at
    )
    values (p_user_id, r.deck_id, v_today, 0, 0, 'inactive', 0, 0, 0, 0, now())
    on conflict (user_id, deck_id, date) do nothing;

    perform public.refresh_deck_counts(r.deck_id, p_user_timezone);
  end loop;
end;
$$;

grant execute on function public.ensure_today_stats_for_user(uuid, text) to authenticated;

-- ============================================================
-- One-time backfill: fix max_streak/max_global_streak on EXISTING
-- rows where the gap bug already clobbered the historical max.
-- This recomputes each user/deck's true all-time max from history
-- and writes it into today's (or the latest) row.
-- ============================================================

with true_max as (
  select user_id, deck_id, max(max_streak) as real_max
  from public.daily_deck_stats
  group by user_id, deck_id
)
update public.daily_deck_stats d
set max_streak = tm.real_max
from true_max tm
where d.user_id = tm.user_id
  and d.deck_id = tm.deck_id
  and d.max_streak < tm.real_max;

with true_max as (
  select user_id, max(max_global_streak) as real_max
  from public.daily_user_stats
  group by user_id
)
update public.daily_user_stats u
set max_global_streak = tm.real_max
from true_max tm
where u.user_id = tm.user_id
  and u.max_global_streak < tm.real_max;


  -- ============================================================
-- Wipe all card progress (test data) — full reset to 'new'.
-- Deletes every row in card_a_progress / card_c_progress, then
-- resyncs cached deck-level counts (due/new/familiar/solid/mastered)
-- to reflect the now-empty progress tables.
--
-- Run AFTER reset_streak_data.sql, since refresh_deck_counts also
-- touches daily_deck_stats for "today" and you want that table
-- already clean.
-- ============================================================

-- 1. Delete all progress rows. Every card reverts to its default
--    "new, never studied" state (no progress row = new, per the
--    normalize logic in refresh_deck_counts's unified_cards CTE).
delete from public.card_a_progress;
delete from public.card_c_progress;

-- 2. Resync every deck's cached counts (due_count, new_count,
--    familiar_count, solid_count, mastered_count, status, etc.)
--    now that progress is gone. Uses each deck's owner's timezone
--    as UTC since we don't have per-user tz handy here — fine for
--    a one-off reset, daily_deck_stats availability counts will
--    self-correct on next real app open anyway.
do $$
declare
  r record;
begin
  for r in select id from public.decks loop
    perform public.refresh_deck_counts(r.id, 'UTC');
  end loop;
end;
$$;



-- ============================================================
-- Fix: normalize-status triggers were only firing on INSERT,
-- despite being defined as "before insert or update". Confirmed
-- via direct trigger inspection (event column showed INSERT only).
-- This re-creates them explicitly covering both.
-- ============================================================

drop trigger if exists trg_normalize_card_a_progress on public.card_a_progress;
drop trigger if exists trg_normalize_card_c_progress on public.card_c_progress;

create trigger trg_normalize_card_a_progress
before insert or update on public.card_a_progress
for each row execute function public._trg_normalize_card_progress_state();

create trigger trg_normalize_card_c_progress
before insert or update on public.card_c_progress
for each row execute function public._trg_normalize_card_progress_state();

-- While we're here: the refresh triggers had the same INSERT-only problem
-- (also confirmed via trigger inspection earlier). Fix those too so any
-- direct UPDATE/DELETE to progress or card rows correctly refreshes
-- cached deck counts, not just inserts.

drop trigger if exists trg_refresh_a on public.card_a_progress;
drop trigger if exists trg_refresh_c on public.card_c_progress;

create trigger trg_refresh_a
after insert or update or delete on public.card_a_progress
for each row execute function public._trg_card_progress_refresh();

create trigger trg_refresh_c
after insert or update or delete on public.card_c_progress
for each row execute function public._trg_card_progress_refresh();

-- Also clean up the duplicate insert-only triggers on cards_a/cards_c
-- found in the same inspection (trg_card_def_a + trg_cards_a doing the
-- same job twice on every insert).

drop trigger if exists trg_card_def_a on public.cards_a;
drop trigger if exists trg_card_def_c on public.cards_c;

drop trigger if exists trg_cards_a on public.cards_a;
drop trigger if exists trg_cards_c on public.cards_c;

create trigger trg_cards_a
after insert or update or delete on public.cards_a
for each row execute function public._trg_cards_refresh();

create trigger trg_cards_c
after insert or update or delete on public.cards_c
for each row execute function public._trg_cards_refresh();






--------------------------------------------------------------------


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
      count(*) filter (where suspended)::integer as suspended_count,
      max(last_studied)::date as last_reviewed
    from unified_cards
  )
  update public.decks d
  set
    cards_count = counts.total_count,
    new_count = counts.new_count,
    waiting_count = counts.waiting_count,
    due_count = counts.due_count,
    mastered_count = counts.mastered_count,
    suspended_count = counts.suspended_count,
    active_cards_count = counts.total_count - counts.suspended_count,
    last_reviewed = counts.last_reviewed,
    status = case
      when counts.total_count - counts.suspended_count > 0
        and counts.mastered_count = counts.total_count - counts.suspended_count
        then 'mastered'
      else 'learning'
    end
    /* 🌟 REMOVED: d.mastered_at column tracking assignment entirely */
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
      count(*) filter (where status = 'due' and not suspended)::integer as due_count,
      count(*) filter (where suspended)::integer as suspended_count
    from unified_cards
  )
  update public.daily_deck_stats dds
  set
    new_count = counts.new_count,
    waiting_count = counts.waiting_count,
    due_count = counts.due_count,
    suspended_count = counts.suspended_count,
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
        when cp.last_studied is null and coalesce(cp.repetitions, 0) = 0 and cp.due_date is null then 'new'
        when coalesce(cp.review_interval, 0) >= public.card_mastered_interval_days() then 'mastered'
        when cp.due_date is not null and cp.due_date <= now() then 'due'
        else 'waiting'
      end as status,
      coalesce(cp.review_interval, 0) as interval, -- 🌟 Track the interval length
      cp.last_studied
    from public.cards_a c
    left join public.card_a_progress cp
      on cp.card_id = c.id and cp.user_id = v_user_id
    where c.deck_id = p_deck_id

    union all

    select
      c.id,
      coalesce(cp.suspended, false) as suspended,
      case
        when cp.card_id is null then 'new'
        when cp.last_studied is null and coalesce(cp.repetitions, 0) = 0 and cp.due_date is null then 'new'
        when coalesce(cp.review_interval, 0) >= public.card_mastered_interval_days() then 'mastered'
        when cp.due_date is not null and cp.due_date <= now() then 'due'
        else 'waiting'
      end as status,
      coalesce(cp.review_interval, 0) as interval, -- 🌟 Track the interval length
      cp.last_studied
    from public.cards_c c
    left join public.card_c_progress cp
      on cp.card_id = c.id and cp.user_id = v_user_id
    where c.deck_id = p_deck_id
  ),
  counts as (
    select
      count(*)::integer as total_count,
      count(*) filter (where status = 'new' and not suspended)::integer as new_count,
      count(*) filter (where status = 'waiting' and not suspended)::integer as waiting_count,
      count(*) filter (where status = 'due' and not suspended)::integer as due_count,
      count(*) filter (where suspended)::integer as suspended_count,
      max(last_studied)::date as last_reviewed,
      
      -- 🌟 CALCULATE PROFICIENCY BUCKETS (Adjust the day thresholds if needed)
      count(*) filter (where interval > 0 and interval < 21 and not suspended)::integer as familiar_count,
      count(*) filter (where interval >= 21 and interval < 180 and not suspended)::integer as solid_count,
      count(*) filter (where interval >= 180 and not suspended)::integer as mastered_count
    from unified_cards
  )
  update public.decks d
  set
    cards_count = counts.total_count,
    new_count = counts.new_count,
    waiting_count = counts.waiting_count,
    due_count = counts.due_count,
    suspended_count = counts.suspended_count,
    active_cards_count = counts.total_count - counts.suspended_count,
    last_reviewed = counts.last_reviewed,
    
    -- 🌟 WRITE PROFICIENCY AGGREGATES TO THE PARENT DECK ROW
    familiar_count = counts.familiar_count,
    solid_count = counts.solid_count,
    mastered_count = counts.mastered_count,
    
    status = case
      when counts.total_count - counts.suspended_count > 0
        and counts.mastered_count = counts.total_count - counts.suspended_count
        then 'mastered'
      else 'learning'
    end
  from counts
  where d.id = p_deck_id;

  -- (Keep the secondary daily_deck_stats aggregate logic exactly the same below...)
  with unified_cards as (
    select
      coalesce(cp.suspended, false) as suspended,
      case
        when cp.card_id is null then 'new'
        when cp.last_studied is null and coalesce(cp.repetitions, 0) = 0 and cp.due_date is null then 'new'
        when coalesce(cp.review_interval, 0) >= public.card_mastered_interval_days() then 'mastered'
        when cp.due_date is not null and cp.due_date <= now() then 'due'
        else 'waiting'
      end as status
    from public.cards_a c
    left join public.card_a_progress cp on cp.card_id = c.id and cp.user_id = v_user_id
    where c.deck_id = p_deck_id
    union all
    select
      coalesce(cp.suspended, false) as suspended,
      case
        when cp.card_id is null then 'new'
        when cp.last_studied is null and coalesce(cp.repetitions, 0) = 0 and cp.due_date is null then 'new'
        when coalesce(cp.review_interval, 0) >= public.card_mastered_interval_days() then 'mastered'
        when cp.due_date is not null and cp.due_date <= now() then 'due'
        else 'waiting'
      end as status
    from public.cards_c c
    left join public.card_c_progress cp on cp.card_id = c.id and cp.user_id = v_user_id
    where c.deck_id = p_deck_id
  ),
  counts as (
    select
      count(*) filter (where status = 'new' and not suspended)::integer as new_count,
      count(*) filter (where status = 'waiting' and not suspended)::integer as waiting_count,
      count(*) filter (where status = 'due' and not suspended)::integer as due_count,
      count(*) filter (where suspended)::integer as suspended_count
    from unified_cards
  )
  update public.daily_deck_stats dds
  set
    new_count = counts.new_count,
    waiting_count = counts.waiting_count,
    due_count = counts.due_count,
    suspended_count = counts.suspended_count,
    review_available_count = greatest(dds.review_available_count, counts.due_count),
    learn_available_count = greatest(dds.learn_available_count, counts.new_count),
    updated_at = now()
  from counts
  where dds.user_id = v_user_id
    and dds.deck_id = p_deck_id
    and dds.date = v_today;
end;
$$;