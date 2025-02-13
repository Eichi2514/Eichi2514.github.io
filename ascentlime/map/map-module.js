import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    push,
    equalTo,
    onChildAdded,
    orderByChild,
    get,
    query
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

// 채팅 데이터베이스 참조
const chatRef = ref(database, 'chats');
const membersRef = ref(database, 'members');

window.userName = function (key) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));
    return get(queryRef)
        .then((snapshot) => {
            if (!snapshot.exists()) {
                console.log('해당 아이디를 찾을 수 없습니다.');
                return null;
            }

            const memberData = snapshot.val();
            const memberKey = Object.keys(memberData)[0];
            return memberData[memberKey].nickname;
        })
        .catch((error) => {
            console.error("로그인 아이디 확인 중 오류 발생:", error);
            return null;
        });
};

// 채팅 전송 함수 (전역 함수로 만들어야 함)
window.Chat__Write = async function (form) {

    const chatName = await userName(localStorage.getItem('nickname'));

    const now = new Date();
    const formattedTime = `${now.getFullYear()}년 ${String(now.getMonth() + 1).padStart(2, '0')}월 ${String(now.getDate()).padStart(2, '0')}일 ${String(now.getHours()).padStart(2, '0')}시 ${String(now.getMinutes()).padStart(2, '0')}분 ${String(now.getSeconds()).padStart(2, '0')}초`;
    let formData = $(form).serialize(); // 폼 데이터를 가져오기

    // 폼 데이터를 객체로 변환
    let formDataObj = {};
    formData.split('&').forEach(function (part) {
        let item = part.split('=');
        formDataObj[item[0]] = decodeURIComponent(item[1]);
    });

    // body 가 비어있는 경우, 채팅 전송을 막음
    if (!formDataObj.body || formDataObj.body.trim().length < 1) {
        return false; // body 가 비어있으면 폼 제출을 막음
    }

    // 새 채팅 로그를 Firebase 에 저장
    const newChatRef = push(chatRef);
    set(newChatRef, {
        name: chatName,
        body: formDataObj.body,
        time: formattedTime
    }).then(() => {
        $(form).find('input[name="body"]').val('');  // 채팅 입력창 비우기
    });

    return false; // 폼의 기본 제출 동작을 막기 위해 false 반환
};

onChildAdded(chatRef, async (data) => {
    const chatName = await userName(localStorage.getItem('nickname'));

    const chatLog = data.val();
    const chatClass = chatLog.name === chatName ? 'my_chat' : 'who_chat'; // 채팅 발신자에 따라 클래스 설정
    const chatElement = `
            <div class="${chatClass}">
                <div class="chat_writer">${chatLog.name}</div>
                <div class="chat_body">${chatLog.body}</div>
            </div>
        `;
    const $chat = $(".chat");
    $chat.append(chatElement);  // 채팅 내용을 페이지에 추가
    var chat = $chat;
    chat.scrollTop(chat[0].scrollHeight); // 새 메시지가 오면 스크롤 맨 아래로
});

window.saveFirebaseLogs = async function (charac, seconds) {
    const now = new Date();
    const formattedTime = `${now.getFullYear()}년 ${String(now.getMonth() + 1).padStart(2, '0')}월 ${String(now.getDate()).padStart(2, '0')}일 ${String(now.getHours()).padStart(2, '0')}시 ${String(now.getMinutes()).padStart(2, '0')}분 ${String(now.getSeconds()).padStart(2, '0')}초`;
    const logName = await userName(localStorage.getItem('nickname'));

    // 새 기록 생성
    const newLog = {
        name: logName,
        power: parseInt(charac.power, 10),
        weaponUpgrade: parseInt(charac.weaponUpgrade, 10),
        floor: parseInt(charac.floor, 10),
        room: parseInt(charac.room, 10),
        clearTime: parseInt(seconds, 10),
        time: formattedTime,
    };

    // 데이터베이스 참조
    const logsRef = ref(database, 'logs');

    try {
        // 기존 데이터 가져오기
        const snapshot = await get(logsRef);
        const logs = [];

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                logs.push(childSnapshot.val());
            });
        }

        // 새 데이터를 추가하고 정렬
        logs.push(newLog);
        logs.sort((a, b) => {
            if (b.floor !== a.floor) return b.floor - a.floor; // 층 내림차순
            if (b.room !== a.room) return b.room - a.room;     // 방 번호 내림차순
            return a.clearTime - b.clearTime;                  // 클리어 시간 오름차순
        });

        // 등수를 추가하여 로그에 포함시키기
        logs.forEach((log, index) => {
            log.id = index + 1; // 등수는 1부터 시작
        });

        // 기존 데이터를 삭제하지 않고 새 데이터를 추가
        const updates = {};
        logs.forEach((log, index) => {
            updates[`log${index}`] = log;  // 각 로그를 고유한 key로 설정
        });

        // Firebase에 업데이트된 로그 저장
        await set(logsRef, updates);

        console.log("로그가 성공적으로 업데이트되었습니다.");
    } catch (error) {
        console.error("로그 저장 중 오류 발생: ", error);
    }
};