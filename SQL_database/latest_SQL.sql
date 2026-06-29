-- ============================================================
-- Migration: profiles — study settings, display prefs, avatars
-- Run AFTER the canonical study-state migration.
-- ============================================================

-- ── 1. Profiles columns ──────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS review_limit       integer NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS learn_limit        integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS avatar_url         text,
  ADD COLUMN IF NOT EXISTS avatar_history     jsonb   NOT NULL DEFAULT '[]'::jsonb,
  -- 'monday' | 'sunday' — controls heatmap week start
  ADD COLUMN IF NOT EXISTS date_format        text    NOT NULL DEFAULT 'monday',
  -- 'large' | 'compact'
  ADD COLUMN IF NOT EXISTS default_deck_view  text    NOT NULL DEFAULT 'large',
  -- 'consistency' | 'studied' | 'learned'
  ADD COLUMN IF NOT EXISTS heatmap_metric     text    NOT NULL DEFAULT 'consistency';

-- ── 2. Avatar storage bucket (idempotent) ────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ── 3. Avatar bucket RLS ─────────────────────────────────────────────────────

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

-- ── 4. RPC: update study limits ──────────────────────────────────────────────
-- streak_goal removed — streak fires when either review_limit or learn_limit
-- is met in a session, so a separate goal slider is redundant.

CREATE OR REPLACE FUNCTION public.update_user_study_settings(
  p_user_id      uuid,
  p_review_limit integer,
  p_learn_limit  integer
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
    learn_limit  = p_learn_limit
  WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_user_study_settings(uuid, integer, integer)
  TO authenticated;

-- Drop old 3-param signature if it exists from a previous migration run
DROP FUNCTION IF EXISTS public.update_user_study_settings(uuid, integer, integer, integer);

-- ── 5. RPC: update display preferences ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_user_display_settings(
  p_user_id           uuid,
  p_date_format       text,
  p_default_deck_view text,
  p_heatmap_metric    text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    date_format       = p_date_format,
    default_deck_view = p_default_deck_view,
    heatmap_metric    = p_heatmap_metric
  WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_user_display_settings(uuid, text, text, text)
  TO authenticated;

-- ── 6. RPC: update avatar history ────────────────────────────────────────────
-- p_history: full replacement array, client owns ordering (max 5, desc by used_at)
-- p_active_url: currently active avatar URL; null when using emoji/initial

CREATE OR REPLACE FUNCTION public.update_avatar_history(
  p_user_id    uuid,
  p_history    jsonb,
  p_active_url text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    avatar_history = p_history,
    avatar_url     = p_active_url
  WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_avatar_history(uuid, jsonb, text)
  TO authenticated;