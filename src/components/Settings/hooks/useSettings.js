import { supabase } from "../../../utils/supabaseClient";

/**
 * Persist the full avatar state to Supabase in one RPC call.
 *
 * @param {string}  profileId    - user UUID
 * @param {Array}   history      - upload history array
 * @param {string|null} activeUrl - currently active photo URL (null = icon mode)
 * @param {string}  icon         - letter, emoji, or "" (falls back to username initial)
 * @param {string}  color        - hex background color
 */
export async function persistAvatarState(
  profileId,
  history,
  activeUrl,
  icon,
  color,
) {
  await supabase.rpc("update_avatar_state", {
    p_user_id: profileId,
    p_avatar_url: activeUrl ?? null,
    p_avatar_history: history,
    p_avatar_icon: icon ?? "",
    p_avatar_color: color ?? "#6366f1",
  });
}
