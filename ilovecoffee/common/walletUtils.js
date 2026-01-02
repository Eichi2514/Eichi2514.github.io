import {initializeApp, getApps, getApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {getDatabase, ref, set, runTransaction } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import {getKoreanTimestamp, showAlert} from "../common/utils.js";

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

/**
 *
 * result: 성공, 실패
 * time: 시간
 * action: 획득, 사용
 * asset: 쿠폰, h
 * amount: 금액
 * reason: 내용
**/
export async function writeWalletLog(nickname, result, time, action, asset, amount, reason) {
    try {
        const safeTimestamp = time.replaceAll(/[.:]/g, '_');
        const randomSuffix = Math.floor(Math.random() * 100);
        const logId = `${safeTimestamp}_${randomSuffix}`;

        // 🔑 action 기준으로 부호 결정
        let signedAmount = amount;
        if (action === "사용") {
            signedAmount = -amount;
        }

        const message =
            `${result} | ${time} | ${action} | ${asset} | ${signedAmount > 0 ? '+' : ''}${signedAmount} | ${reason}`;

        const logRef = ref(db, `coffeeWalletLogs/${nickname}/logs/${logId}`);
        await set(logRef, message);
    } catch (e) {
        console.error("wallet log write fail", nickname, e);
    }
}

export async function giveCoupon(nickname, amount, reason) {
    const ts = getKoreanTimestamp();

    const tx = await runTransaction(ref(db, `coffeeStore/${nickname}/wallet/coupon`), (cur) => (cur || 0) + amount);

    if (!tx.committed) {
        await writeWalletLog(nickname, "실패", ts, "획득", "쿠폰", amount, reason);
        showAlert("쿠폰 지급 중 오류가 발생했습니다.\n관리자에게 문의해주세요.");
        return false;
    }

    await writeWalletLog(nickname, "성공", ts, "획득", "쿠폰", amount, reason);
    return true;
}