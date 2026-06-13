-- ============================================================
-- Migration: display preferences
-- Run in Supabase SQL editor
-- ============================================================

-- 1. Add display preference columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_format        text NOT NULL DEFAULT 'dd/mm/yyyy',
  ADD COLUMN IF NOT EXISTS default_deck_view  text NOT NULL DEFAULT 'grid',
  ADD COLUMN IF NOT EXISTS heatmap_metric     text NOT NULL DEFAULT 'consistency';

-- 2. RPC: upsert display settings from the client in one call
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
    date_format        = p_date_format,
    default_deck_view  = p_default_deck_view,
    heatmap_metric     = p_heatmap_metric
  WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_user_display_settings(uuid, text, text, text)
  TO authenticated;