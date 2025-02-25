
// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    query,
    orderByChild,
    equalTo,
    limitToFirst,
    get
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
const logsRef = ref(database, 'logs');
const membersRef = ref(database, 'members');

window.updateTop3Table = async function () {
    try {
        const logsQuery = query(logsRef, limitToFirst(3));
        const snapshot = await get(logsQuery);

        if (!snapshot.exists()) {
            console.log('No data available');
            return;
        }

        const logs = [];
        snapshot.forEach((childSnapshot) => {
            logs.push(childSnapshot.val());
        });

        // 테이블 요소 선택
        const tableBody = document.querySelector(".TOP3_table tbody");

        // 기존 데이터 제거
        while (tableBody.rows.length > 1) {
            tableBody.deleteRow(1);
        }

        // 상위 3개 데이터 추가
        logs.forEach((log) => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = log.room === 0 ? (log.floor + 1) + '층' : log.floor + '층';
            row.insertCell().textContent = log.room === 0 ? '보스방' : log.room + '번방';
            row.insertCell().textContent = `${log.clearTime}초`;
        });

    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

window.loginIdCheck = async function (loginId) {
    const queryRef = query(membersRef, orderByChild("loginId"), equalTo(loginId));
    try {
        const snapshot = await get(queryRef);
        if (!snapshot.exists()) {
            console.log('아이디 또는 비밀번호가 잘못되었습니다.');
            return null;
        }

        const memberData = snapshot.val();

        const memberKey = Object.keys(memberData)[0];
        return memberData[memberKey];
    } catch (error) {
        console.error("로그인 아이디 확인 중 오류 발생:", error);
        return null;
    }
};

window.loginKeyCheck = async function (key) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));
    try {
        const snapshot = await get(queryRef);
        if (!snapshot.exists()) {
            console.log('아이디 또는 비밀번호가 잘못되었습니다.');
            return null;
        }

        const memberData = snapshot.val();

        const memberKey = Object.keys(memberData)[0];
        return memberData[memberKey].nickname;
    } catch (error) {
        console.error("로그인 아이디 확인 중 오류 발생:", error);
        return null;
    }
};

updateTop3Table();