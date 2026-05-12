window.onerror = function () {
   // window.location.href = 'https://eichi2514.github.io/ascentlime/restricted/restricted';
};

// window.location.href = 'https://eichi2514.github.io/ascentlime/restricted/restricted';

// 엔터 키를 누르면 폼 제출
$('.login-form input, .login-form #confirm-checkbox').on('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // 기본 동작을 막음
        $('.login-form').submit(); // 폼 수동 제출
    }
});

// 로그인 기능 구현
$('.login-form').submit(async function (event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 막음

    const loginId = $('input[name="loginId"]').val().trim();
    const loginPw = $('input[name="loginPw"]').val().trim();
    const isChecked = $('#confirm-checkbox').prop('checked');

    if (!loginId) {
        alert('아이디를 입력해주세요.');
        return;
    }
    if (!loginPw) {
        alert('비밀번호를 입력해주세요.');
        return;
    }

    $(this).append(`
        <div class="loading-spinner">
            <div class="spinner"></div>
        </div>
    `);

    try {
        const memberData = await loginIdCheck(loginId);
        if (memberData) {
            // await saveLocalDataToDB(memberData.key)
            const salt = memberData.salt;

            const hashedPassword = await hashPassword(loginPw, salt);

            if (memberData.loginPw === hashedPassword) {

                if (isChecked) {
                    localStorage.setItem('nickname', memberData.key);
                } else {
                    sessionStorage.setItem('nickname', memberData.key);
                }

                alert(memberData.nickname + '님 환영합니다');
                await characCheck(memberData.key);
                location.reload();
            } else {
                alert('로그인 오류 (코드: L-178) 아이디 또는 비밀번호가 올바르지 않습니다.');
            }

        } else {
            alert('로그인 오류 (코드: L-486) 아이디 또는 비밀번호가 올바르지 않습니다.');
        }

    } catch (error) {
        console.error("로그인 확인 중 오류 발생:", error);
        alert('로그인 확인 중 오류가 발생했습니다.');
    }
});

// 비밀번호 해시화 함수
async function hashPassword(password, salt) {
    const scriptURL = "https://script.google.com/macros/s/AKfycbxD1axioR1FicH70pnzgTMS-kBmszf8T_ivRpPJoZqCXM8dhWbj8BxO8rQp4Gmf3psenQ/exec";

    if (!password || !salt) {
        alert('잘못된 접근 방식입니다.');
        return null;
    }

    try {
        /*
        const response = await fetch(scriptURL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                password: password,
                salt: salt
            })
        });

        const hashedPassword = await response.text();
         */
        return password.trim();

    } catch (error) {
        console.error("비밀번호 해싱 중 오류 발생:", error);
        return null;
    }
}

$logout = $('.logout');
$login = $('.login');

$('.logout_bt').on('click', function () {
    localStorage.removeItem('nickname');
    sessionStorage.removeItem('nickname')
    location.reload();
});

async function login_check() {
    const nickname = localStorage.getItem('nickname') || sessionStorage.getItem('nickname');

    if (nickname) {
        const data = await loginKeyCheck(nickname);
        if (data !== null) {
            $logout.addClass("hidden");
            $login.removeClass("hidden");
            $(".member_name1").text(`${data}님`);
            notifyCheck();
            checkDailyReward();
        }
    } else {
        $login.addClass("hidden");
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
            window.location.href = "intent://eichi2514.github.io/ascentlime#Intent;scheme=https;package=com.android.chrome;end;";
        });

        $('#openNaver').on('click', function () {
            window.location.href = "intent://eichi2514.github.io/ascentlime#Intent;scheme=https;package=com.nhn.android.search;end;";
        });
    }

    login_check().then();
});

const motivationTexts = [
    '⚔️ 강해지고 싶나요? 2025년 2월 4일, [무기 강화 시스템]이 등장했습니다! 지금 바로 강화를 시작해보세요! ⚔️',
    '💬 다른 유저들과 함께! 2025년 2월 11일, [커뮤니티 기능]이 오픈됐습니다! 새로운 사람들과 소통해보세요! 💬',
    '🎨 나만의 개성을 뽐내자! 2025년 2월 19일, [프로필 이미지 변경 기능]이 추가됐습니다! 당신만의 스타일을 보여주세요! 🎨',
    '🛒 쇼핑 타임! 2025년 3월 15일, [상점 기능] 출시! 필요한 아이템을 지금 바로 구매하세요! 🛒',
    '🌱 수확의 기쁨! 2025년 3월 26일, [정원 기능]이 열렸습니다! 나만의 정원을 가꾸고 소소한 보상을 받아보세요! 🌱',
    '🤝 친구와 함께 플레이! 2025년 4월 2일, [친구 및 1:1 채팅 기능]이 추가됐습니다! 새로운 친구를 사귀고 대화를 나눠보세요! 🤝',
    '🤖 더 똑똑해졌어요! 2025년 4월 6일, [AscentLime 채팅봇 기능]이 추가됐습니다! 궁금한 점은 언제든지 물어보세요! 🤖'
];

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

$('.motivation_container').text(motivationTexts[getRandom(0, motivationTexts.length - 1)]);