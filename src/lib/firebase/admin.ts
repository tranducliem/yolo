import admin from "firebase-admin";
import path from "path";
import fs from "fs";

function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin;
  }

  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    path.join(process.cwd(), "secrets", "firebase-service-account.json");

  if (!fs.existsSync(serviceAccountPath)) {
    console.warn("[Firebase Admin] Service account file not found:", serviceAccountPath);
    return null;
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return admin;
}

const firebaseAdmin = getFirebaseAdmin();

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<boolean> {
  if (!firebaseAdmin) {
    console.warn("[FCM] Firebase Admin not initialized, skipping push");
    return false;
  }

  try {
    await firebaseAdmin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: data ?? {},
      webpush: {
        headers: { Urgency: "high" },
        notification: {
          icon: "/icon-192x192.png",
          badge: "/icon-72x72.png",
        },
      },
    });
    return true;
  } catch (error) {
    const err = error as { code?: string };
    if (
      err.code === "messaging/invalid-registration-token" ||
      err.code === "messaging/registration-token-not-registered"
    ) {
      // Token is stale — caller should remove it from DB
      return false;
    }
    console.error("[FCM] Send error:", error);
    return false;
  }
}

export async function sendPushToMultiple(
  fcmTokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<string[]> {
  if (!firebaseAdmin || fcmTokens.length === 0) return [];

  const message = {
    notification: { title, body },
    data: data ?? {},
    webpush: {
      headers: { Urgency: "high" },
      notification: {
        icon: "/icon-192x192.png",
        badge: "/icon-72x72.png",
      },
    },
  };

  const response = await firebaseAdmin.messaging().sendEachForMulticast({
    tokens: fcmTokens,
    ...message,
  });

  // Return stale tokens to remove
  const staleTokens: string[] = [];
  response.responses.forEach((r, i) => {
    if (
      r.error?.code === "messaging/invalid-registration-token" ||
      r.error?.code === "messaging/registration-token-not-registered"
    ) {
      staleTokens.push(fcmTokens[i]);
    }
  });

  return staleTokens;
}
