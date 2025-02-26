// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    query,
    orderByChild,
    equalTo
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

async function getUserInfo(key) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));
    try {
        const snapshot = await get(queryRef);
        if (!snapshot.exists()) {
            console.log('해당 아이디를 찾을 수 없습니다.');
            return {nickname: null, id: null};
        }

        const memberData = snapshot.val();
        const memberKey = Object.keys(memberData)[0];
        return memberData[memberKey];
    } catch (error) {
        console.error("로그인 아이디 확인 중 오류 발생:", error);
        return {nickname: null, id: null};
    }
}

// 로그인된 사용자 확인
const key = localStorage.getItem('nickname');
let Authentication = null;
if (key) {
    const userInfo = await getUserInfo(key);
    $('.myPage_1 .myPage_body').text(userInfo.time.split(" ").slice(0, 3).join(" "));
    $('.myPage_2 .myPage_body').text(userInfo.name);
    $('.myPage_3 .myPage_body').text(userInfo.nickname);
    $('.myPage_4 .myPage_body').text(userInfo.loginId);
    Authentication = userInfo.loginPw;
} else {
    alert('로그인이 필요한 서비스 입니다');
    window.location.href = 'https://eichi2514.github.io/ascentlime';
}