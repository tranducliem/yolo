import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendPushNotification } from "@/lib/firebase/admin";

/**
 * Send a push notification to a user if they have an FCM token registered.
 * Call this after inserting a notification into the DB.
 */
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  link?: string,
): Promise<void> {
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("fcm_token")
    .eq("id", userId)
    .single();

  if (!user?.fcm_token) return;

  const success = await sendPushNotification(user.fcm_token, title, body, {
    link: link ?? "/notifications",
  });

  // Remove stale token
  if (!success) {
    await supabaseAdmin.from("users").update({ fcm_token: null }).eq("id", userId);
  }
}
