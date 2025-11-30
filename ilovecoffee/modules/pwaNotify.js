import {initializeApp, getApps, getApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {getDatabase, ref, set, get} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import {getMessaging, onMessage, getToken} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging.js";

import {goToPage, getActiveNickname, showAlert, showConfirm} from "../common/utils.js";

const firebaseConfig = {
    apiKey: "AIzaSyA4ERWaxTCYUiEijuhdQITVsP_VlYrVXEU",
    authDomain: ".env/authDomain",
    databaseURL: "https://test-948ba-default-rtdb.firebaseio.com",
    projectId: "test-948ba",
    storageBucket: ".env/storageBucket",
    messagingSenderId: "214442102094",
    appId: "1:214442102094:web:844878f6a9c4080538e21f"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);

const messaging = getMessaging(app);

// 👉 Firebase 콘솔 Cloud Messaging에서 복사한 "Web Push 인증서 공개키"
const FCM_VAPID_PUBLIC_KEY = "BCzk05nOhj12ZxrKtJaM_VOYOI9i3X0YuQuGiSFLHS1Cu_kfWD7qk5wixj_g0cJE_9JtnLU83aRjrWxfd-i5sqA";

const WORKER_BASE = "https://worker-gentle-dream-dcc5.picon1317.workers.dev";

onMessage(messaging, (payload) => {
    console.log("📩 웹페이지에서 직접 메시지 수신:", payload);

    // 실제 알림 띄우기
    new Notification(payload.data.title, {
        body: payload.data.body,
        icon: payload.data.icon
    });
});

async function registerFcmToWorker(timeString, token) {
    const nickname = getActiveNickname();
    if(!nickname) return;
    try {
        // 알림 권한 요청
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            showAlert("알림 권한이 없습니다. 브라우저 설정에서 허용해주세요~!");
            return;
        }

        if (!token) {
            console.log("FCM 토큰 발급 실패");
            return;
        }

        console.log("FCM token:", token);

        // 토큰 + 시간 Cloudflare Worker로 전송
        await fetch(`${WORKER_BASE}/subscribe-fcm`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                token,
                time: timeString,
                nickname: nickname
            })
        });

        console.log("Worker에 FCM 토큰 + 시간 등록 완료");

    } catch (e) {
        console.error("FCM 등록 중 오류:", e);
    }
}

$(document).on("click", ".notifyBtn", async function () {
    const nickname = getActiveNickname();
    if(!nickname) return;
    $("#notifyModal").show();
});

// ✅ 닫기 버튼
$(document).on("click", ".closeBtn", function () {
    $(".login-overlay").hide();
});

$(document).ready(function () {
    const nickname = getActiveNickname();
    if (!nickname) return;

    const notifyRef = ref(db, `coffeeUsers/${nickname}/notify`);

    const $modalHour = $("#modalHour");
    const $modalMinute = $("#modalMinute");

    // ⭐ 0~23, 0~59 자동 생성
    for (let i = 0; i < 24; i++) {
        $modalHour.append(`<option value="${i}">${String(i).padStart(2, "0")}시</option>`);
    }

    for (let i = 0; i < 60; i += 30) {
        $modalMinute.append(`<option value="${i}">${String(i).padStart(2, "0")}분</option>`);
    }

    // ⭐ 저장된 시간 불러오기
    function loadNotifyTime() {
        get(notifyRef).then((snap) => {
            const data = snap.val();

            if (data?.disabled) {
                // 알림 끈 상태 → 자동 모달 X
                return;
            }

            if (data?.time) {
                const [h, m] = data.time.split(":");
                $("#modalHour").val(Number(h));
                $("#modalMinute").val(Number(m));
                return;
            }

            // ⭐ 최초 미설정 상태 → 자동 모달 OPEN
            $("#notifyModal").show();
        });
    }

    loadNotifyTime();
    checkAndUpdateToken();

    // ⭐ 저장하기 버튼
    $("#modalSaveBtn").on("click", async function () {
        let hour = String($("#modalHour").val()).padStart(2, "0");
        let minute = String($("#modalMinute").val()).padStart(2, "0");

        const timeString = `${hour}:${minute}`;

        const token = await getToken(messaging, {
            vapidKey: FCM_VAPID_PUBLIC_KEY
        });

        await set(notifyRef, {
            time: timeString,
            token: token
        });

        await registerFcmToWorker(timeString, token);

        showAlert(`알림 시간이 ${timeString}으로 저장되었습니다.`);
        $("#notifyModal").hide();
    });

    async function checkAndUpdateToken() {
        const snap = await get(notifyRef);

        const notifyData = snap.val();
        if (!notifyData || !notifyData.time) {
            // 시간조차 없으면 아무것도 안 함
            console.log("🔸 저장된 알림 설정 없음 — 무시");
            return;
        }

        // 현재 FCM 토큰 얻기
        const currentToken = await getToken(messaging, {
            vapidKey: FCM_VAPID_PUBLIC_KEY
        });

        if (!currentToken) {
            console.log("❌ 현재 토큰 발급 실패");
            return;
        }

        const savedToken = notifyData.token;

        // 🔍 비교
        if (savedToken !== currentToken) {
            console.log("🔄 FCM 토큰이 변경됨! Worker와 DB 업데이트 시작");

            // 1) DB에 새로운 토큰 저장
            await set(notifyRef, {
                time: notifyData.time,
                token: currentToken
            });

            // 2) Worker에도 전송
            await fetch(`${WORKER_BASE}/subscribe-fcm`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    token: currentToken,
                    time: notifyData.time,
                    nickname: nickname
                })
            });

            console.log("✨ 토큰 갱신 완료!");
        } else {
            console.log("✔ 토큰 동일 — Worker 업데이트 불필요");
        }
    }

    // ⭐ 알림 끄기
    $("#modalDisableBtn").on("click", async function () {
        showConfirm("정말 알림을 끌까요?", async (ok) => {
            if (ok) {
                // 1) Firebase DB notify 값 삭제
                await set(notifyRef, {disabled: true});

                // 2) Worker에서도 해당 nickname 구독 해제 요청(옵션)
                await fetch(`${WORKER_BASE}/unsubscribe-fcm`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({nickname})
                }).catch(() => {
                });

                showAlert("알림이 꺼졌습니다.");
                loadNotifyTime(); // UI 새로 반영
            }
            $("#notifyModal").hide();
        });
    });
});