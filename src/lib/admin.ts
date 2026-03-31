import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Verify admin access. Returns profile.id if admin, throws otherwise.
 */
export async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    throw new AdminError("Unauthorized", 401);
  }

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("id, is_admin")
    .eq("auth_id", authUser.id)
    .single();

  if (!profile?.is_admin) {
    throw new AdminError("Forbidden", 403);
  }

  return profile.id;
}

export class AdminError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
