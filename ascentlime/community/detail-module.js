const profileImages = [
    'https://github.com/user-attachments/assets/3b0e2c34-227d-4135-91e3-b9cb0ff3207e',
    'https://github.com/user-attachments/assets/2ab0ec46-1847-4c87-9b6c-b485ffd5bcc0',
    'https://github.com/user-attachments/assets/76d8bc9f-d814-4f60-b99f-e6688a60acd5',
    'https://github.com/user-attachments/assets/b7a6c561-9176-4f1e-98c5-0d6723bcca2b',
    'https://github.com/user-attachments/assets/49a90ef1-1246-4a74-933e-b78e180e2f30',
    'https://github.com/user-attachments/assets/34ce9a88-ab95-45a8-956b-a6c8ee129674',
    'https://github.com/user-attachments/assets/1314824d-d8a6-44f2-9672-ba5a0e7f3d6c',
    'https://github.com/user-attachments/assets/c5004b20-a313-41cd-b012-33c91f271664',
    'https://github.com/user-attachments/assets/d7afdd47-5dfe-4824-b456-841439908a6b',
    'https://github.com/user-attachments/assets/b9dac1d9-afc9-4ce8-a6df-1c945dbc68db',
    'https://github.com/user-attachments/assets/1f52c6f6-40e8-48b6-907e-4e64b8907a27',
    'https://github.com/user-attachments/assets/309ac7b2-ae9c-4850-b0f5-c84b001a5c24',
    'https://github.com/user-attachments/assets/25b5197e-0ab4-4fb5-9d11-644a7e46d954',
    'https://github.com/user-attachments/assets/3b0e2c34-227d-4135-91e3-b9cb0ff3207e'
];

// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    equalTo,
    get,
    getDatabase,
    orderByChild,
    child,
    query,
    ref,
    remove,
    set,
    update,
    limitToLast
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
const repliesRef = ref(database, "replies");

const urls = window.location.search;
const articleNum = urls ? parseInt(urls.substring(1)) : 0;

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

async function getUserInfo(key) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));
    try {
        const snapshot = await get(queryRef);
        if (!snapshot.exists()) {
            console.log('해당 아이디를 찾을 수 없습니다.');
            return {nickname: null, id: null};
        }

        const memberData = snapshot.val();
        const memberKey = Object.keys(memberData)[0];
        return {
            nickname: memberData[memberKey].nickname,
            profileImageId: memberData[memberKey].profileImageId,
            id: memberData[memberKey].id
        };
    } catch (error) {
        console.error("로그인 아이디 확인 중 오류 발생:", error);
        return {nickname: null, id: null};
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

const adminNicknames = ['chi', 'Eichi', '에이치', '빨간이치', 'admin', '관리자', '운영자'];

// 로그인된 사용자 확인
const key = localStorage.getItem('nickname');
let nickname = null;
let memberId = null;
let profileImageId = null;
if (key) {
    const userInfo = await getUserInfo(key);
    nickname = userInfo.nickname;
    memberId = userInfo.id;
    profileImageId = userInfo.profileImageId;
    $('.profile-photo').attr('src', profileImages[profileImageId !== undefined ? profileImageId : 1]);
    $('.nickname').text(nickname);
    $('.logout').addClass('hidden');
    $('.login').removeClass('hidden');
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

        if (articleData[articleId].author !== nickname && !adminNicknames.includes(nickname)) {
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
const author = article.author;
$('.title').text(article.title);
$('.author-photo').attr('src', profileImages[await profileImageIdGet(article.author) ?? 1]);
$('.author').text(article.author);
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

            if (article.author !== nickname && !adminNicknames.includes(nickname)) {
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

const $logout = $(".logout");
const $loginBg = $(".login-bg");

$logout.click(async function () {
    $loginBg.removeClass('hidden');
});

$('.close-button').click(async function () {
    $loginBg.addClass('hidden');
});

function getNow(code) {
    const now = new Date();
    if (code === 1) return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    return `${now.getFullYear()}년 ${String(now.getMonth() + 1).padStart(2, '0')}월 ${String(now.getDate()).padStart(2, '0')}일 ${String(now.getHours()).padStart(2, '0')}시 ${String(now.getMinutes()).padStart(2, '0')}분 ${String(now.getSeconds()).padStart(2, '0')}초`;
}

$('.reply-form').submit(async function (event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 막음

    const $replyBodyInput = $('input[name="replyBody"]');
    const replyBody = $replyBodyInput.val().trim();

    if (replyBody.length < 3) {
        alert('댓글은 3글자 이상이어야 합니다.');
        return;
    }

    let newId = 1; // 기본값, 만약 데이터가 없으면 1로 시작

    try {
        const lastReplyQuery = query(repliesRef, orderByChild('id'), limitToLast(1));
        const lastReplySnapshot = await get(lastReplyQuery);

        if (lastReplySnapshot.exists()) {
            const lastReply = Object.values(lastReplySnapshot.val())[0];
            newId = lastReply.id + 1; // 마지막 데이터의 id에 1을 더함
        }

        const newReplyRef = child(repliesRef, getNow(1).toString());

        await set(newReplyRef, {
            id: newId,
            articleNum: articleNum,
            author: nickname,
            body: replyBody,
            time: getNow()
        });

        alert("댓글이 성공적으로 등록되었습니다.");
        $replyBodyInput.val(""); // 입력 필드 초기화
        await loadReplies();
    } catch (error) {
        console.error("댓글 작성 중 오류 발생:", error);
        alert('댓글 작성 중 오류가 발생했습니다.');
    }
});

const $replyList = $('.reply-list');

// 댓글 불러오기
async function loadReplies() {
    try {
        const snapshot = await get(query(repliesRef, orderByChild("articleNum"), equalTo(articleNum)));
        if (!snapshot.exists()) {
            $replyList.html("<p class='text-center p-10'>댓글이 없습니다.</p>");
            return;
        }

        let repliesHtml = "";
        const replyCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;

        // map과 Promise.all을 사용하여 모든 프로미스를 처리합니다.
        const replyPromises = Object.values(snapshot.val()).map(async (reply) => {
            const profileImageId = await profileImageIdGet(reply.author) || 1;

            let replyActions = `
                <button class="link" onclick="replyEdit(${reply.id})">                                                                
                    수정
                </button>
                <button class="link" onclick="replyDelete(${reply.id})">
                    삭제
                </button>
            `;

            let authorTitle = `
                <div class="pl-2 pr-2 border">
                    작성자 
                </div>
            `;

            if (reply.author !== author) {
                authorTitle = '';
            }

            if (reply.author !== nickname && !adminNicknames.includes(nickname)) {
                replyActions = '';
            }

            repliesHtml += `
                <div class="profile login border gap-2 reply${reply.id}">
                    <div class="profile-photo">
                        <img src="${profileImages[profileImageId]}"  
                            alt="프로필 사진">
                    </div>
                    <div class="profile-details">
                        <div class="flex items-center">
                            <div class="flex">                                
                                <div class="pr-2">
                                    ${reply.author}
                                </div>
                                    ${authorTitle}
                            </div>
                            <div class="reply-actions reply${reply.id} m-2">                                 
                                ${replyActions}                                 
                            </div>
                            <div class="reply-actions reply${reply.id} hidden m-2">                                 
                                <button class="link" onclick="replyEdit(${reply.id})">
                                    취소
                                </button>
                            </div>
                        </div>
                        <div class="reply-body reply${reply.id}">
                            ${reply.body}
                        </div>
                        <form class="reply-body reply${reply.id} hidden" method="POST">
                            <input type="hidden" value="${reply.id}" name="replyId">
                            <input class="reply-input" type="text" value="${reply.body}" name="replyBody${reply.id}">
                            <button type="submit" class="pl-4 pr-2 whitespace-nowrap">확인</button>
                        </form>                        
                    </div>
                </div>
            `;
        });

        // 모든 프로미스가 해결될 때까지 기다립니다.
        await Promise.all(replyPromises);

        $('.comments-count').text(`${replyCount}개`);
        $replyList.html(repliesHtml);
    } catch (error) {
        console.error("댓글 불러오기 오류:", error);
        $replyList.html("<p class='text-center p-10'>댓글을 불러오는 중 오류가 발생했습니다.</p>");
    }
}

$(document).ready(() => {
    loadReplies();
});

window.replyEdit = async function (num) {
    $(`.reply-actions.reply${num}`).toggleClass('hidden');
    $(`.reply-body.reply${num}`).toggleClass('hidden');
}


$(document).on('submit', '.reply-body', async function (event) {
    event.preventDefault();

    const $form = $(this);
    const replyId = $form.find('input[name="replyId"]').val();  // 숫자형 id
    const replyBodyNum = $form.find(`input[name="replyBody${replyId}"]`).val().trim();

    if (replyBodyNum.length < 3) {
        alert('댓글은 3글자 이상이어야 합니다.');
        return;
    }

    try {
        // replies 노드에서 id에 해당하는 댓글 찾기
        const queryRef = query(ref(database, 'replies'), orderByChild('id'), equalTo(Number(replyId))); // id 기준으로 검색
        const snapshot = await get(queryRef);

        if (snapshot.exists()) {
            const replyKey = Object.keys(snapshot.val())[0]; // 첫 번째 댓글의 고유 키 가져오기
            const replyRef = ref(database, `replies/${replyKey}`);
            const replyData = snapshot.val()[replyKey];  // 댓글 데이터 가져오기
            const replyAuthor = replyData.author;  // 댓글 작성자 닉네임

            if (replyAuthor !== nickname && !adminNicknames.includes(nickname)) {
                alert('수정 권한이 없습니다.');
                return;
            }

            await update(replyRef, {body: replyBodyNum});

            alert('댓글이 수정되었습니다.');

            const $target = $(`.reply-body.reply${replyId}`);

            $(`.reply-actions.reply${replyId}`).toggleClass('hidden');
            $target.toggleClass('hidden');
            $target.text(`${replyBodyNum}`);
        } else {
            alert('댓글을 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('댓글 수정 중 오류 발생:', error);
        alert('댓글 수정에 실패했습니다.');
    }
});

window.replyDelete = async function (replyId) {
    if (!confirm('정말로 삭제하시겠습니까? \n댓글 삭제 시 복구가 불가능합니다.')) return;

    try {
        // replies 노드에서 id에 해당하는 댓글 찾기
        const queryRef = query(ref(database, 'replies'), orderByChild('id'), equalTo(Number(replyId))); // id 기준으로 검색
        const snapshot = await get(queryRef);

        if (snapshot.exists()) {
            const replyKey = Object.keys(snapshot.val())[0]; // 첫 번째 댓글의 고유 키 가져오기
            const replyRef = ref(database, `replies/${replyKey}`);
            const replyData = snapshot.val()[replyKey];  // 댓글 데이터 가져오기
            const replyAuthor = replyData.author;  // 댓글 작성자 닉네임

            if (replyAuthor !== nickname && !adminNicknames.includes(nickname)) {
                alert('삭제 권한이 없습니다.');
                return;
            }

            await remove(replyRef);

            alert('댓글이 삭제되었습니다.');

            const $target = $(`.reply-body.reply${replyId}`);
            $target.text('삭제된 댓글입니다.');
        } else {
            alert('댓글을 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('댓글 삭제 중 오류 발생:', error);
        alert('댓글 삭제에 실패했습니다.');
    }
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