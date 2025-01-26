/* function randomString() {
    return Math.random().toString(36).substring(2, 9); // 7자리 랜덤 문자열
} */

const restrictedNicknames = ['chi', 'Eichi', '에이치', '빨간이치', 'admin', '관리자'];

$(document).ready(function () {
    $('.login_out_bt').on('click', function () {
        localStorage.removeItem('nickname');
        $(".login").addClass("hidden");
        $(".logout").removeClass("hidden");
    });

    // 닉네임 검사를 위한 함수
    function validateNickname(nickname) {
        const trimmedNickname = nickname.trim();

        // 값이 비어있는지 확인
        if (trimmedNickname === '') {
            return '닉네임을 입력해주세요';
        }

        // 특수문자 확인 (정규식)
        const specialCharPattern = /[^a-zA-Z0-9가-힣]/; // 한글, 영문, 숫자 외의 문자
        if (specialCharPattern.test(trimmedNickname)) {
            return '한글, 영문, 숫자만 사용해 주세요. <br> (특수기호, 공백 사용 불가)';
        }

        // 사용 불가능한 닉네임 확인
        if (restrictedNicknames.includes(trimmedNickname)) {
            return '사용할 수 없는 닉네임 입니다.';
        }

        // 닉네임 글자수 제한
        if (trimmedNickname.length > 7) {
            return '닉네임은 7글자 이하로 입력해주세요!';
        }

        if (trimmedNickname.length < 3) {
            return '닉네임은 최소 3글자 이상이어야 합니다!';
        }

        return ''; // 에러가 없으면 빈 문자열 반환
    }

    $('.pw').on('click', function () {
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

    $('.id').on('input', function () {
        const nickname = $(this).val().trim();
        const errorMessage = validateNickname(nickname);

        // 오류 메시지가 있으면 화면에 표시, 없으면 숨기기
        if (errorMessage) {
            $('.nicknameError').html('* ' + errorMessage).show();
        } else {
            $('.nicknameError').html('* 사용가능한 닉네임 입니다.').show();
        }
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