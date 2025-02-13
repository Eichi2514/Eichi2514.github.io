// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    query,
    orderByChild,
    remove,
    equalTo,
    update,
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

const urls = window.location.search;
const articleNum = urls ? parseInt(urls.substring(1)) : 0;

async function getUserInfo(key) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));
    try {
        const snapshot = await get(queryRef);
        if (!snapshot.exists()) {
            console.log('해당 아이디를 찾을 수 없습니다.');
            return { nickname: null, id: null };
        }

        const memberData = snapshot.val();
        const memberKey = Object.keys(memberData)[0];
        return {
            nickname: memberData[memberKey].nickname,
            id: memberData[memberKey].id
        };
    } catch (error) {
        console.error("로그인 아이디 확인 중 오류 발생:", error);
        return { nickname: null, id: null };
    }
}

const adminNicknames = ['chi', 'Eichi', '에이치', '빨간이치', 'admin', '관리자'];

// 로그인된 사용자 확인
const key = localStorage.getItem('nickname');
let author = null;
let memberId = null;
if (key) {
    const userInfo = await getUserInfo(key);
    author = userInfo.nickname;
    memberId = userInfo.id;
}

const likeRef = ref(database, `articleLike/${articleNum}/${memberId}`);
const likeCountRef = ref(database, `articleLike/${articleNum}`);

const $edit = $('.edit');
const $delete = $('.delete');

async function articleIdCheck(num) {
    const queryRef = query(articlesRef, orderByChild("id"), equalTo(num));
    try {
        const snapshot = await get(queryRef);
        if (!snapshot.exists()) {
            alert('해당 게시글을 찾을 수 없습니다.');
            history.back();
            return null;
        }

        const articleData = snapshot.val();
        const articleId = Object.keys(articleData)[0];

        if (articleData[articleId].author !== author && !adminNicknames.includes(author)) {
            $edit.addClass('hidden');
            $delete.addClass('hidden');
        }

        return articleData[articleId];
    } catch (error) {
        console.error("게시글 조회 중 오류 발생:", error);
        return null;
    }
}

const article = await articleIdCheck(articleNum);
const dateOnly = article.createdAt.split(" ").slice(0, 3).map((e) => e.replace(/[^\d]/g, '')).join("-");

$('.title').text(article.title);
$('.nickname').text(article.author);
$('.meta').text(`${dateOnly} / 조회수 ${article.viewCount}`);
$('.article-body').html(article.body.replace(/\n/g, '<br>'));

$edit.click(function () {
    location.href = `../community/write?${articleNum}`;
});

$delete.click(async function () {
    const deleteCheck = confirm('정말로 삭제하시겠습니까? \n글 삭제 시 복구가 불가능합니다.');

    if (deleteCheck) {
        try {
            // 전체 articles 에서 특정 ID를 가진 게시글 찾기
            const articleQuery = query(articlesRef, orderByChild('id'), equalTo(articleNum));

            const snapshot = await get(articleQuery);  // 특정 ID의 게시글 가져오기

            if (!snapshot.exists()) {
                alert('해당 게시글을 찾을 수 없습니다.');
                return;
            }

            let articleKey = null;
            let article = null;

            // snapshot 에서 첫 번째 게시글의 키와 데이터 가져오기
            snapshot.forEach(childSnapshot => {
                articleKey = childSnapshot.key;  // 게시글의 고유 키 (랜덤 키)
                article = childSnapshot.val();
            });

            if (!articleKey || !article) {
                alert('게시글을 찾을 수 없습니다.');
                return;
            }

            if (article.author !== author && !adminNicknames.includes(author)) {
                alert('삭제 권한이 없습니다.');
                return;
            }

            // Firebase 에서 해당 게시글 삭제
            await remove(ref(database, `articles/${articleKey}`));

            alert('게시글이 삭제되었습니다.');
            location.href = '../community/main';  // 삭제 후 목록 페이지로 이동

        } catch (error) {
            console.error('게시글 삭제 중 오류 발생:', error);
            alert('게시글 삭제에 실패했습니다.');
        }
    }
});

const $like = $('.like');
const $likeCount = $('.like-count');

const snapshot = await get(likeRef);
if (snapshot.exists()) {
    // 배경색 추가
    $like.css("background", "rgb(174, 0, 27)");
    
}

// 좋아요 개수 업데이트
const likeSnapshot = await get(likeCountRef);
const likeCount = likeSnapshot.exists() ? Object.keys(likeSnapshot.val()).length : 0;
$likeCount.text(likeCount);

// 버튼 클릭 이벤트
$like.click(async function () {

    if (memberId === null) {
        alert("로그인 회원만 이용할 수 있습니다.");
        return
    }

    try {
        const snapshot = await get(likeRef);

        if (snapshot.exists()) {
            // 좋아요 취소 (삭제)
            await remove(likeRef);

            // 배경색 제거
            $like.css("background", "none");

            // 좋아요 개수 업데이트
            const likeSnapshot = await get(likeCountRef);
            const likeCount = likeSnapshot.exists() ? Object.keys(likeSnapshot.val()).length : 0;
            $likeCount.text(likeCount);

            return false;
        } else {
            // 좋아요 추가
            await set(likeRef, true);

            // 배경색 추가
            $like.css("background", "rgb(174, 0, 27)");

            // 좋아요 개수 업데이트
            const likeSnapshot = await get(likeCountRef);
            const likeCount = likeSnapshot.exists() ? Object.keys(likeSnapshot.val()).length : 0;
            $likeCount.text(likeCount);

            return true;
        }
    } catch (error) {
        console.error("좋아요 토글 중 오류 발생:", error);
        return null;
    }
});

window.doIncreaseHitCountRd = async function (articleNum) {
    try {
        // 전체 articles 에서 특정 ID를 가진 게시글 찾기
        const articleQuery = query(articlesRef, orderByChild('id'), equalTo(articleNum));

        const snapshot = await get(articleQuery);  // 특정 ID의 게시글 가져오기

        if (!snapshot.exists()) {
            alert('해당 게시글을 찾을 수 없습니다.');
            return;
        }

        let articleKey = null;
        let article = null;

        // snapshot 에서 첫 번째 게시글의 키와 데이터 가져오기
        snapshot.forEach(childSnapshot => {
            articleKey = childSnapshot.key;  // 게시글의 고유 키 (랜덤 키)
            article = childSnapshot.val();
        });

        if (!articleKey || !article) {
            alert('게시글을 찾을 수 없습니다.');
            return;
        }

        // 현재 viewCount 가져오기 (기본값 0)
        const currentViewCount = article.viewCount || 0;
        const newViewCount = currentViewCount + 1;

        // Firebase 에서 해당 게시글 viewCount 증가
        await update(ref(database, `articles/${articleKey}`), {viewCount: newViewCount});

        // console.log(`게시글 ${articleNum} 조회수 증가: ${currentViewCount} -> ${newViewCount}`);

        return {dateOnly, newViewCount};

    } catch (error) {
        console.error('게시글 조회수 증가 중 오류 발생:', error);
        alert('게시글 조회수 증가에 실패했습니다.');
    }
};

// 조회수 증가 함수
function ArticleDetail__doIncreaseHitCount() {
    const localStorageKey = 'article__' + articleNum + '__alreadyOnView';

    if (localStorage.getItem(localStorageKey)) {
        return;
    }

    doIncreaseHitCountRd(articleNum).then(({dateOnly, newViewCount}) => {
        $('.meta').text(`${dateOnly} / 조회수 ${newViewCount}`);
    });

    localStorage.setItem(localStorageKey, true);
}

ArticleDetail__doIncreaseHitCount();