import { supabase } from "../../../utils/supabaseClient";

// -- Shared helper: persist history + active URL to Supabase in one RPC call --
export async function persistAvatarState(profileId, history, activeUrl) {
  await supabase.rpc("update_avatar_history", {
    p_user_id: profileId,
    p_history: history,
    p_active_url: activeUrl ?? null,
  });
}
