import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    get,
    child,
    query,
    orderByChild,
    equalTo,
    update,
    limitToLast
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const articlesRef = ref(database, 'articles');
const membersRef = ref(database, 'members');

let urls = window.location.search;
let articleNum = urls ? parseInt(urls.substring(1)) : 0;

async function loginKeyCheck(key) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));
    try {
        const snapshot = await get(queryRef);
        if (!snapshot.exists()) {
            console.log('해당 아이디를 찾을 수 없습니다.');
            return null;
        }

        const memberData = snapshot.val();
        return Object.values(memberData)[0].nickname;
    } catch (error) {
        console.error("로그인 아이디 확인 중 오류 발생:", error);
        return null;
    }
}

const adminNicknames = ['chi', 'Eichi', '에이치', '빨간이치', 'admin', '관리자', '운영자'];

const key = localStorage.getItem('nickname');
let author = null;

if (key) {
    author = await loginKeyCheck(key);
} else {
    alert('로그인이 필요한 서비스 입니다');
    window.location.href = 'https://eichi2514.github.io/ascentlime';
}

async function articleIdCheck(num) {
    const queryRef = query(articlesRef, orderByChild("id"), equalTo(num));
    try {
        const snapshot = await get(queryRef);
        if (!snapshot.exists()) {
            alert('해당 게시글을 찾을 수 없습니다.');
            history.back();
        }

        const articleData = snapshot.val();
        const articleId = Object.keys(articleData)[0];

        if (articleData[articleId].author !== author && !adminNicknames.includes(author)) {
            alert('수정 권한이 없습니다.');
            history.back();
        }
        return articleData[articleId];
    } catch (error) {
        console.error("게시글 조회 중 오류 발생:", error);
        return null;
    }
}

if (adminNicknames.includes(author)) $('.Notice').removeClass('hidden');

if (articleNum) {
    const article = await articleIdCheck(articleNum);

    $('.title').text('게시글 수정');

    if (article) {
        $("select[name='boardId']").val(article.boardId);
        $("input[name='title']").val(article.title);
        $("textarea[name='body']").val(article.body);
    }
}

window.ArticleWrite__submit = async function (form) {
    event.preventDefault();
    const now = new Date();
    const formattedTime = `${now.getFullYear()}년 ${String(now.getMonth() + 1).padStart(2, '0')}월 ${String(now.getDate()).padStart(2, '0')}일 ${String(now.getHours()).padStart(2, '0')}시 ${String(now.getMinutes()).padStart(2, '0')}분 ${String(now.getSeconds()).padStart(2, '0')}초`;
    let formattedTextTime = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    const boardId = form.boardId.value;
    const title = form.title.value;
    const body = form.body.value;

    if (boardId.length === 0) {
        alert("게시판을 선택해주세요");
        return false;
    } else if (title.length === 0) {
        alert("제목을 입력하세요");
        return false;
    } else if (title.length > 30) {
        alert("제목은 최대 30자까지 입력 가능합니다.");
        return false;
    } else if (body.length === 0) {
        alert("내용을 입력하세요");
        return false;
    }

    let word;
    let newId = 1; // 기본값, 만약 데이터가 없으면 1로 시작

    if (!articleNum) {
        word = '작성';
        // articlesRef에서 마지막 데이터를 가져오기 위해 쿼리 설정
        const lastArticleQuery = query(articlesRef, orderByChild('id'), limitToLast(1));

        // 마지막 데이터를 가져온 후 새로운 id 계산
        const lastArticleSnapshot = await get(lastArticleQuery);

        if (lastArticleSnapshot.exists()) {
            const lastArticle = Object.values(lastArticleSnapshot.val())[0];
            newId = lastArticle.id + 1; // 마지막 데이터의 id에 1을 더함
        }

        // 새 데이터 생성
        const newArticleRef = child(articlesRef, formattedTextTime.toString());
        await set(newArticleRef, {
            id: newId,
            boardId: parseInt(boardId, 10),
            title: title,
            body: body,
            author: author,
            viewCount: 0,
            createdAt: formattedTime
        });
    } else {
        word = '수정';
        const article = await articleIdCheck(articleNum);
        if (!article) return;

        newId = article.id;

        const formattedTextTime = article.createdAt.replace(/[^\d]/g, "");

        // await set(child(articlesRef, formattedTextTime), {...article, title, body});
        await update(ref(database, `articles/${formattedTextTime}`), {title, body});
    }

    alert(`게시글이 성공적으로 ${word}되었습니다!`);
    window.location.href = `../community/detail?${newId}`;
    return false;
};