// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    query,
    orderByChild,
    equalTo,
    limitToFirst,
    get,
    update,
    child,
    set
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

$('head').append('<link rel="stylesheet" href="../common/menu.css" type="text/css"/>');

$(document).ready(async function () {
    let notifyHtml = await notifyCheck() || '';

    let logoutLi = ``;

    if (localStorage.getItem('nickname')) {
        logoutLi = `
                    <li>
                        <div class="button submenu-item logout_bt">로그아웃</div>
                    </li>
                    `
    }
    $('.head-line').prepend(`
        <a class="logo" href="../../ascentlime.html">
            <img class="logo" src="../../favicon/AscentLime.png" alt="로고 이미지"/>
        </a>
    `);

    $('.head-line').append(`
        <div class="menu-bg">
            <div class="menu-container">
                ${notifyHtml}
                <ul class="menu">
                    <li class="submenu-container">
                        <div>
                            <div class="button">메 뉴</div>
                        </div>
                        <ul class="submenu">
                            <li>
                                <a href="../member/myPage.html">
                                    <div class="button submenu-item">내정보</div>
                                </a>
                            </li>
                            <li>
                                <a href="../chatBot/chatBot.html">
                                    <div class="button submenu-item">채팅봇</div>
                                </a>
                            </li>
                            <li>
                                <a href="../shop/shop.html">
                                    <div class="button submenu-item">상 점</div>
                                </a>
                            </li>
                            <li>
                                <a href="../garden/myGarden.html">
                                    <div class="button submenu-item">정 원</div>
                                </a>
                            </li>
                            <li>
                                <a href="../community/main.html">
                                    <div class="button submenu-item">전체게시판</div>
                                </a>
                            </li>
                            ${logoutLi}
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    `)
});

$(document).on('click', '.logout_bt', function () {
    localStorage.removeItem('nickname');
    location.reload();
});

window.loginKeyCheckById = async function () {
    const loginKeyCheckByIdKey = localStorage.getItem('nickname');

    if (!loginKeyCheckByIdKey) return;

    const queryRef = query(membersRef, orderByChild("key"), equalTo(loginKeyCheckByIdKey));
    try {
        const snapshot = await get(queryRef);
        if (!snapshot.exists()) {
            console.log('loginKeyCheckById) 해당 키가 존재하지 않습니다.');
            return null;
        }

        const memberData = snapshot.val();

        const memberKey = Object.keys(memberData)[0];
        return memberData[memberKey].id;
    } catch (error) {
        console.error("loginKeyCheckById) 해당 키 확인 중 오류 발생:", error);
        return null;
    }
};

window.notifyCheck = async function () {
    if (!localStorage.getItem('nickname')) return;

    const memberId = await loginKeyCheckById();

    try {
        const friendRequestRef = ref(database, `notify/${memberId}`);
        const snapshot = await get(friendRequestRef);

        if (snapshot.exists()) {
            return `
                <button class="notify menu-notify">
                    <img class="on" src="https://github.com/user-attachments/assets/a1ae55e9-6b3b-4732-a365-87bd473f7797" alt="알림 이미지"/>
                    <img class="off" src="https://github.com/user-attachments/assets/ee782062-cd53-4fc7-80a4-cf32827261d4" alt="알림 이미지"/>
                </button>
            `;
        } else {
            return `
                <div class="notify menu-notify">
                    <img class="on" src="https://github.com/user-attachments/assets/9b1987e4-8aac-479d-94de-aa386e00a394" alt="알림 이미지"/>
                    <img class="off" src="https://github.com/user-attachments/assets/dcf0de3f-321d-4889-b2af-14d285d7a8f5" alt="알림 이미지"/>
                </div>
            `;
        }
    } catch (error) {
        console.error("데이터 조회 중 오류 발생:", error);
    }
}

$('body').append('<script src="../common/profileImages.js"></script>');
$('body').append('<script type="module" defer src="../common/friends-module.js"></script>');