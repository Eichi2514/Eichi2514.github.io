importScripts("https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyA4ERWaxTCYUiEijuhdQITVsP_VlYrVXEU",
    authDomain: ".env/authDomain",
    projectId: "test-948ba",
    messagingSenderId: "214442102094",
    appId: "1:214442102094:web:844878f6a9c4080538e21f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("백그라운드 메시지 수신:", payload);

    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/favicon/Eichi2.png"
    });
});

// 브라우저 DevTools 테스트용 일반 푸시 이벤트 처리
self.addEventListener("push", function(event) {
    console.log("🔥 일반 push 이벤트 수신:", event);

    let data = {};
    try {
        data = event.data.json();
    } catch (e) {
        data = { title: "테스트 푸시", body: event.data.text() };
    }

    const title = data.title || "푸시 알림";
    const body = data.body || "내용 없음";

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: "/favicon/Eichi2.png"
        })
    );
});