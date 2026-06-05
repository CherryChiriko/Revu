-- ============================================================
-- Migration: per-user study settings & avatar
-- Run this in Supabase SQL editor
-- ============================================================
 
-- 1. Add study-limit and avatar columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS review_limit  integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS learn_limit   integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS streak_goal   integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS avatar_url    text;
 
-- 2. Storage bucket for avatars (idempotent)
-- Run this once. If the bucket already exists this is a no-op.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
 
-- 3. RLS policy: each user can only read/write their own avatar
-- (skip if you already have policies on this bucket)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'avatars: owner read-write'
  ) THEN
    CREATE POLICY "avatars: owner read-write"
      ON storage.objects
      FOR ALL
      TO authenticated
      USING  (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
      WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END;
$$;
 
-- 4. Helper RPC: upsert study-settings from the client in one call
CREATE OR REPLACE FUNCTION public.update_user_study_settings(
  p_user_id    uuid,
  p_review_limit integer,
  p_learn_limit  integer,
  p_streak_goal  integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    review_limit = p_review_limit,
    learn_limit  = p_learn_limit,
    streak_goal  = p_streak_goal
  WHERE id = p_user_id;
END;
$$;
 
GRANT EXECUTE ON FUNCTION public.update_user_study_settings(uuid, integer, integer, integer)
  TO authenticated;
 

