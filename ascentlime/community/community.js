window.onerror = function () {
    window.location.href = 'https://eichi2514.github.io/ascentlime/restricted/restricted';
    return true;
};

// 로그인 기능 구현
$('.login-form').submit(async function (event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 막음

    const loginId = $('input[name="loginId"]').val().trim();
    const loginPw = $('input[name="loginPw"]').val().trim();

    if (!loginId) {
        alert('아이디를 입력해주세요.');
        return;
    }
    if (!loginPw) {
        alert('비밀번호를 입력해주세요.');
        return;
    }

    try {
        const memberData = await loginIdCheck(loginId);
        if (memberData) {
            let loginSuccess = false;
            const salt = memberData.salt;

            const hashedPassword = await hashPassword(loginPw, salt);

            if (memberData.loginPw === hashedPassword) {
                loginSuccess = true;
                alert(memberData.nickname + '님 환영합니다');
                await login(memberData.key);
            }

            if (!loginSuccess) {
                alert('비밀번호가 올바르지 않습니다.');
            }

        } else {
            alert(loginId + '는(은) 존재하지 않습니다.');
        }

    } catch (error) {
        console.error("로그인 확인 중 오류 발생:", error);
        alert('로그인 확인 중 오류가 발생했습니다.');
    }
});

// 비밀번호 해시화 함수
async function hashPassword(password, salt) {
    if (!window.crypto?.subtle) {
        alert("해당 브라우저에서는 지원되지 않습니다. 다른 브라우저를 사용하세요.");
        return null;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
}

const $login = $(".login");
const $logout = $(".logout");

$('.logout_bt').on('click', function () {
    localStorage.removeItem('nickname');
    $login.addClass("hidden");
    $logout.removeClass("hidden");
});

async function login(nickname) {
    localStorage.setItem('nickname', nickname);
    const data = await loginKeyCheck(nickname);

    // 로컬스토리지 있는지 확인 후 저장
    if (!localStorage.getItem(nickname)) {
        localStorage.setItem(nickname, JSON.stringify({
            name: nickname,
            floor: 1,
            room: 0,
            hp: 100,
            power: 0,
            speed: 50,
            weaponId: 1,
            weaponUpgrade: 0,
            clearTime: 0
        }));
        localStorage.setItem(nickname + 'weaponFind1', true);
        alert('처음 오셨군요 화면에 보이는 슬라임에 마우스를 올려보세요!');
    }

    // 닉네임 입력창 교체
    $logout.addClass("hidden");
    $login.removeClass("hidden");
    $(".member_name1").text(data + "님")
}