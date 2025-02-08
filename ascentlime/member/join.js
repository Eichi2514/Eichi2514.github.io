window.onerror = function () {
    window.location.href = 'https://eichi2514.github.io/ascentlime/restricted/restricted';
    return true;
};

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const restrictedNicknames = ['chi', 'Eichi', '에이치', '빨간이치', 'admin', '관리자'];
const specialCharPattern1 = /[^a-zA-Z가-힣]/;
const specialCharPattern2 = /[^a-zA-Z0-9가-힣]/;

function checkRestrictedNickname(nickname) {
    return restrictedNicknames.includes(nickname);
}

function showError($element, message) {
    $element.html(message).show();
}

function validateInput(inputValue, fieldName) {
    if (!inputValue) return `* ${fieldName}을(를) 입력해주세요.`;
    if (fieldName === '이름' && specialCharPattern1.test(inputValue))
        return `* ${fieldName}에 한글, 영문만 사용해 주세요. <br> (특수기호, 공백, 숫자 사용 불가)`;
    if (fieldName === '닉네임' && specialCharPattern2.test(inputValue))
        return `* ${fieldName}에 한글, 영문, 숫자만 사용해 주세요. <br> (특수기호, 공백 사용 불가)`;
    if (fieldName === '닉네임' && (inputValue.length < 3 || inputValue.length > 7))
        return `* ${fieldName}은 3~7자여야 합니다.`;
    if (fieldName === '아이디' && inputValue.length < 3)
        return `* ${fieldName}는 3자 이상이어야 합니다.`;
    if (fieldName === '닉네임' && checkRestrictedNickname(inputValue))
        return '* 사용 불가능한 닉네임입니다.';
    return '';
}

async function handleInputValidation(inputClass, validationFunction, errorMessageClass, fieldName) {
    $(inputClass).on('input', async function () {
        const inputValue = $(this).val().trim();
        const $error = $(errorMessageClass);
        const errorMessage = validateInput(inputValue, fieldName);
        const isDuplicate = validationFunction ? await validationFunction(inputValue) : false;

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
            name: $('input[name="name"]').val().trim()
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

    handleInputValidation('.inputID', checkDuplicateId, '.errorID', '아이디');
    handleInputValidation('.inputNickname', checkDuplicateNickname, '.errorNickname', '닉네임');
    handleInputValidation('.inputName', null, '.errorName', '이름');

    $('.inputPW, .inputPW2').on('input', function () {
        const PW = $('.inputPW').val().trim();
        const PW2 = $('.inputPW2').val().trim();
        showError($('.errorPW'), PW ? ' ' : '* 비밀번호를 입력해주세요.');
        showError($('.errorPW2'), PW2 ? (PW !== PW2 ? '* 재확인 비밀번호가 틀렸습니다.' : ' ') : '* 재확인 비밀번호를 입력해주세요.');
    });
});