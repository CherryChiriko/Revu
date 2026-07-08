-- 1. New threshold functions — single source of truth, mirrored in JS MASTERY_THRESHOLDS
create or replace function public.card_solid_interval_days()
returns integer language sql immutable as $$ select 21; $$;

create or replace function public.card_mastered_interval_days()
returns integer language sql immutable as $$ select 90; $$;  -- was 180, now matches agreed 90

create or replace function public.card_mastered_min_reps()
returns integer language sql immutable as $$ select 4; $$;

grant execute on function public.card_solid_interval_days() to authenticated;
grant execute on function public.card_mastered_interval_days() to authenticated;
grant execute on function public.card_mastered_min_reps() to authenticated;

-- 2. Status trigger — mastery branch removed entirely, status is now pure queue-state
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
      when new.due_date is not null and new.due_date <= now()
        then 'due'
      else 'waiting'
    end;

  return new;
end;
$$;

-- 3. Constraints updated to match — 'mastered' removed as a status value
alter table public.card_a_progress drop constraint if exists card_a_progress_status_check;
alter table public.card_a_progress add constraint card_a_progress_status_check
  check (status in ('new', 'waiting', 'due'));

alter table public.card_c_progress drop constraint if exists card_c_progress_status_check;
alter table public.card_c_progress add constraint card_c_progress_status_check
  check (status in ('new', 'waiting', 'due'));

-- 4. Backfill existing rows that were stuck as 'mastered' under the old logic
update public.card_a_progress
set status = case
  when last_studied is null and coalesce(repetitions,0) = 0 and due_date is null then 'new'
  when due_date is not null and due_date <= now() then 'due'
  else 'waiting'
end
where not coalesce(suspended, false);

update public.card_c_progress
set status = case
  when last_studied is null and coalesce(repetitions,0) = 0 and due_date is null then 'new'
  when due_date is not null and due_date <= now() then 'due'
  else 'waiting'
end
where not coalesce(suspended, false);

-- 5. New deck columns for the depth breakdown
alter table public.decks
  add column if not exists familiar_count integer not null default 0,
  add column if not exists solid_count    integer not null default 0;



  ======================================================================================

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

  -- ── Deck-level counts (includes mastery depth) ──────────────────────────
  with unified_cards as (
    select
      c.id,
      coalesce(cp.suspended, false) as suspended,
      case
        when cp.card_id is null then 'new'
        when cp.last_studied is null and coalesce(cp.repetitions,0) = 0 and cp.due_date is null then 'new'
        when cp.due_date is not null and cp.due_date <= now() then 'due'
        else 'waiting'
      end as status,
      coalesce(cp.review_interval, 0) as review_interval,
      coalesce(cp.repetitions, 0) as repetitions,
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
        when cp.last_studied is null and coalesce(cp.repetitions,0) = 0 and cp.due_date is null then 'new'
        when cp.due_date is not null and cp.due_date <= now() then 'due'
        else 'waiting'
      end as status,
      coalesce(cp.review_interval, 0) as review_interval,
      coalesce(cp.repetitions, 0) as repetitions,
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
      count(*) filter (
        where not suspended and repetitions >= 1
          and review_interval < public.card_solid_interval_days()
      )::integer as familiar_count,
      count(*) filter (
        where not suspended
          and review_interval >= public.card_solid_interval_days()
          and not (review_interval >= public.card_mastered_interval_days() and repetitions >= public.card_mastered_min_reps())
      )::integer as solid_count,
      count(*) filter (
        where not suspended
          and review_interval >= public.card_mastered_interval_days()
          and repetitions >= public.card_mastered_min_reps()
      )::integer as mastered_count,
      max(last_studied)::date as last_reviewed
    from unified_cards
  )
  update public.decks d
  set
    cards_count = counts.total_count,
    new_count = counts.new_count,
    waiting_count = counts.waiting_count,
    due_count = counts.due_count,
    suspended_count = counts.suspended_count,
    familiar_count = counts.familiar_count,
    solid_count = counts.solid_count,
    mastered_count = counts.mastered_count,
    active_cards_count = counts.total_count - counts.suspended_count,
    last_reviewed = counts.last_reviewed,
    status = case
      when counts.total_count - counts.suspended_count > 0
        and counts.mastered_count = counts.total_count - counts.suspended_count
        then 'mastered'
      else 'learning'
    end,
    mastered_at = case
      when counts.total_count - counts.suspended_count > 0
        and counts.mastered_count = counts.total_count - counts.suspended_count
        then coalesce(d.mastered_at, now())
      else null
    end
  from counts
  where d.id = p_deck_id;

  -- ── daily_deck_stats availability counts (unchanged shape, 3-value status) ──
  with unified_cards as (
    select
      coalesce(cp.suspended, false) as suspended,
      case
        when cp.card_id is null then 'new'
        when cp.last_studied is null and coalesce(cp.repetitions,0) = 0 and cp.due_date is null then 'new'
        when cp.due_date is not null and cp.due_date <= now() then 'due'
        else 'waiting'
      end as status
    from public.cards_a c
    left join public.card_a_progress cp
      on cp.card_id = c.id and cp.user_id = v_user_id
    where c.deck_id = p_deck_id

    union all

    select
      coalesce(cp.suspended, false) as suspended,
      case
        when cp.card_id is null then 'new'
        when cp.last_studied is null and coalesce(cp.repetitions,0) = 0 and cp.due_date is null then 'new'
        when cp.due_date is not null and cp.due_date <= now() then 'due'
        else 'waiting'
      end as status
    from public.cards_c c
    left join public.card_c_progress cp
      on cp.card_id = c.id and cp.user_id = v_user_id
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


==========================================================================================

-- 1. Lifetime XP lives on profiles (persists across days, used for level calc)
alter table public.profiles
  add column if not exists lifetime_xp integer not null default 0;

-- 2. daily_user_stats.total_xp already exists — used for the "today"/weekly view

-- 3. update_streaks_after_session gains an xp_earned field per deck result
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

    -- (streak logic unchanged — same as before)
    select coalesce(y.deck_streak, 0) + 1
    into v_new_deck_streak
    from public.daily_deck_stats d
    left join public.daily_deck_stats y
      on y.user_id = d.user_id and y.deck_id = d.deck_id and y.date = v_yesterday
    where d.user_id = p_user_id and d.deck_id = r.deck_id and d.date = v_today
      and d.streak_state is distinct from 'active'
      and (d.cards_reviewed >= p_review_limit or d.cards_learned >= p_learn_limit);

    if v_new_deck_streak is not null then
      update public.daily_deck_stats d
      set deck_streak = v_new_deck_streak,
          max_streak = greatest(coalesce(d.max_streak, 0), v_new_deck_streak),
          streak_state = 'active',
          updated_at = now()
      where d.user_id = p_user_id and d.deck_id = r.deck_id and d.date = v_today
        and d.streak_state is distinct from 'active';
      v_global_completed := true;
    end if;

    perform public.refresh_deck_counts(r.deck_id, p_user_timezone);
    v_new_deck_streak := null;
  end loop;

  -- Apply accumulated XP: today's daily total + lifetime running total
  if v_total_xp > 0 then
    update public.daily_user_stats u
    set total_xp = coalesce(u.total_xp, 0) + v_total_xp,
        updated_at = now()
    where u.user_id = p_user_id and u.date = v_today;

    update public.profiles
    set lifetime_xp = lifetime_xp + v_total_xp
    where id = p_user_id;
  end if;

  -- (global streak logic unchanged — same as before)
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