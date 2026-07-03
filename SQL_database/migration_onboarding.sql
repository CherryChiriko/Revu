-- Add persistent onboarding flag to profiles
alter table profiles
  add column if not exists has_completed_onboarding boolean not null default false;

-- Optional: backfill existing users as already onboarded,
-- so current users aren't shown the tutorial retroactively.
-- Comment this out if you'd rather everyone see it once.
update profiles
set has_completed_onboarding = true
where has_completed_onboarding = false;