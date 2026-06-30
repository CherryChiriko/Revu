-- ============================================================
-- Migration: avatar_icon + avatar_color on profiles
-- Replaces update_avatar_history RPC with update_avatar_state
-- ============================================================

-- 1. Add new columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_icon  text,
  ADD COLUMN IF NOT EXISTS avatar_color text NOT NULL DEFAULT '#6366f1';

-- 2. Drop old RPC (signature changed — must drop before recreating)
DROP FUNCTION IF EXISTS public.update_avatar_history(uuid, jsonb, text);

-- 3. New unified RPC
--    p_avatar_url     → uploaded photo URL (null when using icon/initial)
--    p_avatar_history → jsonb array of past uploads (client manages ordering)
--    p_avatar_icon    → letter, emoji, or empty string (falls back to initial)
--    p_avatar_color   → hex color applied as background to icon/preset avatars
CREATE OR REPLACE FUNCTION public.update_avatar_state(
  p_user_id       uuid,
  p_avatar_url    text,
  p_avatar_history jsonb,
  p_avatar_icon   text,
  p_avatar_color  text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    avatar_url     = p_avatar_url,
    avatar_history = p_avatar_history,
    avatar_icon    = p_avatar_icon,
    avatar_color   = p_avatar_color
  WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_avatar_state(uuid, text, jsonb, text, text)
  TO authenticated;