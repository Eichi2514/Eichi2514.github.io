// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    set,
    query,
    orderByChild,
    equalTo,
    update
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase 설정
const firebaseConfig = {
    apiKey: ".env/apiKey",
    authDomain: ".env/authDomain",
    databaseURL: "https://test-948ba-default-rtdb.firebaseio.com",
    projectId: ".env/projectId",
    storageBucket: ".env/storageBucket",
    messagingSenderId: ".env/messagingSenderId",
    appId: ".env/appId",
    measurementId: ".env/measurementId"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const membersRef = ref(database, 'members');

const key = localStorage.getItem('nickname') || sessionStorage.getItem('nickname');
let author = null;

if (!key) {
    alert('로그인이 필요한 서비스 입니다');
    window.location.href = '/ascentlime.html';
}

$(document).ready(async function () {
    $('.loading-spinner').show();

    const memberId = await loginKeyCheckById();
    const $dayNamesContainer = $('.dayNames');
    const $daysContainer = $('.days');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    const firstDateOfMonth = new Date(year, month, 1);
    const lastDateOfMonth = new Date(year, month + 1, 0);
    const startWeekDay = firstDateOfMonth.getDay();
    const totalDaysInMonth = lastDateOfMonth.getDate();

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    // 주 이름 추가
    weekDays.forEach(function (dayLabel) {
        $dayNamesContainer.append(`<div class="day-name">${dayLabel}</div>`);
    });

    // 시작 전 빈칸 추가
    let daysHTML = '';
    for (let i = 0; i < startWeekDay; i++) {
        daysHTML += '<div></div>';
    }

    // 날짜 채우기
    for (let dateNum = 1; dateNum <= totalDaysInMonth; dateNum++) {
        const dateObj = new Date(year, month, dateNum);
        const dayOfWeek = dateObj.getDay();
        const isToday = dateNum === today;
        const paddedDate = dateNum.toString().padStart(2, '0');
        const paddedMonth = (month + 1).toString().padStart(2, '0');
        const fullDate = `${year}-${paddedMonth}-${paddedDate}`;

        const dayRef = ref(database, `dailyCheck/${memberId}/${fullDate}`);
        const snapshot = await get(dayRef);

        let checkMark = '';
        if (snapshot.exists()) {
            checkMark = '✔';
        } else if (isToday) {
            checkMark = '✔';
        }

        let weekClass = '';
        let rewardLabel = '';
        if (dayOfWeek === 0) {
            weekClass = 'sunday';
            rewardLabel = 'x2';
        } else if (dayOfWeek === 6) {
            weekClass = 'saturday';
            rewardLabel = 'x2';
        } else {
            weekClass = 'weekday';
        }

        const dayClass = `day ${weekClass}${isToday ? ' today' : ''}`;

        daysHTML += `
            <div class="${dayClass}">
                <div class="day-number">${paddedDate}</div>
                <img src="https://github.com/user-attachments/assets/ef864edf-f6ef-47f6-a824-538088dcb693" alt="캐시"/>
                <div class="check-mark">${checkMark}</div>
                <div class="double-reward">${rewardLabel}</div>
            </div>
        `;
    }

    $daysContainer.append(daysHTML);
    await dailyCheck();
    $('.loading-spinner').hide();
});

window.dailyCheck = async function () {
    const memberId = await loginKeyCheckById();

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;

    try {
        const dailyCheckRef = ref(database, `dailyCheck/${memberId}/${formattedDate}`);
        const snapshot = await get(dailyCheckRef);

        if (!snapshot.exists()) {
            await set(dailyCheckRef, true);
            await showDailyCheckResult();
        }
    } catch (error) {
        console.error("데이터 조회 중 오류 발생:", error);
    }
};

window.showDailyCheckResult = function () {
    const $calendar = $('.calendar');
    const today = new Date();
    const dayOfWeek = today.getDay();
    const newCash = (dayOfWeek === 0 || dayOfWeek === 6) ? 200 : 100;

    $calendar.append(`
        <div class="fireworks-wrapper">
            <div class="fireworks-container">
                ${[...Array(12)].map((_, i) => {
                    const x = Math.floor(Math.random() * 600) - 300;
                    const y = Math.floor(Math.random() * 600) - 300;
                    return `<div class="particle p${i + 1}" style="--x: ${x}px; --y: ${y}px;"></div>`;
                }).join('')}
            </div>
            <button class="fireworks-close close-button">✖</button>
            <div class="reward-message">출석 보상 ${newCash}원을 획득했습니다!</div>
        </div>
    `);

    getDailyCheckReward(newCash);
};

$(document).on('click', '.close-button', function () {
    $('.fireworks-wrapper').remove();
});

window.getDailyCheckReward = async function (newCash) {
    try {
        const queryRef = query(membersRef, orderByChild("key"), equalTo(key));
        const snapshot = await get(queryRef);

        if (snapshot.exists()) {
            const memberKey = Object.keys(snapshot.val())[0];
            const data = snapshot.val()[memberKey];


            if (data) {
                const updatedData = {
                    ...data,
                    cash: (data.cash || 0) + newCash,
                };

                await update(ref(database, `members/${memberKey}`), updatedData);
            }
        }
    } catch (error) {
        console.error("보상 획득 실패 : ", error);
    }
};
