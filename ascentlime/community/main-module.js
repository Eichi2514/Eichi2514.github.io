// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    query,
    orderByChild,
    orderByKey,
    equalTo
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

const boardName = ['오류', '공지', '자유', 'Q&A'];
const boardFullName = ['내가 작성한 글', '공지사항', '자유 게시판', 'Q&A'];

const urlParams = new URLSearchParams(window.location.search);
let page = parseInt(urlParams.get('page')) || 1;
let boardId = parseInt(urlParams.get('boardId')) || '';

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
        return memberData[memberKey].nickname;
    } catch (error) {
        console.error("로그인 아이디 확인 중 오류 발생:", error);
        return null;
    }
}

// 로그인된 사용자 확인
const key = localStorage.getItem('nickname');
let author = null;
if (key) {
    author = await loginKeyCheck(key);
    $('.nickname').text(author);
}

const $logout = $(".logout");
const $loginBg = $(".login-bg");

$logout.click(async function () {
    $loginBg.removeClass('hidden');
});

$('.close-button').click(async function () {
    $loginBg.addClass('hidden');
});

// 페이지네이션 및 데이터 표시를 위한 쿼리
async function getLogsQuery(page, boardId) {
    let queryRef;

    if (boardId === '') {
        // 모든 게시글 가져오기 (저장된 순서대로)
        queryRef = query(articlesRef, orderByKey());
    } else if (boardId === 10) {
        // 내가 쓴 글만 가져오기
        queryRef = query(articlesRef, orderByChild("author"), equalTo(author));
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

// 게시글 목록을 불러오는 함수
window.loadPosts = async function (boardId) {
    const contentDiv = document.querySelector(".content");
    if (!contentDiv) {
        console.error("게시글을 표시할 요소가 존재하지 않습니다.");
        return;
    }
    contentDiv.innerHTML = "";

    try {
        const queryRef = await getLogsQuery(page, boardId);

        if (!queryRef) return;

        const snapshot = await get(queryRef);

        if (!snapshot.exists()) {
            contentDiv.innerHTML = "<p class='text-gray-500 text-center border p-10'>게시글이 없습니다.</p>";
            page = 1;
            lastPage = 1;
            await updatePagination(); // 페이지네이션 업데이트 함수 호출
            return;
        }

        const articlesArray = Object.entries(snapshot.val());

        if (boardId !== '') {
            lastPage = Math.ceil(articlesArray.length / 10.0);

            // 페이지 값 조정
            if (page < 1) page = 1;
            else if (page > lastPage) page = lastPage;

            // 페이지네이션 업데이트
            const paginationElement = document.querySelector('.pagination');
            if (paginationElement) {
                await updatePagination(); // 페이지네이션 업데이트 함수 호출
            }
        }

        // 최신 글 순서로 정렬
        const sortedArticles = articlesArray
            .map(([key, article]) => ({
                key,
                ...article
            }))
            .sort((a, b) => {
                // 날짜 문자열을 "년-월-일 시:분:초" 형식으로 변환
                const parseDate = (dateStr) => {
                    const regex = /(\d{4})년 (\d{2})월 (\d{2})일 (\d{2})시 (\d{2})분 (\d{2})초/;
                    const match = dateStr.match(regex);
                    if (match) {
                        return new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`);
                    }
                    return new Date(0);  // 잘못된 형식일 경우 기본 날짜로 처리
                };

                const dateA = parseDate(a.createdAt);
                const dateB = parseDate(b.createdAt);

                return dateB - dateA;  // 내림차순 (최신 날짜가 먼저)
            })
            .slice((page - 1) * 10, page * 10);

        const now = new Date();
        const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        for (const article of sortedArticles) {
            const likeCountRef = ref(database, `articleLike/${article.id}`);

            // 좋아요 개수 업데이트
            const likeSnapshot = await get(likeCountRef);
            const likeCount = likeSnapshot.exists() ? Object.keys(likeSnapshot.val()).length : 0;

            // 댓글 개수 업데이트
            const snapshot = await get(query(repliesRef, orderByChild("articleNum"), equalTo(article.id)));
            const replyCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;

            const postElement = document.createElement("a");
            postElement.classList.add("post-item", "border");
            postElement.href = `../community/detail?${article.id}`;

            const dateOnly = article.createdAt.split(" ").slice(0, 3).map((e) => e.replace(/[^\d]/g, '')).join("-");

            const NewIcon = dateOnly >= formattedTime ? `
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 30 30" style="display: inline-block;">
                <circle cx="15" cy="15" r="12" fill="#AE001B"/>
                <text x="15" y="16" font-size="10" fill="white" font-family="Arial, sans-serif" text-anchor="middle" dominant-baseline="middle"> N </text>
            </svg>` : '';

            postElement.innerHTML = `
            <div class="post-thumbnail">
                <img src="https://github.com/user-attachments/assets/2ab0ec46-1847-4c87-9b6c-b485ffd5bcc0" alt="대표 이미지">
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
                            <div class="comment-count">${replyCount || 0}</div>
                        </div>
                        ${NewIcon}
                    </div>
                </div>
                <div class="post-body">
                    <div class="post-title">${article.body ? article.body.substring(0, 35) + (article.body.length > 35 ? '...' : '') : ''}</div>
                </div>
                <div class="post-meta">
                    <div class="author">${article.author}</div>
                    <div class="view-count">
                        <img src="https://github.com/user-attachments/assets/f172ce36-3488-48a9-ab40-a4d1a02f2cf2" alt="조회수" width="30" height="30">
                        <span class="pl-5">${article.viewCount}</span>
                    </div>
                    <div class="like-count">
                        <img src="https://github.com/user-attachments/assets/94d75263-e1b4-4d0e-8bc7-a8315a3322b2" alt="좋아요" width="30" height="30">
                        <span class="pl-5">${likeCount || 0}</span>
                    </div>
                    <div class="post-time">
                        <img src="https://github.com/user-attachments/assets/6e0e9738-1a6a-453e-91c6-c35e851ccedf" alt="시간" width="30" height="30">
                        <span class="pl-5">${dateOnly}</span>
                    </div>
                </div>
            </div>
        `;
            contentDiv.appendChild(postElement);
        }
    } catch (error) {
        console.error("게시글 로드 오류:", error);
        contentDiv.innerHTML = "<p class='text-center text-red-500'>게시글을 불러오는 중 오류가 발생했습니다.</p>";
    }
};

// 페이지네이션 동적 링크 계산
async function updatePagination() {
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = `
        <a class="pagination_left" href="../community/main?boardId=${boardId}&page=${page > 1 ? page - 1 : 1}" style="${page === 1 ? 'display: none;' : ''}">
            <i class="fa-solid fa-caret-left" style="font-size: 100px;"></i>
        </a>
        <a class="pagination_right" href="../community/main?boardId=${boardId}&page=${page < lastPage ? page + 1 : lastPage}" style="${page === lastPage ? 'display: none;' : ''}">
            <i class="fa-solid fa-caret-right" style="font-size: 100px;"></i>
        </a>
        <div class="pagination flex justify-center">
            <!-- '처음' 버튼 -->
            <a href="../community/main?page=1" style="${page === 1 ? 'display: none;' : ''}">처음</a>
            <button style="${page === 1 ? 'display: none;' : ''}">)&nbsp;</button>
            <!-- 이전 페이지 버튼들 -->
            <a class="page" href="../community/main?boardId=${boardId}&page=${Math.max(page - 4, 1)}" style="${page <= 4 ? 'display: none;' : ''}">${Math.max(page - 4, 1)}</a>
            <a class="page" href="../community/main?boardId=${boardId}&page=${Math.max(page - 3, 1)}" style="${page <= 3 ? 'display: none;' : ''}">${Math.max(page - 3, 1)}</a>
            <a class="page" href="../community/main?boardId=${boardId}&page=${Math.max(page - 2, 1)}" style="${page <= 2 ? 'display: none;' : ''}">${Math.max(page - 2, 1)}</a>
            <a class="page" href="../community/main?boardId=${boardId}&page=${Math.max(page - 1, 1)}" style="${page === 1 ? 'display: none;' : ''}">${Math.max(page - 1, 1)}</a>
            <!-- 현재 페이지 -->
            <a class="page text-red-500 border" href="../scoreboard?boardId=${boardId}&page=${page}">${page}</a>
            <!-- 다음 페이지 버튼들 -->
            <a class="page" href="../community/main?boardId=${boardId}&page=${Math.min(page + 1, lastPage)}" style="${page >= lastPage ? 'display: none;' : ''}">${Math.min(page + 1, lastPage)}</a>
            <a class="page" href="../community/main?boardId=${boardId}&page=${Math.min(page + 2, lastPage)}" style="${page + 1 >= lastPage ? 'display: none;' : ''}">${Math.min(page + 2, lastPage)}</a>
            <a class="page" href="../community/main?boardId=${boardId}&page=${Math.min(page + 3, lastPage)}" style="${page + 2 >= lastPage ? 'display: none;' : ''}">${Math.min(page + 3, lastPage)}</a>
            <a class="page" href="../community/main?boardId=${boardId}&page=${Math.min(page + 4, lastPage)}" style="${page + 3 >= lastPage ? 'display: none;' : ''}">${Math.min(page + 4, lastPage)}</a>
            <!-- '마지막' 버튼 -->
            <button style="${page === lastPage ? 'display: none;' : ''}">&nbsp;(</button>
            <a href="../community/main?boardId=${boardId}&page=${lastPage}" style="${page === lastPage ? 'display: none;' : ''}">마지막</a>
        </div>
    `;
}