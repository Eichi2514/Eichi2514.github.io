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

// 📌 background 메시지
messaging.onBackgroundMessage(() => {
});

// 📌 push 이벤트에서도 fallback 방지 + 동일 로직 적용
self.addEventListener("push", event => {
    let data = {};
    try {
        data = event.data?.json() || {};
    } catch(e) {}

    const n = data.notification;
    if (!n) return;

    event.waitUntil(
        self.registration.showNotification(n.title, {
            body: n.body,
            icon: n.icon || "/favicon/Eichi2.png",
            badge: "/ilovecoffee/image/postsBtnImg.jpg"
        })
    );
});