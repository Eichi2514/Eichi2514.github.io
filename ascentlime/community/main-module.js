// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    query,
    orderByChild,
    orderByKey,
    equalTo,
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
const articlesRef = ref(database, 'articles');
const membersRef = ref(database, 'members');
const repliesRef = ref(database, 'replies')
const weaponFindRef = ref(database, 'weaponFind');

const boardName = ['오류', '공지', '자유', 'Q&A'];
const boardFullName = ['내가 작성한 글', '공지사항', '자유 게시판', 'Q&A'];

const urlParams = new URLSearchParams(window.location.search);
let page = parseInt(urlParams.get('page')) || 1;
let boardId = parseInt(urlParams.get('boardId')) || '';
let category = urlParams.get('category') || 'title';
let word = urlParams.get('word') || '';

$(document).ready(function () {
    if (category) $('.search-category').val(category);
    if (word) $('.search-input').val(word);
});

if (boardId === 10) $('.board-title').text(boardFullName[0]);
else if (boardId >= 0) $('.board-title').text(boardFullName[boardId]);

let lastPage = 1;  // 전역 lastPage 변수

window.loginIdCheck = async function (loginId) {
    const queryRef = query(membersRef, orderByChild("loginId"), equalTo(loginId));
    try {
        const snapshot = await get(queryRef);

        if (!snapshot.exists()) {
            console.log('해당 아이디를 찾을 수 없습니다.');
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
            console.log('해당 아이디를 찾을 수 없습니다.');
            return null;
        }

        const memberData = snapshot.val();
        const memberKey = Object.keys(memberData)[0];
        return {
            nickname: memberData[memberKey].nickname,
            profileImageId: memberData[memberKey].profileImageId
        };
    } catch (error) {
        console.error("로그인 아이디 확인 중 오류 발생:", error);
        return null;
    }
}

window.profileImageIdGet = async function (author) {
    const queryRef = query(membersRef, orderByChild("nickname"), equalTo(author));
    try {
        const snapshot = await get(queryRef);

        if (!snapshot.exists()) {
            console.log('해당 아이디를 찾을 수 없습니다.');
            return null;
        }

        const memberData = snapshot.val();
        const memberKey = Object.keys(memberData)[0];
        return memberData[memberKey].profileImageId;

    } catch (error) {
        console.error("아이디 확인 중 오류 발생:", error);
        return null;
    }
}

// 로그인된 사용자 확인
const key = localStorage.getItem('nickname') || sessionStorage.getItem('nickname');
let info = null;
let nickname = null;
if (key) {
    info = await loginKeyCheck(key);
    nickname = info.nickname;
    let profileImageId = info.profileImageId !== undefined ? info.profileImageId : 1;
    $('.profile-photo').attr('src', profileImages[profileImageId]);
    $('.current-profile-img').attr('src', profileImages[profileImageId]);
    $('.profile-image-name').text(profileImageNames[profileImageId])
    $('.profile-image' + profileImageId).addClass('border');
    $('.achieved-status').text(await achievedStatusText(profileImageId));
    $('.nickname').text(nickname);
    profileImageContainer();
}

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

/*
function getWeaponCount() {
    let weaponCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
        let storageKey = localStorage.key(i);
        if (storageKey.startsWith(key + 'weaponFind')) {
            weaponCount++;
        }
    }
    return weaponCount;
}
*/

async function getWeaponCount() {
    const memberId = await loginKeyCheckById(localStorage.getItem('nickname') || sessionStorage.getItem('nickname'));
    const safeId = memberId.toString();
    const newWeaponFindRef = child(weaponFindRef, safeId);

    try {
        const snapshot = await get(newWeaponFindRef);
        if (!snapshot.exists()) return 0; // 데이터가 없으면 0 반환

        return Object.keys(snapshot.val()).length; // 데이터 개수 반환
    } catch (error) {
        console.error("무기 개수를 가져오는 중 오류 발생:", error);
        return 0;
    }
}

async function getPlayCount() {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(localStorage.getItem(`nickname`) || sessionStorage.getItem(`nickname`)));
    try {
        // Firebase에서 데이터를 비동기적으로 가져오기
        const snapshot = await get(queryRef);

        if (snapshot.exists()) {
            const key = Object.keys(snapshot.val())[0];
            const data = snapshot.val()[key];
            return data.playCount || 0;
        }
        return null;
    } catch (error) {
        console.error("Error fetching data: ", error);
        return null;
    }
}

async function getClearStatusText(profileImageId) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(localStorage.getItem(`nickname`) || sessionStorage.getItem(`nickname`)));
    try {
        // Firebase에서 데이터를 비동기적으로 가져오기
        const snapshot = await get(queryRef);

        if (snapshot.exists()) {
            const key = Object.keys(snapshot.val())[0];
            const data = snapshot.val()[key];
            const mobFindLog = data.mobFind;

            const targetFloor = (profileImageId - 3) * 10;

            if (mobFindLog < targetFloor) {
                return `${targetFloor}층 클리어 : ${mobFindLog} / ${targetFloor}층`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error fetching data: ", error);
        return null;
    }
}

async function achievedStatusText(profileImageId) {
    if (profileImageId > 3) {
        let statusText = null;

        if (profileImageId <= 8) {
            statusText = await getClearStatusText(profileImageId);
        } else if (profileImageId === 9) {
            let weaponCount = await getWeaponCount();
            if (weaponCount < 30) {
                statusText = `무기 컬렉션 : ${weaponCount} / 30종 획득`;
            }
        } else if (profileImageId === 10) {
            let weaponCount = await getWeaponCount();
            if (weaponCount < 70) {
                statusText = `무기 컬렉션 : ${weaponCount} / 70종 획득`;
            }
        } else if (profileImageId === 11) {
            let playCount = await getPlayCount();
            if (playCount < 100) {
                statusText = `게임 플레이 : ${playCount} / 100회`;
            }
        } else if (profileImageId === 12) {
            statusText = '초보 등반자 (여) 구매 0 / 1';
        } else {
            statusText = '출시 예정';
        }

        return statusText || '획득 완료';
    }
    return '획득 완료';
}

function profileImageContainer() {
    for (let i = 1; i < profileImages.length - 1; i++) {
        $('.profile-image-container').append(`
            <img class="profile-image${i}" src="${profileImages[i]}" alt="프로필 이미지">
        `);
    }
}

const $profileBg = $(".profile-bg");

$(".profile-photo").click(async function () {
    $profileBg.removeClass('hidden');
});

for (let i = 1; i <= 12; i++) {
    $('.profile-image' + i).on('click', async function () {
        $('.profile-image-container img').removeClass('border');
        $(this).addClass('border');

        $('.current-profile-img').attr('src', profileImages[i]);

        const statusText = await achievedStatusText(i);
        $('.achieved-status').text(statusText);
        $('.profile-image-name').text(profileImageNames[i]);

        const $profileChangeButton = $('.profile-change-button');

        if (statusText !== '획득 완료') {
            $profileChangeButton.addClass('hidden');
        } else {
            $profileChangeButton.removeClass('hidden');

            // 선택된 프로필 ID 저장
            const selectedProfileId = i;

            // 기존 클릭 이벤트 제거 후 새로운 이벤트 등록
            $profileChangeButton.off('click').on('click', async function () {
                const queryRef = query(membersRef, orderByChild("key"), equalTo(key));

                const snapshot = await get(queryRef);

                let snapshotKey = null;
                snapshot.forEach(childSnapshot => {
                    snapshotKey = childSnapshot.key;
                });

                try {
                    await update(ref(database, `members/${snapshotKey}`), {
                        profileImageId: selectedProfileId
                    });

                    $('.profile-photo').attr('src', profileImages[i]);
                    $profileBg.addClass('hidden');
                    // console.log("프로필 이미지 변경 완료:", selectedProfileId);
                } catch (error) {
                    console.error("로그인 아이디 확인 중 오류 발생:", error);
                }
            });
        }
    });
}

const $logout = $(".logout");
const $loginBg = $(".login-bg");

$logout.click(async function () {
    $loginBg.removeClass('hidden');
});

$('.close-button').click(async function () {
    $loginBg.addClass('hidden');
    $profileBg.addClass('hidden');
});

// 페이지네이션 및 데이터 표시를 위한 쿼리
async function getLogsQuery(page, boardId) {
    let queryRef;

    if (boardId === '') {
        // 모든 게시글 가져오기 (저장된 순서대로)
        queryRef = query(articlesRef, orderByKey());
    } else if (boardId === 10) {
        // 내가 쓴 글만 가져오기
        queryRef = query(articlesRef, orderByChild("author"), equalTo(nickname));
    } else if (boardId > 0) {
        // 특정 boardId의 글만 가져오기
        queryRef = query(articlesRef, orderByChild("boardId"), equalTo(boardId));
    }
    return queryRef;
}

// Firebase에서 전체 로그 개수 계산 후 페이지네이션 업데이트
get(articlesRef).then((snapshot) => {
    const data = snapshot.val();
    if (data) {
        const totalLogsCount = Object.keys(data).length; // 총 게시글 개수
        lastPage = Math.ceil(totalLogsCount / 10.0);

        // 페이지 값 조정
        if (page < 1) page = 1;
        else if (page > lastPage) page = lastPage;

        // 페이지네이션 업데이트
        const paginationElement = document.querySelector('.pagination');
        if (paginationElement) {
            updatePagination(); // 페이지네이션 업데이트 함수 호출
        }

        // 현재 페이지의 게시글 로드
        loadPosts(boardId);  // 게시글 로드 함수 호출
    }
}).catch((error) => {
    console.error("전체 로그 개수 가져오기 오류: ", error);
});

window.loadPosts = async function (boardId) {
    const $contentDiv = $(".content");
    if ($contentDiv.length === 0) {
        console.error("게시글을 표시할 요소가 존재하지 않습니다.");
        return;
    }

    try {
        const queryRef = await getLogsQuery(page, boardId);
        if (!queryRef) return;

        const snapshot = await get(queryRef);
        if (!snapshot.exists()) {
            await showEmptyMessage($contentDiv[0]);
            return;
        }

        const rawArticles = Object.entries(snapshot.val()).map(([key, article]) => ({
            key,
            ...article
        }));

        // 검색 필터 처리
        let filteredArticles = [...rawArticles];
        if (word && category) {
            filteredArticles = filteredArticles.filter(article => {
                if (category === "title") return article.title.includes(word);
                if (category === "author") return article.author.includes(word);
                if (category === "body") return article.body.includes(word);
                return true;
            });
        }

        if (filteredArticles.length === 0) {
            await showEmptyMessage($contentDiv[0]);
            return;
        }

        // 페이지네이션 계산
        if (boardId !== "") {
            lastPage = Math.ceil(filteredArticles.length / 10);
            page = Math.max(1, Math.min(page, lastPage));
            const $paginationElement = $('.pagination');
            if ($paginationElement.length) await updatePagination();
        }

        // 정렬 + 페이지 슬라이싱
        const parseDate = (dateStr) => {
            const regex = /(\d{4})년 (\d{2})월 (\d{2})일 (\d{2})시 (\d{2})분 (\d{2})초/;
            const match = dateStr.match(regex);
            if (match) {
                return new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`);
            }
            return new Date(0);
        };

        const sortedArticles = filteredArticles
            .sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt))
            .slice((page - 1) * 10, page * 10);

        const now = new Date();
        const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const $tempContainer = $("<div></div>"); // 임시 컨테이너

        for (const article of sortedArticles) {
            const profileImageId = (await profileImageIdGet(article.author)) || 1;

            const likeSnapshot = await get(ref(database, `articleLike/${article.id}`));
            const likeCount = likeSnapshot.exists() ? Object.keys(likeSnapshot.val()).length : 0;

            const replySnapshot = await get(query(repliesRef, orderByChild("articleNum"), equalTo(article.id)));
            const replyCount = replySnapshot.exists() ? Object.keys(replySnapshot.val()).length : 0;

            const dateOnly = article.createdAt
                .split(" ")
                .slice(0, 3)
                .map(e => e.replace(/[^\d]/g, ''))
                .join("-");

            const isNew = dateOnly >= formattedTime;
            const newIcon = isNew ? `
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 30 30" style="display: inline-block;">
                    <circle cx="15" cy="15" r="12" fill="#AE001B"/>
                    <text x="15" y="16" font-size="10" fill="white" font-family="Arial, sans-serif" text-anchor="middle" dominant-baseline="middle"> N </text>
                </svg>` : '';

            const $postElement = $(`
                <a class="post-item border" href="../community/detail.html?${article.id}">
                    <div class="post-thumbnail">
                        <img src="${profileImages[profileImageId]}" alt="대표 이미지">
                    </div>
                    <div class="post-details">
                        <div class="post-header">
                            <div class="flex gap-2 items-center">
                                <div class="border boardName">${boardName[article.boardId]}</div>
                                <div class="post-title">${article.id}) ${article.title}</div>
                            </div>
                            <div class="post-title-side flex gap-10">
                                <div class="comment">
                                    <img src="https://github.com/user-attachments/assets/0d4c9144-13e5-4daa-8799-bd5c6de1ded8" alt="댓글 이미지">
                                    <div class="comment-count">${replyCount}</div>
                                </div>
                                ${newIcon}
                            </div>
                        </div>
                        <div class="post-body">
                            <div class="post-title">
                                ${article.body ? article.body.substring(0, 35) + (article.body.length > 35 ? '...' : '') : ''}
                            </div>
                        </div>
                        <div class="post-meta">
                            <div class="author">${article.author}</div>
                            <div class="view-count">
                                <img src="https://github.com/user-attachments/assets/f172ce36-3488-48a9-ab40-a4d1a02f2cf2" alt="조회수" width="30" height="30">
                                <span class="pl-5">${article.viewCount}</span>
                            </div>
                            <div class="like-count">
                                <img src="https://github.com/user-attachments/assets/94d75263-e1b4-4d0e-8bc7-a8315a3322b2" alt="좋아요" width="30" height="30">
                                <span class="pl-5">${likeCount}</span>
                            </div>
                            <div class="post-time">
                                <img src="https://github.com/user-attachments/assets/6e0e9738-1a6a-453e-91c6-c35e851ccedf" alt="시간" width="30" height="30">
                                <span class="pl-5">${dateOnly}</span>
                            </div>
                        </div>
                    </div>
                </a>
            `);

            $tempContainer.append($postElement);
        }

        $contentDiv.empty();

        // 모두 모은 뒤 한 번에 추가
        $contentDiv.append($tempContainer.children());



    } catch (error) {
        console.error("게시글 로드 오류:", error);
        $contentDiv.html("<p class='text-center text-red-500'>게시글을 불러오는 중 오류가 발생했습니다.</p>");
    }
};

async function showEmptyMessage(contentDiv) {
    contentDiv.innerHTML = "<p class='text-gray-500 text-center border p-10'>게시글이 없습니다.</p>";
    page = 1;
    lastPage = 1;
    await updatePagination();
}

// 페이지네이션 동적 링크 계산
async function updatePagination() {
    const pagination = $('.pagination');
    pagination.html(`
        <a class="pagination_left" href="../community/main.html?boardId=${boardId}&page=${page > 1 ? page - 1 : 1}" style="${page === 1 ? 'display: none;' : ''}">
            <i class="fa-solid fa-caret-left" style="font-size: 100px;"></i>
        </a>
        <a class="pagination_right" href="../community/main.html?boardId=${boardId}&page=${page < lastPage ? page + 1 : lastPage}" style="${page === lastPage ? 'display: none;' : ''}">
            <i class="fa-solid fa-caret-right" style="font-size: 100px;"></i>
        </a>
        <div class="pagination flex justify-center">
            <!-- '처음' 버튼 -->
            <a href="../community/main.html?page=1" style="${page === 1 ? 'display: none;' : ''}">처음)</a>
            <button style="${page === 1 ? 'display: none;' : ''}">&nbsp;</button>
            <!-- 이전 페이지 버튼들 -->
            <a class="page" href="../community/main.html?boardId=${boardId}&page=${Math.max(page - 4, 1)}" style="${page <= 4 ? 'display: none;' : ''}">${Math.max(page - 4, 1)}</a>
            <a class="page" href="../community/main.html?boardId=${boardId}&page=${Math.max(page - 3, 1)}" style="${page <= 3 ? 'display: none;' : ''}">${Math.max(page - 3, 1)}</a>
            <a class="page" href="../community/main.html?boardId=${boardId}&page=${Math.max(page - 2, 1)}" style="${page <= 2 ? 'display: none;' : ''}">${Math.max(page - 2, 1)}</a>
            <a class="page" href="../community/main.html?boardId=${boardId}&page=${Math.max(page - 1, 1)}" style="${page === 1 ? 'display: none;' : ''}">${Math.max(page - 1, 1)}</a>
            <!-- 현재 페이지 -->
            <a class="page text-red-500 border" href="../community/main.html?boardId=${boardId}&page=${page}">${page}</a>
            <!-- 다음 페이지 버튼들 -->
            <a class="page" href="../community/main.html?boardId=${boardId}&page=${Math.min(page + 1, lastPage)}" style="${page >= lastPage ? 'display: none;' : ''}">${Math.min(page + 1, lastPage)}</a>
            <a class="page" href="../community/main.html?boardId=${boardId}&page=${Math.min(page + 2, lastPage)}" style="${page + 1 >= lastPage ? 'display: none;' : ''}">${Math.min(page + 2, lastPage)}</a>
            <a class="page" href="../community/main.html?boardId=${boardId}&page=${Math.min(page + 3, lastPage)}" style="${page + 2 >= lastPage ? 'display: none;' : ''}">${Math.min(page + 3, lastPage)}</a>
            <a class="page" href="../community/main.html?boardId=${boardId}&page=${Math.min(page + 4, lastPage)}" style="${page + 3 >= lastPage ? 'display: none;' : ''}">${Math.min(page + 4, lastPage)}</a>
            <!-- '마지막' 버튼 -->
            <button style="${page === lastPage ? 'display: none;' : ''}">&nbsp;</button>
            <a href="../community/main.html?boardId=${boardId}&page=${lastPage}" style="${page === lastPage ? 'display: none;' : ''}">(마지막</a>
        </div>
    `);
}

window.weaponFindUpdate = async function (memberKey, weaponNum) {
    const memberId = await loginKeyCheckById();
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

window.characCheck = async function (memberKey) {
    const memberId = await loginKeyCheckById();
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
        alert(`오류 발생:, ${error}`);
        localStorage.removeItem('nickname');
        sessionStorage.removeItem('nickname')
        console.error("오류 발생:", error);
    }
};

// 로컬스토리지 기록 DB로 업데이트
/*
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
*/

$('.search-button').click(async function () {
    const category = $('.search-category').val();
    const keyword = $('.search-input').val().trim();

    if (!keyword) {
        return;
    }

    const currentUrl = window.location.href.split('?')[0];
    const separator = boardId ? `?boardId=${boardId}&` : '?';
    const searchUrl = `${currentUrl}${separator}category=${encodeURIComponent(category)}&word=${encodeURIComponent(keyword)}`;
    window.location.href = searchUrl;
});

$(document).on('keydown', '.search-input', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        $('.search-button').click();
    }
});

window.checkDailyReward = async function () {};