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
    if (localStorage.getItem(localStorageKey)) {
        return;
    }
    alert('DB 이전 작업으로 인해\n현재 캐릭터 정보 업데이트 중입니다.\n업데이트는 2025년 03월 09일 이후 1계정당 최초 1회만 진행되며,\n진행 중 페이지를 닫거나 컴퓨터를 종료하면\n데이터가 손실될 수 있습니다.\n"확인"을 클릭한 후 잠시만 기다려 주세요.');
    for (const key of Object.keys(localStorage)) {
        if (key === memberKey) {
            const memberId = await loginKeyCheckById(memberKey);
            const safeId = memberId.toString();
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
            const memberId = await loginKeyCheckById(memberKey);
            const safeId = memberId.toString();

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

window.characCheck = async function (memberKey) {
    const memberId = await loginKeyCheckById(memberKey);
    const safeId = memberId.toString();
    const characRef = ref(database, `characs/${safeId}`);

    try {
        const characSnapshot = await get(characRef);
        if (!characSnapshot.exists()) {
            const charac = {
                name: memberKey,
                floor: 1,
                room: 0,
                hp: 100,
                power: 0,
                speed: 50,
                weaponId: 1,
                weaponUpgrade: 0,
                clearTime: 0
            };

            await set(characRef, charac);
            await weaponFindUpdate(memberKey, 1);
            await playCountUpdate(memberKey);

            alert('처음 오셨군요 화면에 보이는 슬라임에 마우스를 올려보세요!');
        }
    } catch (error) {
        console.error("오류 발생:", error);
    }
};

window.weaponFindUpdate = async function (memberKey, weaponNum) {
    const memberId = await loginKeyCheckById(memberKey);
    const safeId = memberId.toString();
    const newWeaponFindRef = child(weaponFindRef, safeId);
    const currentDataSnapshot = await get(newWeaponFindRef);

    let updatedData = {};
    if (currentDataSnapshot.exists()) {
        const currentData = currentDataSnapshot.val();

        if (!currentData.hasOwnProperty(`${weaponNum}`)) {
            updatedData = {
                ...currentData,
                [`${weaponNum}`]: 1,
            };
        }
    } else {
        updatedData = {
            [`${weaponNum}`]: 1,
        };
    }

    await update(newWeaponFindRef, updatedData);
}

window.playCountUpdate = async function (memberKey) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(memberKey));
    const snapshot = await get(queryRef);

    if (snapshot.exists()) {
        const key = Object.keys(snapshot.val())[0];
        const data = snapshot.val()[key];

        if (data) {
            const updatedData = {
                ...data,
                playCount: (data.playCount || 0) + 1,
            };

            await update(ref(database, `members/${key}`), updatedData);
        } else {
            console.error("데이터를 찾을 수 없습니다:", data);
        }
    }
}