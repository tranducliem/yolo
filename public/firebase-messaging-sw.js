/* eslint-disable no-undef */
// Firebase Cloud Messaging Service Worker
// Scope: only handles push notifications, does NOT intercept fetch requests

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCgQU_bUvgtRrtd8lMgd-Qs0ZEjkxHkgzg",
  authDomain: "yolo-57585.firebaseapp.com",
  projectId: "yolo-57585",
  storageBucket: "yolo-57585.firebasestorage.app",
  messagingSenderId: "966281320831",
  appId: "1:966281320831:web:0f125ca78cc5026ebe224a",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "YOLO";
  const options = {
    body: payload.notification?.body || "",
    icon: "/icon-192x192.png",
    badge: "/icon-72x72.png",
    data: payload.data,
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.link || "/home";
  event.waitUntil(clients.openWindow(url));
});
