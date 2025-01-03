$(document).ready(function () {
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
        }

        localStorage.setItem('nickname', nickname);

        // 로컬스토리지 있는지 확인 후 저장
        // name, floor, room, hp, power, speed, weaponId, clearTime
        if (!localStorage.getItem(nickname)) {
            localStorage.setItem(nickname, nickname + "/1/0/100/0/50/1/0");
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