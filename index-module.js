// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
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

const now = new Date();
const year = `${now.getFullYear()}`;
const formattedTime = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

// 조회수 증가 함수
function increaseHitCount(date) {
    const dbRef = ref(database, 'hitCounts/' + date);
    return get(dbRef).then((snapshot) => {
        let currentHitCount = 1;

        // 데이터가 존재하면 현재 조회수 읽기
        if (snapshot.exists()) {
            currentHitCount = snapshot.val();
        }

        // 조회수 증가
        const newHitCount = currentHitCount + 1;

        // 새로운 조회수 데이터 저장
        set(dbRef, newHitCount);  // 조회수를 Firebase에 업데이트

        return newHitCount; // 증가된 조회수 반환
    }).catch((error) => {
        console.error('조회수 업데이트 실패:', error);
    });
}

// 조회수 가져오기 함수
function getHitCount(date) {
    const dbRef = ref(database, 'hitCounts/' + date);
    return get(dbRef).then((snapshot) => {
        let currentHitCount = 0;

        // 데이터가 존재하면 현재 조회수 읽기
        if (snapshot.exists()) {
            currentHitCount = snapshot.val();
        }

        return currentHitCount; // 조회수 반환
    }).catch((error) => {
        console.error('조회수 조회 실패:', error);
    });
}

// 조회수 증가 함수 (오늘의 조회수 처리)
function increaseHitCountForToday() {
    const localStorageKey = formattedTime;

    // 오늘을 제외하고 키가 같은 해로 시작하면 삭제
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(year) && key !== localStorageKey) {
            localStorage.removeItem(key);
        }
    }

    // 이미 조회한 날짜는 다시 조회하지 않음
    if (localStorage.getItem(localStorageKey)) {
        getHitCount(localStorageKey).then((newViewCount) => {
            $('.view-count').text(`${newViewCount}`);
        }).catch((error) => {
            console.error('조회수 조회 실패:', error);
        });
        return;
    }

    // 조회수 증가 후 업데이트
    increaseHitCount(localStorageKey).then((newViewCount) => {
        $('.view-count').text(`${newViewCount}`);
    }).catch((error) => {
        console.error('조회수 업데이트 실패:', error);
    });

    // 조회수가 증가한 후 localStorage에 날짜 저장
    localStorage.setItem(localStorageKey, true);
}

increaseHitCountForToday();