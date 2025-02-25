// Firebase SDK 불러오기

import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    query,
    orderByChild,
    equalTo,
    update,
    get
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

function generateAuthCode(num) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let authCode = '';
    for (let i = 0; i < num; i++) {
        authCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return authCode;
}

$('.find-ID-Form').submit(async function (event) {
    event.preventDefault(); // 폼 기본 제출 동작 막기

    const $emailData = $('input[name="findID"]');
    const emailData = $emailData.val().trim();

    if (emailData.length <= 0) {
        alert('이메일을 입력해주세요');
        return;
    }

    const queryRef = query(membersRef, orderByChild('email'), equalTo(emailData));

    try {
        const snapshot = await get(queryRef);
        if (snapshot.exists()) {
            const authCode = generateAuthCode(6);

            const scriptURL = "https://script.google.com/macros/s/AKfycbx8lMPXgtQ-Uwrots_yQBuAlZQxjlFN1W8XT5WceTqsZ8yt8wuT6WRZmIrxeVjzPgZOuw/exec";

            const response = await fetch(scriptURL, {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: new URLSearchParams({
                    subject: '아이디 찾기 인증 코드',
                    body: `안녕하세요,\n\n요청하신 본인 확인 인증 코드는 다음과 같습니다 :\n\n"${authCode}"\n\n이 코드를 입력하여 본인 확인을 완료해주세요.`,
                    email: emailData
                })
            });

            const result = await response.text();

            if (result === "이메일 전송 완료") {

                sessionStorage.setItem('authEmail', emailData);
                sessionStorage.setItem('authIDCode', authCode);

                showError($('.errorFindID'), `${emailData}로 인증코드가 전송되었습니다`);
                $('.find-chackID-Form').removeClass('hidden');
                alert(`${emailData}로 인증코드가 전송되었습니다`);
            } else {
                alert("이메일 전송에 실패했습니다. 다시 시도해주세요.");
            }
        } else {
            showError($('.errorFindID'), '입력한 이메일로 등록된 아이디가 없습니다.');
            $('.find-chackID-Form').addClass('hidden');
            alert('입력한 이메일로 등록된 아이디가 없습니다.');
        }
    } catch (error) {
        console.error('데이터 조회 오류:', error);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
});

$('.find-chackID-Form').submit(async function (event) {
    event.preventDefault(); // 폼 기본 제출 동작 막기

    const $codeData = $('input[name="chackID"]');
    const inputCode = $codeData.val().trim();

    const storedEmail = sessionStorage.getItem('authEmail');
    const storedCode = sessionStorage.getItem('authIDCode');

    if (!storedEmail || !storedCode) {
        alert('인증 과정에 문제가 발생했습니다. 다시 시도해주세요.');
        return;
    }

    if (!inputCode || inputCode.length !== 6) {
        showError($('.errorFindID'), '인증 코드를 정확히 입력해주세요.');
        alert('인증 코드를 정확히 입력해주세요.');
        return;
    }

    if (inputCode === storedCode) {
        const queryRef = query(membersRef, orderByChild('email'), equalTo(storedEmail));

        try {
            const snapshot = await get(queryRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                const userKey = Object.keys(data)[0];
                const loginId = data[userKey].loginId;
                showError($('.errorFindID'), `인증 성공! 회원님의 아이디는 "${loginId}"입니다.`);
                alert(`인증 성공! 회원님의 아이디는 "${loginId}"입니다.`);
            } else {
                alert('등록된 이메일로 찾을 수 없습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('데이터 조회 중 오류:', error);
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
        }
    } else {
        alert('인증 코드가 잘못되었습니다. 다시 시도해주세요.');
    }
});

$('.find-PW-Form').submit(async function (event) {
    event.preventDefault(); // 폼 기본 제출 동작 막기

    const $loginIDData = $('input[name="findPW"]');
    const loginIDData = $loginIDData.val().trim();

    if (loginIDData.length <= 0) {
        alert('아이디를 입력해주세요');
        return;
    }

    const queryRef = query(membersRef, orderByChild('loginId'), equalTo(loginIDData));

    try {
        const snapshot = await get(queryRef);
        if (snapshot.exists()) {
            const authCode = generateAuthCode(6); // 인증 코드 생성

            const scriptURL = "https://script.google.com/macros/s/AKfycbx8lMPXgtQ-Uwrots_yQBuAlZQxjlFN1W8XT5WceTqsZ8yt8wuT6WRZmIrxeVjzPgZOuw/exec";

            const data = snapshot.val();
            const userKey = Object.keys(data)[0];
            const email = data[userKey].email;

            const response = await fetch(scriptURL, {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: new URLSearchParams({
                    subject: '비밀번호 찾기 인증 코드',
                    body: `안녕하세요,\n\n요청하신 본인 확인 인증 코드는 다음과 같습니다 :\n\n"${authCode}"\n\n이 코드를 입력하여 본인 확인을 완료해주세요.`,
                    email: email
                })
            });

            const result = await response.text();

            if (result === "이메일 전송 완료") {
                sessionStorage.setItem('authLoginID', loginIDData);
                sessionStorage.setItem('authPWCode', authCode);

                showError($('.errorFindPW'), `${email}로 인증코드가 전송되었습니다`);
                $('.find-chackPW-Form').removeClass('hidden');
                alert(`${email}로 인증코드가 전송되었습니다`);
            } else {
                alert("이메일 전송에 실패했습니다. 다시 시도해주세요.");
            }
        } else {
            showError($('.errorFindPW'), '해당 아이디를 찾을 수 없습니다.');
            $('.find-chackPW-Form').addClass('hidden');
            alert('해당 아이디를 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('데이터 조회 오류:', error);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
});

$('.find-chackPW-Form').submit(async function (event) {
    event.preventDefault(); // 폼 기본 제출 동작 막기

    const $codeData = $('input[name="chackPW"]');
    const inputCode = $codeData.val().trim();

    const storedLoginID = sessionStorage.getItem('authLoginID');
    const storedCode = sessionStorage.getItem('authPWCode');

    if (!storedLoginID || !storedCode) {
        alert('인증 과정에 문제가 발생했습니다. 다시 시도해주세요.');
        return;
    }

    if (!inputCode || inputCode.length !== 6) {
        showError($('.errorFindPW'), '인증 코드를 정확히 입력해주세요.');
        alert('인증 코드를 정확히 입력해주세요.');
        return;
    }

    if (inputCode === storedCode) {
        const queryRef = query(membersRef, orderByChild('loginId'), equalTo(storedLoginID));

        try {
            const snapshot = await get(queryRef);
            const data = snapshot.val();
            const userKey = Object.keys(data)[0];

            // 임시 비밀번호 생성
            const newLoginPw = generateAuthCode(15); // 15자리 임시 비밀번호
            const newHashedPw = await hashPassword(newLoginPw, data[userKey].salt); // 비밀번호 해싱

            // 비밀번호 업데이트
            const userRef = ref(database, `members/${userKey}`);
            await update(userRef, {
                loginPw: newHashedPw // 해싱된 새로운 비밀번호로 업데이트
            });

            const scriptURL = "https://script.google.com/macros/s/AKfycbx8lMPXgtQ-Uwrots_yQBuAlZQxjlFN1W8XT5WceTqsZ8yt8wuT6WRZmIrxeVjzPgZOuw/exec";

            // 이메일로 임시 비밀번호 전송
            const response = await fetch(scriptURL, {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: new URLSearchParams({
                    subject: '임시 비밀번호 발급 안내',
                    body: `안녕하세요,\n\n요청하신 본인 확인이 완료되었습니다.\n아래는 임시 비밀번호입니다 :\n\n"${newLoginPw}"\n\n로그인 후 비밀번호를 변경해 주세요.`,
                    email: data[userKey].email
                })
            });

            const result = await response.text();

            if (result === "이메일 전송 완료") {
                showError($('.errorFindPW'), `${data[userKey].email}로 임시비밀번호가 전송되었습니다`);
                alert(`${data[userKey].email}로 임시비밀번호가 전송되었습니다`);
            } else {
                alert("이메일 전송에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error('데이터 조회 중 오류:', error);
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
        }
    } else {
        alert('인증 코드가 잘못되었습니다. 다시 시도해주세요.');
    }
});

async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function showError($element, message) {
    $element.html(message).show();
}

$('.findID').on('input', function () {
    const $emailData = $('.findID').val().trim();
    showError($('.errorFindID'), $emailData ? ' ' : '* 이메일을 입력해주세요.');
});

$('.findPW').on('input', function () {
    const $IDData = $('.findPW').val().trim();
    showError($('.errorFindPW'), $IDData ? ' ' : '* 아이디를 입력해주세요.');
});