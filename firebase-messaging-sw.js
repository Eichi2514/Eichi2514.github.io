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

const PWA_START_URL = "/ilovecoffee/levelup/levelup.html";

const messaging = firebase.messaging();

// ✔ background 메시지
messaging.onBackgroundMessage(() => {});

// ✔ push 이벤트 (fallback)
self.addEventListener("push", event => {
    const payload = event.data?.json() || {};
    const d = payload.data || {};

    // ✔ OS가 notification을 이미 띄운 경우 → data-only로 들어오지 않음
    //   하지만 일부 기기에서는 data도 같이 들어오므로 type 체크 필요
    if (d.type !== "levelup-noti") {
        return; // 우리가 보내는 알림이 아닌 경우 무시
    }

    // ✔ OS가 숨긴 경우에만 fallback 알림을 띄움
    event.waitUntil(
        self.registration.showNotification(d.title, {
            body: d.body,
            icon: d.icon || "/favicon/Eichi2.png",
            badge: "/ilovecoffee/image/postsBtnImg.jpg",
            data: {
                url: d.url || PWA_START_URL   // 🔥 클릭 시 열릴 URL 전달
            }
        })
    );
});

// ✔ 알림 클릭 → PWA 실행
self.addEventListener("notificationclick", event => {
    const targetUrl = event.notification.data?.url || PWA_START_URL;
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {

            // 1) 이미 열려있는 PWA 창이 있으면 그 창으로 이동
            for (const client of clientList) {
                if (client.url.includes("/ilovecoffee/") && "focus" in client) {
                    return client.focus();
                }
            }

            // 2) 없다면 새 창(=PWA 앱) 열기
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});