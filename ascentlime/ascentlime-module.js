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
    child
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
const weaponFindRef = ref(database, 'weaponFind');

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
            console.log('loginKeyCheck) 해당 키가 존재하지 않습니다.');
            return null;
        }

        const memberData = snapshot.val();

        const memberKey = Object.keys(memberData)[0];
        return memberData[memberKey].nickname;
    } catch (error) {
        console.error("loginKeyCheck) 해당 키 확인 중 오류 발생:", error);
        return null;
    }
};

window.loginKeyCheckById = async function (key) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));
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

updateTop3Table();

function logoutAndClearData() {
    const localStorageKey = `update__2025-03-09`;

    if (localStorage.getItem(localStorageKey)) {
        return;
    }

    localStorage.removeItem('nickname');

    localStorage.setItem(localStorageKey, `1`);
}

logoutAndClearData();

// 로컬스토리지 기록 DB로 업데이트
window.saveLocalDataToDB = async function (memberKey) {
    const localStorageKey = `update__2025-03-09__${memberKey}`;
    console.log("saveLocalDataToDB 시작")
    if (localStorage.getItem(localStorageKey)) {
        return;
    }

    for (const key of Object.keys(localStorage)) {
        if (key === memberKey) {
            console.log(`캐릭터 정보 시작`);
            const newId = await loginKeyCheckById(memberKey);
            const safeId = newId.toString();
            const characString = localStorage.getItem(key);
            if (characString) {
                try {
                    const charac = JSON.parse(characString);

                    await update(ref(database, `characs/${safeId}`), charac);

                    localStorage.removeItem(key);
                } catch (error) {
                    console.error("JSON 파싱 오류:", error);
                }
            }
        } else if (key.startsWith(memberKey) && key.includes("MobFind")) {
            console.log(`MobFind 시작`);
            const mobFind = localStorage.getItem(key);
            const queryRef = query(membersRef, orderByChild("key"), equalTo(memberKey));
            const snapshot = await get(queryRef);

            if (snapshot.exists()) {
                const key = Object.keys(snapshot.val())[0];
                const data = snapshot.val()[key];

                if (data) {
                    const updatedData = {
                        ...data,
                        mobFind,
                    };

                    await update(ref(database, `members/${key}`), updatedData);

                    localStorage.removeItem(key);
                } else {
                    console.error("데이터를 찾을 수 없습니다:", data);
                }
            }
        } else if (key.startsWith(memberKey) && key.includes("playCount")) {
            console.log(`playCount 시작`);
            const playCount = localStorage.getItem(key);
            const queryRef = query(membersRef, orderByChild("key"), equalTo(memberKey));
            const snapshot = await get(queryRef);

            if (snapshot.exists()) {
                const key = Object.keys(snapshot.val())[0];
                const data = snapshot.val()[key];

                if (data) {
                    const updatedData = {
                        ...data,
                        playCount,
                    };

                    await update(ref(database, `members/${key}`), updatedData);

                    localStorage.removeItem(key);
                } else {
                    console.error("데이터를 찾을 수 없습니다:", data);
                }
            }
        } else if (key.startsWith(memberKey) && key.includes("weaponFind")) {
            const weaponFind = key.replace(`${memberKey}weaponFind`, '');
            const newId = await loginKeyCheckById(memberKey);
            const safeId = newId.toString();

            console.log(`weaponFind : ${weaponFind}`);

            const newWeaponFindRef = child(weaponFindRef, safeId);
            const currentDataSnapshot = await get(newWeaponFindRef);

            let updatedData = {};
            if (currentDataSnapshot.exists()) {
                const currentData = currentDataSnapshot.val();
                updatedData = {
                    ...currentData,
                    [`${weaponFind}`]: 1,
                };
            } else {
                updatedData = {
                    [`${weaponFind}`]: 1,
                };
            }

            await update(newWeaponFindRef, updatedData);

            localStorage.removeItem(key);
        }
    }

    localStorage.setItem(localStorageKey, `1`);
}