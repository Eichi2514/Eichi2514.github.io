// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    query,
    orderByChild,
    equalTo,
    get,
    set,
    update,
    remove,
    child,
    onChildAdded,
    push
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
const friendsRef = ref(database, 'friends');

const key = localStorage.getItem('nickname');
let memberId = null;
let safeId = null;

if (key) {
    memberId = await loginKeyCheckById();
    safeId = memberId.toString();
}

$(document).on('keydown', 'input[name="friend"]', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        $('.search-btn').click();
    }
});

$(document).on('click', '.search-btn', async function () {
    const friend = $('input[name="friend"]').val().trim();

    if (!friend) {
        return
    }

    const $friendFormContainer = $('.friend-form-container');

    try {
        const snapshot = await get(membersRef);
        if (snapshot.exists()) {
            let foundUsers = [];

            snapshot.forEach(childSnapshot => {
                const nickname = childSnapshot.val().nickname;
                if (nickname && nickname.includes(friend)) {
                    foundUsers.push({
                        profileImageId: childSnapshot.val().profileImageId,
                        nickname: childSnapshot.val().nickname,
                        id: childSnapshot.val().id
                    });
                }
            });

            if (foundUsers.length > 0) {
                let resultMessage = foundUsers.map(user => `
                    <div class="user-card flex gap-2">
                        <img src="${profileImages[user.profileImageId]}" alt="프로필 이미지">
                        <div class="user-info">
                            <span class="friend-name">${user.nickname}</span>
                            <button type="button" class="btn friend-request-btn" data-id="${user.id}">친구요청</button>
                            <a class="btn visit-garden-btn" href="../garden/friendGarden.html?${user.id}">방문하기</a>
                        </div>
                    </div>
                `);

                $friendFormContainer.html(resultMessage);
            } else {
                $friendFormContainer.html("검색 결과가 없습니다.");
            }
        }
    } catch (error) {
        console.error("데이터 검색 오류:", error);
    }
});

$(document).on('click', '.friend-request-btn', async function (event) {
    event.preventDefault();
    const button = $(this);
    const id = button.data('id');

    if (!memberId) {
        alert("친구신청 중 오류가 발생하였습니다. 잠시후 다시 신청해주세요.");
        return;
    }

    if (safeId.includes(id)) {
        alert("본인에게는 친구신청을 할 수 없습니다.");
        return;
    }

    const [firstId, secondId] = [Number(safeId), Number(id)].sort((a, b) => a - b);
    const friendsRef = ref(database, `friends/${firstId}-${secondId}`);
    const friendRequestSnapshot = await get(friendsRef);

    if (friendRequestSnapshot.exists()) {
        alert("이미 친구 추가된 상태입니다.");
        return;
    }

    try {
        const friendRequestRef = ref(database, `notify/${id}/${safeId}`);
        const notificationSnapshot = await get(friendRequestRef);

        if (notificationSnapshot.exists()) {
            const isConfirm = confirm("현재 친구신청 진행 중입니다. 취소하시겠습니까?");
            if (isConfirm) {
                await remove(friendRequestRef);
            }
        } else {
            await set(friendRequestRef, true);
            alert("친구 신청이 완료되었습니다.");
        }
    } catch (error) {
        console.error("친구신청 중 오류 발생:", error);
        alert("친구신청 중 오류가 발생하였습니다. 잠시후 다시 신청해주세요.");
    } finally {
        button.prop('disabled', false);
    }
});

$(document).on('click', '.notify', async function (event) {
    event.preventDefault();
    $('body').append(`
        <div class="friend-bg">
            <div class="friend-box">
                <div class="friend-taps">
                    <button class="friend-tab friend-chat selected-tab">친구</button>
                    <button class="friend-tab friend-request">요청</button>
                    <button class="friend-tab friend-search">찾기</button>
                    <div class="close-btn">✖</div>
                </div>
                <div class="friend-container">
                </div>
            </div>
        </div>
    `);

    friendsList();
});

$(document).on('click', '.close-btn, .friend-chat, .friend-request, .friend-search', async function () {
    if ($(this).hasClass('close-btn')) {
        $('.friend-bg').remove();
    }

    $('.friend-tab').removeClass('selected-tab');
    $(this).addClass('selected-tab');

    if ($(this).hasClass('friend-chat')) {
        friendsList();
    } else if ($(this).hasClass('friend-request')) {
        notifyList();
    } else if ($(this).hasClass('friend-search')) {
        friendSearch();
    }

    this.blur();
});

async function friendsList() {
    const $friendContainer = $('.friend-container');
    try {
        const snapshot = await get(friendsRef);
        let friendCards = [];

        if (snapshot.exists()) {
            const friendsList = snapshot.val();
            const filteredFriends = Object.entries(friendsList)
                .filter(([key, value]) => key.startsWith(safeId) || key.endsWith(safeId))
                .map(async ([key, value]) => {
                    const parts = key.split('-');
                    const otherId = parts.find(part => part !== safeId);
                    const numericOtherId = Number(otherId);

                    const queryRef = query(membersRef, orderByChild("id"), equalTo(numericOtherId));
                    const userSnapshot = await get(queryRef);
                    if (userSnapshot.exists()) {
                        const users = userSnapshot.val();
                        const user = Object.values(users)[0];

                        friendCards.push(`
                            <div class="user-card flex gap-2">
                                <img src="${profileImages[user.profileImageId]}" alt="프로필 이미지">
                                <div class="user-info">
                                    <div>
                                        <span class="friend-name">${user.nickname}</span> |
                                        <button type="button" class="friend-delete-btn" data-id="${user.id}">X</button>
                                    </div>
                                    <button type="button" class="btn friend-chat-btn" data-id="${user.id}">1:1 채팅</button>
                                    <a class="btn visit-garden-btn" href="../garden/friendGarden.html?${user.id}">방문하기</a>
                                </div>
                            </div>
                        `);
                    }
                });
            await Promise.all(filteredFriends);
        }
    $friendContainer.html(`${friendCards.length > 0 ? friendCards.join('') : '<p>친구가 없습니다.</p>'}`);
    } catch (error) {
        console.error('친구 목록을 가져오는 데 오류가 발생했습니다:', error);
    }
}

async function notifyList() {
    const $friendContainer = $('.friend-container');
    let resultMessage = '';

    try {
        const friendRequestRef = ref(database, `notify/${safeId}`);
        const snapshot = await get(friendRequestRef);
        if (snapshot.exists()) {
            for (const [childId, childData] of Object.entries(snapshot.val())) {
                const childIdNumber = Number(childId);

                const queryRef = query(membersRef, orderByChild("id"), equalTo(childIdNumber));
                const userSnapshot = await get(queryRef);
                if (userSnapshot.exists()) {
                    const users = userSnapshot.val();
                    const user = Object.values(users)[0];

                    resultMessage += `
                        <div class="user-card flex gap-2">
                            <img src="${profileImages[user.profileImageId]}" alt="프로필 이미지">
                            <div class="user-info">
                                <span class="friend-name">${user.nickname}</span>
                                <button class="friend-accept-btn btn" data-id="${user.id}">수락</button>
                                <button class="friend-reject-btn btn" data-id="${user.id}">거절</button>
                            </div>
                        </div>
                    `;
                }
            }
        }
        $friendContainer.html(resultMessage);
    } catch (error) {
        console.error("데이터 검색 오류:", error);
    }
}

async function friendSearch() {
    const $friendContainer = $('.friend-container');
    event.preventDefault();

    $friendContainer.html(`
        <div>
            <input class="friend-input" name="friend"/>
            <button type="button" class="search-btn">검색</button>
        </div>
        <div class="popup-form-container friend-form-container">
        </div>
    `);
}

$(document).on('click', '.friend-accept-btn', async function (event) {
    event.preventDefault();
    const button = $(this);
    const id = button.data('id');

    if (!memberId) {
        alert("오류가 발생하였습니다. 잠시후 다시 신청해주세요.");
        return;
    }

    try {
        const friendRequestRef = ref(database, `notify/${safeId}/${id}`);
        const snapshot = await get(friendRequestRef);

        if (snapshot.exists()) {
            const [firstId, secondId] = [Number(safeId), Number(id)].sort((a, b) => a - b);
            const friendsRef = ref(database, `friends/${firstId}-${secondId}`);
            await set(friendsRef, true);
            await remove(friendRequestRef);
        }
    } catch (error) {
        console.error("오류 발생:", error);
        alert("오류가 발생하였습니다. 잠시후 다시 신청해주세요.");
    } finally {
        button.closest('.user-card').remove();
    }
});


$(document).on('click', '.friend-reject-btn', async function (event) {
    event.preventDefault();
    const button = $(this);
    const id = button.data('id');

    if (!memberId) {
        alert("reject 오류가 발생하였습니다. 잠시후 다시 신청해주세요.");
        return;
    }

    try {
        const friendRequestRef = ref(database, `notify/${safeId}/${id}`);
        const snapshot = await get(friendRequestRef);

        if (snapshot.exists()) {
            await remove(friendRequestRef);
        }
    } catch (error) {
        console.error("reject 오류 발생:", error);
        alert("reject 오류가 발생하였습니다. 잠시후 다시 신청해주세요.");
    } finally {
        button.closest('.user-card').remove();
    }
});


$(document).on('click', '.friend-delete-btn', async function (event) {
    event.preventDefault();
    const button = $(this);
    const id = button.data('id');

    if (!memberId) {
        alert("delete 오류가 발생하였습니다. 잠시후 다시 신청해주세요.");
        return;
    }

    try {
        const [firstId, secondId] = [Number(safeId), Number(id)].sort((a, b) => a - b);
        const friendsRef = ref(database, `friends/${firstId}-${secondId}`);
        const isConfirm = confirm("친구를 삭제하시겠습니까?");
        if (isConfirm) {
            await remove(friendsRef);
            button.closest('.user-card').remove();
        }
    } catch (error) {
        console.error("오류 발생:", error);
        alert("delete 오류가 발생하였습니다. 잠시후 다시 신청해주세요.");
    }
});

window.userName = function (id) {
    const queryRef = query(membersRef, orderByChild("id"), equalTo(id));
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

$(document).on('click', '.friend-chat-btn', async function (event) {
    const $friendContainer = $('.friend-container');
    event.preventDefault();
    const button = $(this);
    const id = button.data('id');

    if (!memberId) {
        alert("chat 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.");
        return;
    }

    const name = await userName(id);

    const [firstId, secondId] = [Number(memberId), Number(id)].sort((a, b) => a - b);
    const chatId = `${firstId}-${secondId}`;
    const friendChatsRef = ref(database, `friendChats/${chatId}`);

    $friendContainer.html(`
        <div>
            상대 : ${name}
        </div>
        <div class="popup-form-container friendChat-form-container chat${chatId}"></div>
        <div>
            <input class="friendChat-input chat-input-${chatId}" name="body"/>
            <button type="button" class="send-btn" data-chat="${chatId}">전송</button>
        </div>
    `);

    onChildAdded(friendChatsRef, async (data) => {
        const chatLog = data.val();
        const chatClass = chatLog.id === memberId ? 'myChat' : 'friendChat';
        const chatElement = `
            <div class="${chatClass}">
                ${chatLog.body}
            </div>
        `;
        const $friendChatFormContainer = $(`.chat${chatId}`);
        $friendChatFormContainer.append(chatElement);
        $friendChatFormContainer.scrollTop($friendChatFormContainer[0].scrollHeight);
    });
});

$(document).on('click', '.send-btn', async function () {
    const button = $(this);
    const chatId = button.data('chat');
    const inputField = $(`.chat-input-${chatId}`);
    const message = inputField.val().trim();

    if (!message) return;

    const [firstId, secondId] = chatId.split('-').map(Number);
    const friendChatsRef = ref(database, `friendChats/${chatId}`);

    const now = new Date();
    const formattedTime = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}.${String(now.getSeconds()).padStart(2, '0')}`;

    try {
        const newMessageRef = push(friendChatsRef);
        await set(newMessageRef, {
            id: memberId,
            body: message,
            timestamp: formattedTime
        });

        inputField.val('');
    } catch (error) {
        console.error("채팅 전송 중 오류 발생:", error);
    }
});