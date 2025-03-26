// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    set,
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

window.saveMembers = async function (member) {
    const now = new Date();
    const formattedTime = `${now.getFullYear()}년 ${String(now.getMonth() + 1).padStart(2, '0')}월 ${String(now.getDate()).padStart(2, '0')}일 ${String(now.getHours()).padStart(2, '0')}시 ${String(now.getMinutes()).padStart(2, '0')}분 ${String(now.getSeconds()).padStart(2, '0')}초`;

    let info = "알 수 없음";

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`);
                const data = await response.json();
                info = data.error ? "정보를 가져올 수 없음" : data.display_name;
            } catch (error) {
                info = "정보를 가져오는 중 오류 발생";
            }
            saveToDatabase(member, formattedTime, info);
        }, () => {
            saveToDatabase(member, formattedTime, info);
        });
    } else {
        await saveToDatabase(member, formattedTime, info);
    }
}

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

async function saveToDatabase(member, formattedTime, info) {
    try {
        const snapshot = await get(membersRef);
        let newId = 1;
        if (snapshot.exists()) {
            const members = snapshot.val();
            const ids = Object.values(members).map(info => info.id);
            newId = Math.max(...ids, 0) + 1;
        }

        const salt = generateUUID();
        const hashedPw = await hashPassword(member.loginPw, salt);

        const newMembersRef = child(membersRef, newId + ")" + member.name);
        set(newMembersRef, {
            id: newId,
            name: member.name,
            nickname: member.nickname,
            loginId: member.loginId,
            loginPw: hashedPw,
            profileImageId: Math.floor(Math.random() * 3) + 1,
            email: member.email,
            salt: salt,
            key: member.key,
            time: formattedTime,
            info: info
        });

        alert("회원가입이 완료되었습니다.");
        history.back();
    } catch (error) {
        alert("데이터를 저장하는 중 오류 발생: " + error);
    }
}

window.doJoin = async function (member) {
    const snapshot = await get(membersRef);
    if (snapshot.exists()) {
        const members = snapshot.val();
        const existingIds = Object.values(members).map(info => info.loginId);
        const existingNicknames = Object.values(members).map(info => info.nickname);
        const existingEmails = Object.values(members).map(info => info.email);

        if (existingIds.includes(member.loginId)) {
            alert("이미 사용 중인 아이디입니다.");
            return;
        }
        if (existingNicknames.includes(member.nickname)) {
            alert("이미 사용 중인 닉네임입니다.");
            return;
        }
        if (existingEmails.includes(member.email)) {
            alert("이미 사용 중인 이메일입니다.");
            return;
        }
        if (specialCharPattern1.test(member.name)) {
            alert("* 이름에 한글, 영문만 사용해 주세요.\n (특수기호, 공백, 숫자 사용 불가)");
            return;
        }
        if (specialCharPattern2.test(member.nickname)) {
            alert("* 닉네임에 한글, 영문, 숫자만 사용해 주세요.\n (특수기호, 공백 사용 불가)");
            return;
        }
        if (member.nickname.length < 3 || member.nickname.length > 7) {
            alert("* 닉네임은 3~7자여야 합니다.");
            return;
        }
        if (member.loginId.length < 3) {
            alert("* 아이디는 3자 이상이어야 합니다.");
            return;
        }
        if (!emailRegex.test(member.email)) {
            alert("* 올바른 이메일 형식을 입력해 주세요.");
            return;
        }
        if (checkRestrictedNickname(member.nickname)) {
            alert("* 사용 불가능한 닉네임입니다.");
            return;
        }
        if (specialCharPattern0.test(member.loginId)) {
            alert("* 아이디에 영문, 숫자만 사용해 주세요.\n (특수기호, 공백, 한글 사용 불가)");
            return;
        }
        if (!sessionStorage.getItem('isVerifyCode')) {
            alert("* 이메일 인증을 완료해주세요.");
            return;
        }
    }
    sessionStorage.removeItem('isVerifyCode');
    await saveMembers(member);
};

window.getKey = async function () {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 15; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const snapshot = await get(membersRef);
    if (snapshot.exists()) {
        const members = snapshot.val();
        const existingKeys = Object.values(members).map(info => info.key);
        if (existingKeys.includes(key)) {
            return getKey();
        }
    }
    return key;
}

window.checkDuplicate = async function (field, value) {
    const snapshot = await get(membersRef);
    if (snapshot.exists()) {
        const members = snapshot.val();
        const existingValues = Object.values(members).map(info => info[field]);
        return existingValues.includes(value);
    }
    return false;
}

window.error = function () {
    window.location.href = 'https://eichi2514.github.io/ascentlime/restricted/restricted';
    return true;
};

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const adminNicknames = ['chi', 'Eichi', '에이치', '빨간이치', 'admin', '관리자', '운영자'];
const specialCharPattern0 = /[^a-zA-Z0-9]/;
const specialCharPattern1 = /[^a-zA-Z가-힣]/;
const specialCharPattern2 = /[^a-zA-Z0-9가-힣]/;
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function checkRestrictedNickname(nickname) {
    return adminNicknames.includes(nickname);
}

function showError($element, message) {
    $element.html(message).show();
}

function validateInput(inputValue, fieldName) {
    if (!inputValue && fieldName === '이메일') return `* 회원찾기용 ${fieldName}을 입력해 주세요.`;
    if (!inputValue) return `* ${fieldName}을(를) 입력해주세요.`;
    if (fieldName === '아이디' && specialCharPattern0.test(inputValue))
        return `* ${fieldName}에 영문,숫자만 사용해 주세요. <br> (특수기호, 공백, 한글 사용 불가)`;
    if (fieldName === '이름' && specialCharPattern1.test(inputValue))
        return `* ${fieldName}에 한글, 영문만 사용해 주세요. <br> (특수기호, 공백, 숫자 사용 불가)`;
    if (fieldName === '닉네임' && specialCharPattern2.test(inputValue))
        return `* ${fieldName}에 한글, 영문, 숫자만 사용해 주세요. <br> (특수기호, 공백 사용 불가)`;
    if (fieldName === '닉네임' && (inputValue.length < 3 || inputValue.length > 7))
        return `* ${fieldName}은 3~7자여야 합니다.`;
    if (fieldName === '아이디' && inputValue.length < 3)
        return `* ${fieldName}는 3자 이상이어야 합니다.`;
    if (fieldName === '이메일' && !emailRegex.test(inputValue))
        return '* 올바른 이메일 형식을 입력해 주세요.';
    if (fieldName === '닉네임' && checkRestrictedNickname(inputValue))
        return '* 사용 불가능한 닉네임입니다.';
    return '';
}

async function handleInputValidation(inputClass, validationFunction, errorMessageClass, fieldName) {
    $(inputClass).on('input', async function () {
        const inputValue = $(this).val().trim();
        const $error = $(errorMessageClass);
        const errorMessage = validateInput(inputValue, fieldName);
        const field = fieldName === '아이디' ? 'loginId' : fieldName === '닉네임' ? 'nickname' : fieldName === '이메일' ? 'email' : '';
        const isDuplicate = validationFunction ? await validationFunction(field, inputValue) : false;

        if (errorMessage) {
            showError($error, errorMessage);
        } else if (isDuplicate) {
            showError($error, `* 이미 사용 중인 ${fieldName}입니다.`);
        } else {
            $error.hide();
        }
    });
}

$(document).ready(function () {
    $('form').submit(async function (event) {
        event.preventDefault();

        const member = {
            loginId: $('input[name="loginId"]').val().trim(),
            loginPw: $('input[name="loginPw"]').val().trim(),
            nickname: $('input[name="nickname"]').val().trim(),
            name: $('input[name="name"]').val().trim(),
            email: $('input[name="email"]').val().trim()
        };

        const loginPw2 = $('input[name="loginPw2"]').val().trim();

        const validations = [
            {value: member.loginId, message: '아이디를 입력해주세요.'},
            {value: member.loginPw, message: '비밀번호를 입력해주세요.'},
            {value: loginPw2, message: '재확인 비밀번호를 입력해주세요.'},
            {value: member.nickname, message: '닉네임을 입력해주세요.'},
            {value: member.loginId, message: validateInput(member.loginId, '아이디')},
            {value: member.nickname, message: validateInput(member.nickname, '닉네임')},
            {value: member.name, message: validateInput(member.name, '이름')},
            {value: member.loginPw === loginPw2, message: '재확인 비밀번호가 틀렸습니다.'}
        ];

        for (const {value, message} of validations) {
            if (!value) {
                alert(message);
                return;
            }
        }

        member.key = await getKey();
        doJoin(member);
    });

    handleInputValidation('.inputID', checkDuplicate, '.errorID', '아이디');
    handleInputValidation('.inputNickname', checkDuplicate, '.errorNickname', '닉네임');
    handleInputValidation('.inputEmail', checkDuplicate, '.errorEmail', '이메일');
    handleInputValidation('.inputName', null, '.errorName', '이름');

    $('.inputPW, .inputPW2').on('input', function () {
        const PW = $('.inputPW').val().trim();
        const PW2 = $('.inputPW2').val().trim();
        showError($('.errorPW'), PW ? ' ' : '* 비밀번호를 입력해주세요.');
        showError($('.errorPW2'), PW2 ? (PW !== PW2 ? '* 재확인 비밀번호가 틀렸습니다.' : ' ') : '* 재확인 비밀번호를 입력해주세요.');
    });
});

function generateAuthCode(num) {
    const chars = '0123456789';
    let authCode = '';
    for (let i = 0; i < num; i++) {
        authCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return authCode;
}

window.sendEmail = async function () {
    const $emailData = $('input[name="email"]');
    const emailData = $emailData.val().trim();

    if (emailData.length <= 0) {
        alert('이메일을 입력해주세요');
        return;
    }

    const snapshot = await get(membersRef);

    if (snapshot.exists()) {
        const members = snapshot.val();
        const existingEmails = Object.values(members).map(info => info.email);
        if (existingEmails.includes(emailData)) {
            alert("이미 사용 중인 이메일입니다.");
            return;
        }
    }

    const authCode = generateAuthCode(6);

    const scriptURL = "https://script.google.com/macros/s/AKfycbz1rE9h2EciLTdWw5W0_Kz62plzd7S2fM_0CaIdwp-B7VAWLQyWEXisUN86inxLP-LZ_Q/exec";

    const response = await fetch(scriptURL, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({
            subject: '회원가입 본인 확인 인증 코드',
            body: `안녕하세요,\n\n요청하신 본인 확인 인증 코드는 다음과 같습니다 :\n\n"${authCode}"\n\n이 코드를 입력하여 본인 확인을 완료해주세요.`,
            email: emailData
        })
    });

    const result = await response.text();

    if (result === "이메일 전송 완료") {

        sessionStorage.setItem('authJoinEmail', emailData);
        sessionStorage.setItem('authJoinCode', authCode);

        showError($('.errorEmail'), `${emailData}로 인증코드가 전송되었습니다`);
        $('.doJoin_code').removeClass('hidden');
    } else {
        showError($('.errorEmail'), `이메일 전송에 실패했습니다. 다시 시도해주세요.`);
    }
};

window.verifyCode = async function () {
    const $codeData = $('input[name="code"]');
    const inputCode = $codeData.val().trim();

    const storedEmail = sessionStorage.getItem('authJoinEmail');
    const storedCode = sessionStorage.getItem('authJoinCode');

    if (!storedEmail || !storedCode) {
        showError($('.errorEmail'), '인증 과정에 문제가 발생했습니다. 다시 시도해주세요.');
        return;
    }

    if (!inputCode || inputCode.length !== 6) {
        showError($('.errorEmail'), '인증 코드를 정확히 입력해주세요.');
        return;
    }

    if (inputCode === storedCode) {
        sessionStorage.setItem('isVerifyCode', true);
        sessionStorage.removeItem('authJoinEmail');
        sessionStorage.removeItem('authJoinCode');
        $('.doJoin_code').addClass('hidden');
        showError($('.errorEmail'), '인증 성공! 요청 버튼을 눌러 회원가입을 완료하세요');
    } else {
        showError($('.errorEmail'), '인증 코드가 잘못되었습니다. 다시 시도해주세요.');
    }
};