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
const membersRef = ref(database, 'members');

const key = localStorage.getItem('nickname');
let memberId = null;
let safeId = null;

if (key) {
    memberId = await loginKeyCheckById(key);
    safeId = memberId.toString();
}

$(document).on('click', '.friends', async function (event) {
    event.preventDefault();
    const button = $(this);
    const id = button.data('id');

    const friendsRef = ref(database, `friends`);

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
                                    <span class="friend-name">${user.nickname}</span>
                                    <button type="button" class="s-button friend-delete-btn" data-id="${user.id}">친구삭제</button>
                                    <a class="s-button visit-garden-btn" href="../garden/friendGarden.html?${user.id}">방문하기</a>
                                </div>
                            </div>
                        `);
                    }
                });
            await Promise.all(filteredFriends);
        }

        $('.body').append(`
            <div class="popup-bg friend-bg">
                <form class="friend-form" method="POST">
                    <div class="popup-box">
                        <div class="popup-title">친구 목록</div>
                        <div class="close-button">✖</div>
                        <div>
                            <input class="friend-input" name="friend"/>
                            <button type="button" class="s-button search-btn">검색</button>
                        </div>
                        <div class="popup-form-container friend-form-container">
                            ${friendCards.length > 0 ? friendCards.join('') : '<p>친구가 없습니다.</p>'}
                        </div>
                    </div>
                </form>
            </div>
        `);
    } catch (error) {
        console.error('친구 목록을 가져오는 데 오류가 발생했습니다:', error);
    }
});

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
                            <button type="button" class="s-button friend-request-btn" data-id="${user.id}">친구요청</button>
                            <a class="s-button visit-garden-btn" href="../garden/friendGarden.html?${user.id}">방문하기</a>
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
                    <button class="friend-tab friend-request selected-tab">요청</button>
                    <button class="friend-tab friend-chat">채팅</button>
                    <div class="close-btn">✖</div>
                </div>
                <div class="friend-container">
                </div>
            </div>
        </div>
    `);

    notifyList();
});

$(document).on('click', '.close-btn', async function (event) {
    event.preventDefault();

    $('.friend-bg').remove();
});

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
                                <button class="friend-accept-btn" data-id="${user.id}">수락</button>
                                <button class="friend-reject-btn" data-id="${user.id}">거절</button>
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