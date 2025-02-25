window.onerror = function () {
   window.location.href = 'https://eichi2514.github.io/ascentlime/restricted/restricted';
   return true;
};

// window.location.href = 'https://eichi2514.github.io/ascentlime/restricted/restricted';

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
                alert('아이디 또는 비밀번호가 잘못되었습니다.');
            }

        } else {
            alert('아이디 또는 비밀번호가 잘못되었습니다');
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
const $loginBg = $(".login-bg");
const $logout_bt = $(".logout_bt");

$('.logout_bt').on('click', function () {
    localStorage.removeItem('nickname');
    $login.addClass("hidden");
    $logout_bt.addClass("hidden");
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
        localStorage.setItem(nickname + 'playCount', (parseInt(localStorage.getItem(nickname + 'playCount')) || 0) + 1);
        alert('처음 오셨군요 화면에 보이는 슬라임에 마우스를 올려보세요!');
    }

    // 닉네임 입력창 교체
    $logout.addClass("hidden");
    $login.removeClass("hidden");
    $logout_bt.removeClass("hidden");
    $(".member_name1").text(data + "님")
    $loginBg.toggle('hidden');
}

async function login_check() {
    if (localStorage.getItem('nickname')) {
        const data = await loginKeyCheck(localStorage.getItem('nickname'));
        if (data !== null) {
            $logout.addClass("hidden");
            $login.removeClass("hidden");
            $(".member_name1").text(data + "님");
        } else {
            localStorage.clear();
        }
    } else {
        $login.addClass("hidden");
        $logout_bt.addClass("hidden");
        $logout.removeClass("hidden");
    }
}

$(document).ready(function () {
    const userAgent = navigator.userAgent.toLowerCase();

    // 카카오톡 인앱 브라우저인지 감지
    if (userAgent.includes("kakaotalk")) {
        $('.body').addClass('hidden');
        const alertDiv = $('<div>')
            .html(`
            <div style="position:fixed; top:50%; left:0; width:100%; background:#ffeb3b; padding:1vh; gap: 2vh; text-align:center; font-weight:bold; display:flex; justify-content:center; align-items:center; flex-direction:column; transform: translateY(-50%);">
                <span>⚠️ 원활한 이용을 위해</span> 
                <a href="#" id="openChrome" style="display:inline-flex; text-decoration:none; border:2px solid #f1c40f; border-radius:2vh; padding:1vh; align-items:center;">
                    <img src="https://github.com/user-attachments/assets/c52f19f8-2b86-45a2-87e3-34de5a538ec3" alt="Chrome" style="width:10vh; height:10vh; vertical-align:middle; margin-right:1vh;">
                    Chrome에서 열기
                </a> 
                <span>또는</span>
                <a href="#" id="openNaver" style="display:inline-flex; text-decoration:none; border:2px solid #f1c40f; border-radius:2vh; padding:1vh; align-items:center;">
                    <img src="https://github.com/user-attachments/assets/21ddeb0c-1c7b-4a10-929f-24c64e877bd2" alt="Naver" style="width:10vh; height:10vh; vertical-align:middle; margin-right:1vh;">
                    Naver에서 열기
                </a>
                <span>를 터치해주세요!</span>
            </div>
            `);

        $('body').append(alertDiv);

        $('#openChrome').on('click', function () {
            window.location.href = "intent://www.h2514.site/ascentlime#Intent;scheme=https;package=com.android.chrome;end;";
        });

        $('#openNaver').on('click', function () {
            window.location.href = "intent://www.h2514.site/ascentlime#Intent;scheme=https;package=com.nhn.android.search;end;";
        });
    }

    login_check().then();
});

const motivationTexts = [
    '2025년 2월 4일 무기 강화 시스템이 추가되었습니다. 많은 관심 부탁드립니다.',
    '2025년 2월 11일 커뮤니티 기능이 추가되었습니다. 많은 관심 부탁드립니다.',
    '2025년 2월 19일 프로필 이미지 변경 기능이 추가되었습니다. 많은 관심 부탁드립니다.'
];

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

$('.motivation_container').text(motivationTexts[getRandom(0, motivationTexts.length - 1)]);