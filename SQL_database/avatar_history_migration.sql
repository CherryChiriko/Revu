-- ============================================================
-- Migration: avatar upload history
-- Add avatar_history column to profiles
-- Run in Supabase SQL editor
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_history jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Each element shape:
-- { "url": "https://...", "path": "uuid/avatar_1234.jpg", "used_at": "2026-01-01T00:00:00Z" }
-- Ordered by used_at DESC, max 5 entries enforced client-side + in the RPC below.

-- ── RPC: atomically update avatar state ─────────────────────────────────────
-- Called on upload (new entry), on select-from-history (bump used_at),
-- and on remove (delete entry). The client handles Storage deletion separately.

CREATE OR REPLACE FUNCTION public.update_avatar_history(
  p_user_id       uuid,
  p_history       jsonb,   -- full replacement array (client owns ordering logic)
  p_active_url    text     -- current active avatarUrl (null = emoji/initial)
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

-- Make sure avatar_url column exists (added in previous migration, idempotent)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;