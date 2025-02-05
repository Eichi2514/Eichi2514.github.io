window.onerror = function() {
    window.location.href = 'https://eichi2514.github.io/ascentlime/restricted/restricted';
    return true;
};

/* function randomString() {
    return Math.random().toString(36).substring(2, 9); // 7자리 랜덤 문자열
} */

window.location.href = 'https://eichi2514.github.io/ascentlime/restricted/restricted';

$(document).ready(function () {
    const $login = $(".login");
    const $logout = $(".logout");

    $('.logout_bt').on('click', function () {
        localStorage.removeItem('nickname');
        $login.addClass("hidden");
        $logout.removeClass("hidden");
    });

    $('.login_bt').on('click', function () {
        const nickname = $('.id').val();

        const errorMessage = validateNickname(nickname);

        if (errorMessage) {
            alert(errorMessage.replace(/<br>/g, '\n'));
            return;
        }

        // 로컬스토리지에 저장
        localStorage.setItem('nickname', nickname);

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
            saveInfos(nickname);
            alert('처음 오셨군요 화면에 보이는 슬라임에 마우스를 올려보세요!');
        }

        // 닉네임 입력창 교체
        $logout.addClass("hidden");
        $login.removeClass("hidden");
        $(".member_name1").text(nickname + "님")
    });

    function login_chack() {
        if (localStorage.getItem('nickname')) {
            $logout.addClass("hidden");
            $login.removeClass("hidden");
            $(".member_name1").text(localStorage.getItem('nickname') + "님")
        } else {
            $login.addClass("hidden");
            $logout.removeClass("hidden");
        }
    }

    login_chack();
});