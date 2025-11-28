importScripts("https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js");

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(clients.claim()));

firebase.initializeApp({
    apiKey: "AIzaSyA4ERWaxTCYUiEijuhdQITVsP_VlYrVXEU",
    authDomain: ".env/authDomain",
    projectId: "test-948ba",
    messagingSenderId: "214442102094",
    appId: "1:214442102094:web:844878f6a9c4080538e21f"
});

const messaging = firebase.messaging();

// 🔥 background 메시지는 로깅만 — 알림 절대 표시 X
messaging.onBackgroundMessage(payload => {
    console.log("[SW] background message:", payload);
});

// 🔥 push 이벤트에서도 알림 표시 금지
self.addEventListener("push", event => {
    console.log("[SW] push event:", event);
    // ❌ showNotification 없음!
});