/* js/modules/event-coupon.js */

// 1. 모듈 가져오기
import {initializeApp, getApps, getApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {getDatabase, ref, get, set, runTransaction } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { giveCoupon } from '../common/walletUtils.js';
import {getActiveNickname, getKoreanDate, getKoreanTimestamp, showAlert, closeAlert} from '../common/utils.js';

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

// ✅ 알림 모달 닫기 버튼
$(document).on("click", "#alertConfirmBtn", function () {
    closeAlert();
});

// 모듈 레벨 변수 (type="module"이라서 전역 오염 걱정 없음)
const MODULE_PATH = '../modules/';
const CSS_FILENAME = 'event-coupon.css';

// 2. CSS 동적 로드
function loadModuleCss() {
    // 중복 로드 방지
    if ($(`link[href*="${CSS_FILENAME}"]`).length > 0) return;

    const cssLink = $('<link>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: MODULE_PATH + CSS_FILENAME + '?v=' + new Date().getTime()
    });
    $('head').append(cssLink);
}

// 3. 캐릭터 생성 로직
function spawnCharacter() {
    // 이미 떠있으면 중단
    if ($('.event-coupon-character').length > 0) return;

// 캐릭터의 크기 (CSS와 동일하게)
    const charSize = 28;
    // 화면 끝에 너무 붙지 않게 최소한의 여백만 설정 (기존 80에서 축소)
    const margin = 20;

    // 화면의 전체 가용 범위 계산
    const windowWidth = $(window).width();
    const windowHeight = $(window).height();

    // 0 ~ (전체너비 - 캐릭터크기 - 여백) 사이에서 랜덤 좌표 생성
    const randomX = Math.floor(Math.random() * (windowWidth - charSize - (margin * 2))) + margin;
    const randomY = Math.floor(Math.random() * (windowHeight - charSize - (margin * 2))) + margin;

    const $char = $('<div class="event-coupon-character"></div>');
    $char.css({ top: randomY + 'px', left: randomX + 'px' });

    $char.on('click', handleCharacterClick);
    $('body').append($char);

    console.log('[그럴수이치] 이벤트 캐릭터 등장!');
}

// 4. 클릭 핸들러
async function handleCharacterClick() {
    const $this = $(this);

    if ($this.hasClass('is-clicked')) return;
    $this.addClass('is-clicked');

    // 요소 삭제 (애니메이션 시간)
    setTimeout(() => { $this.remove(); }, 1000);

    // 보상 지급 시작
    await processReward();
}

// 5. 보상 지급
async function processReward() {
    const nickname = getActiveNickname();
    const today = getKoreanDate();
    const ts = getKoreanTimestamp();

    try {
        // 지갑 유틸 함수 호출
        const success = await giveCoupon(nickname, 1, "이치를 찾아라");

        if (success) {
            // 1. DB에 기록 (서버/다른 기기 검증용)
            const logRef = ref(db, `coffeeWalletLogs/${nickname}/rewardIndex/randomEvent/${today}`);
            await set(logRef, ts);

            // 2. 로컬스토리지에 오늘 날짜 기록 (클라이언트 즉시 검증용)
            localStorage.setItem(`event_reward`, today);
            showAlert("🎉 춬하드려요~!<br>🎫을 획득했습니다!");
        }
    } catch (error) {
        console.error("보상 지급 중 에러:", error);
    }
}

// ==========================================
// 실행 진입점 (중복 수령 확인 후 캐릭터 등장)
// ==========================================
$(document).ready(async function() { // async 추가
    loadModuleCss();

    const today = getKoreanDate();

    const nickname = getActiveNickname();
    if (!nickname) return; // 로그인 안 되어 있으면 중단

    if (localStorage.getItem(`event_reward`) === today) {
        console.log("[이벤트] 오늘 이미 참여하여 캐릭터가 등장하지 않습니다.");
        return;
    }

    // 1. 현재 페이지 확인
    const currentPage = window.location.pathname.split("/").pop().replace(".html", "");
    const todayNum = new Date().getDate();
    const dayDigit = todayNum % 10;

    const eventSchedule = {
        1: 'layout', 2: 'levelup', 3: 'ranking', 4: 'barista',
        5: 'memory', 6: 'memoryRoom', 7: 'list', 8: 'shop',
        9: 'list', 0: 'list'
    };

    const targetPage = eventSchedule[dayDigit];

    // 2. 페이지 조건이 맞을 때만 DB 조회 시작
    if (targetPage === currentPage) {
        try {
            // 🔍 오늘 이미 보상을 받았는지 확인
            const logRef = ref(db, `coffeeWalletLogs/${nickname}/rewardIndex/randomEvent/${today}`);
            const snapshot = await get(logRef);

            if (snapshot.exists()) {
                localStorage.setItem(`event_reward`, today);
                console.log("[이벤트] 오늘 이미 보상을 획득하여 캐릭터가 등장하지 않습니다.");
                return;
            }

            // 3. 기록이 없을 때만 캐릭터 생성
            setTimeout(spawnCharacter, 1000);

        } catch (error) {
            console.error("[이벤트] 중복 체크 중 에러:", error);
        }
    }
});