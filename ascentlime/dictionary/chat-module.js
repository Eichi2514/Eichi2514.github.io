// Firebase SDK 불러오기,        get,            remove
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
    query,
    child,
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

// 채팅 데이터베이스 참조
const chatRef = ref(database, 'chats');
const membersRef = ref(database, 'members');
const weaponFindRef = ref(database, 'weaponFind');

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

window.userProfileImage = function (key) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));
    return get(queryRef)
        .then((snapshot) => {
            if (!snapshot.exists()) {
                console.log('해당 아이디를 찾을 수 없습니다.');
                return null;
            }

            const memberData = snapshot.val();
            const memberKey = Object.keys(memberData)[0];
            return memberData[memberKey].profileImageId;
        })
        .catch((error) => {
            console.error("로그인 아이디 확인 중 오류 발생:", error);
            return null;
        });
};


// 채팅 전송 함수 (전역 함수로 만들어야 함)
window.Chat__Write = async function (form) {

    const chatName = await userName(localStorage.getItem('nickname') || sessionStorage.getItem('nickname'));

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
    const chatName = await userName(localStorage.getItem('nickname') || sessionStorage.getItem('nickname'));

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

window.loginKeyCheckById = async function () {
    const loginKeyCheckByIdKey = localStorage.getItem('nickname') || sessionStorage.getItem('nickname');

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

window.characCheckMap = async function (memberKey) {
    const memberId = await loginKeyCheckById();
    const safeId = memberId.toString();
    const characRef = ref(database, `characs/${safeId}`);

    try {
        const snapshot = await get(characRef);
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.log("데이터가 존재하지 않습니다.");
        }
    } catch (error) {
        console.error("오류 발생:", error);
    }
};

window.getMobFind = function (key) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));
    return get(queryRef)
        .then((snapshot) => {
            if (!snapshot.exists()) {
                console.log('해당 아이디를 찾을 수 없습니다.');
                return null;
            }

            const memberData = snapshot.val();
            const memberKey = Object.keys(memberData)[0];
            return memberData[memberKey].mobFind;
        })
        .catch((error) => {
            console.error("로그인 아이디 확인 중 오류 발생:", error);
            return null;
        });
};

window.getWeaponFind = async function (memberKey) {
    const memberId = await loginKeyCheckById();
    const safeId = memberId.toString();
    const newWeaponFindRef = child(weaponFindRef, safeId);

    try {
        const snapshot = await get(newWeaponFindRef);
        if (!snapshot.exists()) return;

        const weaponData = snapshot.val();

        Object.keys(weaponData).forEach((key) => {
            if (weapon[key]) {
                $(`.weaponImage${key}`).attr('src', weapon[key]);
                $(`.weaponName${key}`).text(weaponNames[key]);
            }

            // 현재 순서에 해당하는 weapon__dictionary_card2 선택
            const indexNumber = parseInt(key, 10);
            const currentCard = $('.weapon__dictionary_card2').eq(indexNumber - 1);
            currentCard.css('cursor', 'url(../image/cursor/help.png) 92 92, auto');

            currentCard.append(`
                <div class="dictionary_body_text absolute">            
                    <div>${weaponNames[key]}</div>
                    데미지 ${Math.ceil(indexNumber / 10) * 10} <br>
                    사거리 ${key % 10 === 0 ? 12 : (key % 10) + 2}
                </div>
            `);
        });
    } catch (error) {
        console.error("무기 데이터를 가져오는 중 오류 발생:", error);
    }
};

async function profileUpdate() {
    const profileImageId = await userProfileImage(localStorage.getItem('nickname') || sessionStorage.getItem('nickname') || 1);
    const nickname = await userName(localStorage.getItem('nickname') || sessionStorage.getItem('nickname'));
    $('.profile-img').attr('src', profileImages[profileImageId]);
    $('.profile-nickname').text(nickname);
}

profileUpdate();

window.mobFindUpdate = function (key, floor) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));

    get(queryRef)
        .then((snapshot) => {
            if (!snapshot.exists()) return;

            const memberData = snapshot.val();
            const memberKey = Object.keys(memberData)[0];
            const currentMobFind = memberData[memberKey].mobFind || 0;

            if (currentMobFind < floor) {
                update(ref(database, `members/${memberKey}`), { mobFind: floor })
                    .catch((error) => console.error("mobFind 업데이트 중 오류 발생:", error));
            }
        })
        .catch((error) => console.error("로그인 아이디 확인 중 오류 발생:", error));
};