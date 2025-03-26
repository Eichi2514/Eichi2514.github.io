// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    equalTo,
    get,
    getDatabase,
    orderByChild,
    query,
    ref,
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
const membersRef = ref(database, 'members');

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
        return memberData[memberKey];
    } catch (error) {
        console.error("로그인 아이디 확인 중 오류 발생:", error);
        return {nickname: null, id: null};
    }
}

// 로그인된 사용자 확인
const key = localStorage.getItem('nickname');
let authenticationStep1 = null;
let authenticationStep2 = null;
if (key) {
    const userInfo = await getUserInfo(key);
    $('.myPage_1 .myPage_body').text(userInfo.time.split(" ").slice(0, 3).join(" "));
    $('.myPage_2 .myPage_body').text(userInfo.name);
    $('.myPage_3 .myPage_body').text(userInfo.nickname);
    $('.myPage_4 .myPage_body').text(userInfo.loginId);
    authenticationStep1 = userInfo.loginPw;
    authenticationStep2 = userInfo.salt;
} else {
    alert('로그인이 필요한 서비스 입니다');
    window.location.href = 'ascentlime.html';
}

const $myPage_bt = $('.myPage_bt');
const $myPage_body = $('.myPage_body');
const $auth_bg = $('.auth-bg');
const $myPage_6 = $('.myPage_6');

$('.myPage_edit').click(function () {
    $auth_bg.removeClass('hidden');
});

$('.close-button').click(function () {
    $auth_bg.addClass('hidden');
});

async function hashPassword(password, salt) {
    const scriptURL = "https://script.google.com/macros/s/AKfycbxD1axioR1FicH70pnzgTMS-kBmszf8T_ivRpPJoZqCXM8dhWbj8BxO8rQp4Gmf3psenQ/exec";

    if (!password || !salt) {
        alert('잘못된 접근 방식입니다.');
        return null;
    }

    try {
        const response = await fetch(scriptURL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                password: password,
                salt: salt
            })
        });

        const hashedPassword = await response.text();
        return hashedPassword.trim();

    } catch (error) {
        console.error("비밀번호 해싱 중 오류 발생:", error);
        return null;
    }
}

$('.auth-form').submit(async function (event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 막음

    const $loginPwInput = $('input[name="loginPw"]');
    const loginPw = $loginPwInput.val().trim();

    if (loginPw.length <= 0) {
        alert('비밀번호를 입력해주세요.');
        return;
    }

    const authentication = await hashPassword(loginPw, authenticationStep2);

    if (authentication === authenticationStep1) {
        $myPage_bt.first().addClass('hidden');
        $myPage_bt.last().removeClass('hidden');
        $myPage_body.eq(4).addClass('hidden');
        $myPage_body.eq(5).removeClass('hidden');
        $auth_bg.addClass('hidden');
        $myPage_6.removeClass('hidden').addClass('flex');
    } else {
        alert(`비밀번호가 잘못되었습니다.`);
    }
});

$('.myPage_form').submit(async function (event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 막음

    const $newLoginPwInput = $('input[name="newLoginPw"]');
    const $newLoginPwInput2 = $('input[name="newLoginPw2"]');
    let newLoginPw = $newLoginPwInput.val().trim();
    let newLoginPw2 = $newLoginPwInput2.val().trim();

    if (newLoginPw.length <= 0) {
        alert('비밀번호를 입력해주세요.');
        return;
    }

    if (newLoginPw2.length <= 0) {
        alert('재확인 비밀번호를 입력해주세요.');
        return;
    }

    if (newLoginPw !== newLoginPw2) {
        alert(`재확인 비밀번호가 틀렸습니다.`);
        return;
    }

    newLoginPw = await hashPassword(newLoginPw, authenticationStep2);

    if (newLoginPw === authenticationStep1) {
        alert(`최근에 사용한 비밀번호로는 변경할 수 없습니다.`);
        return;
    }

    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));

    try {
        const snapshot = await get(queryRef);
        const data = snapshot.val();
        const userKey = Object.keys(data)[0];

        const scriptURL = "https://script.google.com/macros/s/AKfycbz1rE9h2EciLTdWw5W0_Kz62plzd7S2fM_0CaIdwp-B7VAWLQyWEXisUN86inxLP-LZ_Q/exec";

        // 이메일로 비밀번호 변경 사실 전송
        const response = await fetch(scriptURL, {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: new URLSearchParams({
                subject: '비밀번호 변경 안내',
                body: `안녕하세요,\n\n요청하신 비밀번호 변경이 완료되었습니다.\n만약 본인이 아닌 경우, 즉시 비밀번호를 변경하여 계정을 보호해 주세요.\n\n변경된 비밀번호로 로그인 후, 본인의 계정을 다시 확인하시기 바랍니다.`,
                email: data[userKey].email
            })
        });

        const result = await response.text();

        if (result === "이메일 전송 완료") {
            // 비밀번호 업데이트
            const userRef = ref(database, `members/${userKey}`);
            await update(userRef, {
                loginPw: newLoginPw
            });

            alert(`비밀번호가 변경되었습니다.`);

        } else {
            alert("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
            return;
        }
        location.reload();
    } catch (error) {
        console.error('데이터 조회 중 오류:', error);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
});