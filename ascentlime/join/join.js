
window.onerror = function () {
    window.location.href = 'https://eichi2514.github.io/ascentlime/restricted/restricted';
    return true;
};

const restrictedNicknames = ['chi', 'Eichi', '에이치', '빨간이치', 'admin', '관리자'];
const specialCharPattern = /[^a-zA-Z0-9가-힣]/; // 한글, 영문, 숫자 외의 문자

function checkRestrictedNickname(nickname) {
    return restrictedNicknames.includes(nickname);
}

function handleInputValidation(inputClass, validationFunction, errorMessageClass, fieldName) {
    $(inputClass).on('input', async function () {
        const inputValue = $(this).val().trim();
        const $error = $(errorMessageClass);

        if (!inputValue) {
            $error.html(`* ${fieldName}을(를) 입력해주세요.`).show();
            return;
        } else if (specialCharPattern.test(inputValue) && fieldName === '닉네임') {
            $error.html(`* 한글, 영문, 숫자만 사용해 주세요. <br> (특수기호, 공백 사용 불가)`).show();
            return;
        } else if ((inputValue.length < 3 || inputValue.length > 7) && fieldName === '닉네임') {
            $error.html(`* ${fieldName}은 3~7자여야 합니다.`).show();
        } else if (checkRestrictedNickname(inputValue) && fieldName === '닉네임') {
            $error.html('* 사용 불가능한 닉네임입니다.').show();
        }

        const isDuplicate = await validationFunction(inputValue);
        if (isDuplicate) {
            $error.html(`* 이미 사용 중인 ${fieldName}입니다.`).show();
        } else {
            $error.html(' ').hide();
        }
    });
}

$(document).ready(function () {
    $("form").submit(async function (event) {
        event.preventDefault();

        const member = {
            loginId: $("input[name='loginId']").val().trim(),
            loginPw: $("input[name='loginPw']").val().trim(),
            nickname: $("input[name='nickname']").val().trim(),
            name: $("input[name='name']").val().trim()
        };

        const loginPw2 = $("input[name='loginPw2']").val().trim();

        if (!member.loginId) {
            alert("아이디를 입력해주세요.");
            return;
        } else if (!member.loginPw) {
            alert("비밀번호를 입력해주세요.");
            return;
        } else if (!loginPw2) {
            alert("재확인 비밀번호를 입력해주세요.");
            return;
        } else if (member.loginPw !== loginPw2) {
            alert("재확인 비밀번호가 틀렸습니다.");
            return;
        } else if (!member.nickname) {
            alert("닉네임을 입력해주세요.");
            return;
        } else if (checkRestrictedNickname(member.nickname)) {
            alert("사용할 수 없는 닉네임입니다.");
            return;
        } else if (!member.name) {
            alert("이름을 입력해주세요.");
            return;
        }

        // key를 비동기적으로 가져옵니다.
        member.key = await getKey();

        doJoin(member);
    });

    handleInputValidation('.inputID', checkDuplicateId, '.errorID', '아이디');
    handleInputValidation('.inputNickname', checkDuplicateNickname, '.errorNickname', '닉네임');
    handleInputValidation('.inputName', null, '.errorName', '이름');

    $('.inputPW').on('input', function () {
        const PW = $(this).val().trim();
        const $errorPW = $('.errorPW');
        $errorPW.html(PW ? ' ' : '* 비밀번호를 입력해주세요.').show();
    });

    $('.inputPW2').on('input', function () {
        const PW = $('.inputPW').val().trim();
        const PW2 = $(this).val().trim();
        const $errorPW2 = $('.errorPW2');

        if (!PW2) {
            $errorPW2.html('* 재확인 비밀번호를 입력해주세요.').show();
        } else if (PW !== PW2) {
            $errorPW2.html('* 재확인 비밀번호가 틀렸습니다.').show();
        } else {
            $errorPW2.html(' ').show();
        }
    });
});