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
const memberId = await loginKeyCheckById(key);
const safeId = memberId.toString();

$(document).on('click', '.friends', async function (event) {
    event.preventDefault();
    const button = $(this);
    const id = button.data('id');

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
                    </div>
                </div>
            </form>
        </div>
    `);
});

$(document).on('keydown', 'input[name="friend"]', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        $('.search-btn').click();
    }
});

$(document).on('click', '.search-btn', async function () {
    const friend = $('input[name="friend"]').val().trim();

    if(!friend) {
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

    try {
        const friendRequestRef = ref(database, `notify/${id}/${safeId}`);
        const snapshot = await get(friendRequestRef);

        if (snapshot.exists()) {
            const isConfirm = confirm("현재 친구신청 진행 중입니다. 취소하시겠습니까?")
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