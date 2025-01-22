/* function randomString() {
    return Math.random().toString(36).substring(2, 9); // 7자리 랜덤 문자열
} */

const nicknames = ['chi', 'Eichi', '에이치', '이치', '치', '빨간이치', 'G에이치'];

$(document).ready(function () {
    $('.start-text').on('click', function () {
        const fullscreenTarget = document.documentElement; // HTML 문서 전체를 대상으로
        if (fullscreenTarget.requestFullscreen) {
            fullscreenTarget.requestFullscreen();
        } else if (fullscreenTarget.webkitRequestFullscreen) { // Safari 대응
            fullscreenTarget.webkitRequestFullscreen();
        } else if (fullscreenTarget.msRequestFullscreen) { // IE 대응
            fullscreenTarget.msRequestFullscreen();
        } else {
            alert('이 브라우저는 전체 화면 모드를 지원하지 않습니다.');
        }
    });

    $('.login_out_bt').on('click', function () {
        localStorage.removeItem('nickname');
        $(".login").addClass("hidden");
        $(".logout").removeClass("hidden");
    });

    $('.pw').on('click', function () {
        // id 입력값 가져오기
        const nickname = $('.id').val();

        // 값이 비어있는지 확인
        if (nickname.trim() === '') {
            alert('닉네임을 입력해주세요!');
            return;
        } else {
            for (let i = 0; i < nicknames.length; i++) {
                if (nickname.trim() === nicknames[i]) {
                    alert('사용할 수 없는 닉네임 입니다.');
                    return;
                }
            }
        }

        // 닉네임 글자수 제한
        if (nickname.length > 7) {
            alert('닉네임은 7글자 이하로 입력해주세요!');
            return;
        }

        localStorage.setItem('nickname', nickname);

        // 로컬스토리지 있는지 확인 후 저장
        // name, floor, room, hp, power, speed, weaponId, clearTime
        if (!localStorage.getItem(nickname)) {
            localStorage.setItem(nickname, JSON.stringify({
                name: nickname,
                floor: 1,
                room: 0,
                hp: 100,
                power: 0,
                speed: 50,
                weaponId: 1,
                clearTime: 0
            }));
            localStorage.setItem(nickname + 'weaponFind1', true);
            saveInfos(nickname);
            alert('처음 오셨군요 화면에 보이는 슬라임에 마우스를 올려보세요!');
        }

        // 닉네임 입력창 교체
        $(".logout").addClass("hidden");
        $(".login").removeClass("hidden");
        $(".member_name1").text(nickname + "님")
    });

    function login_chack() {
        if (localStorage.getItem('nickname')) {
            $(".logout").addClass("hidden");
            $(".login").removeClass("hidden");
            $(".member_name1").text(localStorage.getItem('nickname') + "님")
        } else {
            $(".login").addClass("hidden");
            $(".logout").removeClass("hidden");
        }
    }

    login_chack();
});