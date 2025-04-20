const nickname = localStorage.getItem('nickname') || sessionStorage.getItem('nickname');

if (!nickname) {
    alert('잘못된 접근 방식입니다.');
    history.back();
}

// 캐릭터 위치 변수
let LR = 10;
let UD = 44;

// 페이지가 시작될 때 시간 기록
const startTime = new Date().getTime();
let estimatedLoadTime = 1500; // 예상 로드 시간

// 페이지 로딩 중에 로딩 바가 점진적으로 증가하도록 설정
const interval = setInterval(function () {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - startTime;

    // 경과된 시간에 비례해 로딩 바 너비 설정 (최대 80vh)
    const width = Math.min((elapsedTime / estimatedLoadTime) * 80, 80);
    $(".loding_bar").css("width", width + "vh");

    // 페이지가 로드되기 전에 80vh에 도달하지 않도록 안전하게 제한
    if (width >= 80) {
        clearInterval(interval); // 최대 너비에 도달하면 애니메이션 정지
    }
}, 100); // 100ms 마다 로딩 바 업데이트

// 윈도우 로딩 체크
let windowCheck = false;

// window.onload 이벤트 감지
window.onload = function () {
    // console.clear();
    const loadTime = new Date().getTime() - startTime;

    // 실제 로드 시간이 예상 시간을 초과하지 않으면, 비율로 로딩 바 채우기
    const finalWidth = Math.min((loadTime / estimatedLoadTime) * 80, 80);
    $(".loding_bar").css("width", finalWidth + "vh");

    // 로딩 바가 완료된 후 로딩 화면 서서히 제거
    setTimeout(function () {
        $(".loding").fadeOut(500);
    }, 500);  // 로드가 완료되면 잠시 후 로딩 화면 제거

    setTimeout(function () {
        windowCheck = true;
        startTypingAnimation(dialogueStep);
    }, 1000);
}

let moveInterval; // 캐릭터 이동을 위한 interval
let moveActionCheck = null; // 현재 움직이고 있는 방향 추적
let lastKeyDirection = null; // 마지막으로 처리된 키 방향
let isCharControl = true;

$(window).keydown(function (e) {
    const $characImg = $('.front_charac_img');

    if (isCharControl) return;

    const keyMap = {
        37: {direction: 'left', scale: -1},
        38: {direction: 'up'},
        39: {direction: 'right', scale: 1},
        40: {direction: 'down'}
    };

    const keyAction = keyMap[e.keyCode];
    if (keyAction && moveActionCheck !== keyAction.direction) {
        // 중복된 키 입력 방지
        if (lastKeyDirection === keyAction.direction) return;
        lastKeyDirection = keyAction.direction;

        // 방향에 따라 이미지 반전
        if (keyAction.scale !== undefined) {
            $characImg.css('transform', `scaleX(${keyAction.scale})`);
        }

        // 애니메이션 유지
        $characImg.css('animation', 'move_action' + keyAction.scale + ' 1s linear infinite');

        // 이동 시작
        startMoving(keyAction.direction);
    }

    if (e.keyCode === 13) {
        processItemAction();
    }
});

function startMoving(moveAction) {
    // 이미 해당 방향으로 움직이고 있으면 중복 방지
    if (moveActionCheck === moveAction) return;

    // 새로운 방향으로 이동 시작
    stopMoving(); // 이전 움직임을 중지하고 새로운 움직임 시작
    moveActionCheck = moveAction;

    moveInterval = setInterval(function () {
    moveCharacter(moveAction, 1)
    }, 50);
}

function stopMoving() {
    if (moveInterval) {
        clearInterval(moveInterval); // 이전 움직임 중지
        moveInterval = null; // interval 초기화
    }
    moveActionCheck = null; // 현재 방향 초기화
}

// 키에서 손을 뗄 때 움직임 멈춤
$(window).keyup(function (e) {

    if (isCharControl) return;

    const $characImg = $('.front_charac_img');

    // 눌렀던 방향키에서 손을 뗐을 때 이동 중지
    if ((e.keyCode === 37 && moveActionCheck === 'left') ||
        (e.keyCode === 38 && moveActionCheck === 'up') ||
        (e.keyCode === 39 && moveActionCheck === 'right') ||
        (e.keyCode === 40 && moveActionCheck === 'down')) {
            lastKeyDirection = null; // 키 입력 상태 초기화
            $characImg.css('animation', 'none');
            stopMoving();
    }

    if (e.keyCode === 65) {
        $characImg.css("transform", "scaleX(-1)");
        attack_motion(1, 'A');
    } else if (e.keyCode === 87) {
        attack_motion(1, 'W');
    } else if (e.keyCode === 68) {
        $characImg.css("transform", "scaleX(1)");
        attack_motion(1, 'D');
    } else if (e.keyCode === 83) {
        attack_motion(1, 'S');
    }
});

function moveCharacter(moveAction, something) {
    // console.log("moveAction :" + moveAction + ", mob : " + "mob" + something);

    if (!windowCheck) return;

    if (something === 1) {
        if (moveAction === 'up' && UD > 10) {
            UD -= 2;
            $(".charac").css("top", UD + "vh");
        } else if (moveAction === 'down' && UD < 80) {
            UD += 2;
            $(".charac").css("top", UD + "vh");
        } else if (moveAction === 'left' && LR > 10) {
            LR -= 2;
            $(".charac").css("left", LR + "vh");
        } else if (moveAction === 'right' && LR < 80) {
            LR += 2;
            $(".charac").css("left", LR + "vh");
        }
    }
}

// 공격 모션 실행 함수
function attack_motion(something, motion) {
    const Distance = 10;
    const weaponImg = "https://github.com/user-attachments/assets/98a45b38-4cb3-4ee4-b8f7-28205ff39cb6";
    const $attackElement = $(`<img class="weapon_img attackSize attack${something} absolute" src="${weaponImg}" alt=""/>`);

    $('.front_charac').append($attackElement);

    // 약간의 딜레이 후에 css 를 변경해 이동하는 모습을 표현
    setTimeout(function () {
        if (motion === 'A') {
            $attackElement.css({
                left: (-4 - (Distance * 2)) + "vh",
                transform: "scaleX(-1)"
            });
        } else if (motion === 'W') {
            $attackElement.css({
                top: (-4 - (Distance * 2)) + "vh",
                transform: "rotate(270deg)"
            });
        } else if (motion === 'D') {
            $attackElement.css('left', (22 + (Distance * 2)) + "vh");
        } else if (motion === 'S') {
            $attackElement.css({
                top: (22 + (Distance * 2)) + "vh",
                transform: "rotate(90deg)"
            });
        }
    }, 10);  // 10ms 정도의 짧은 딜레이를 줘서 CSS 변경을 애니메이션으로 적용
    // 0.5초 뒤에 애니메이션이 끝나고 제거
    setTimeout(function () {
        $attackElement.remove();
    }, 500);  // 애니메이션 시간 500ms 이후
}

let dialogueStep = 0;
let typingInProgress = false;

const name = '우루루';

const dialogues = [
    { speakerName: `${name}`, dialogue: "??? 여긴... 어디지?" },
    { speakerName: `???`, dialogue: "안녕! 드디어 왔구나. 이곳에 온 걸 환영해!" },
    { speakerName: `${name}`, dialogue: "너... 누구야?" },
    { speakerName: `???`, dialogue: "내 이름은 에이치야!" },
    { speakerName: `에이치`, dialogue: "지금부터 네가 이 탑을 공략하는 걸 도와주러 왔어!" },
    { speakerName: `${name}`, dialogue: "탑? 공략...? 여긴 대체 뭐야?" },
    { speakerName: `에이치`, dialogue: "지금 너는 내 몸 안에 들어와 있는 상태야." },
    { speakerName: `에이치`, dialogue: "원래 이 탑은 우리 정령들이 평화롭게 살던 곳이었는데..." },
    { speakerName: `에이치`, dialogue: "어느 날 갑자기 슬라임들이 쳐들어와서 지금은 완전히 점령당했어." },
    { speakerName: `에이치`, dialogue: "그래서 지금은 슬라임의 탑이 돼버렸지..." }
];

function startTypingAnimation(step) {
    const targetSelector = "#typingTarget";
    const $speakerName = $('.speaker-name');
    const $speechTail = $('.speech-tail');
    const $dialogueText = $('.dialogue-text');
    const $characterImage = $('.character-image');
    const $eichiImage = $('.eichi-image');

    const currentDialogue = dialogues[step];

    $speakerName.text(currentDialogue.speakerName);

    if (currentDialogue.speakerName === "에이치" || currentDialogue.speakerName === "???") {
        // $speakerName.css('text-align', 'right');
        $speechTail.css('left', '77vh');
        // $dialogueText.css('text-align', 'right');
        $characterImage.fadeOut(500).addClass('hidden');
        $eichiImage.fadeIn(500).removeClass('hidden');
    } else {
        // $speakerName.css('text-align', 'left');
        $speechTail.css('left', '20vh');
        // $dialogueText.css('text-align', 'left');
        $eichiImage.fadeOut(500).addClass('hidden');
        $characterImage.fadeIn(500).removeClass('hidden');
    }

    typingInProgress = true;

    TypeHangul.type(targetSelector, {
        text: currentDialogue.dialogue,
        intervalType: 50
    });

    setTimeout(() => {
        typingInProgress = false;
        $('.dialogue-box').append(`<div class="dialogue-next">>>></div>`);
    }, currentDialogue.dialogue.length * 150);

    dialogueStep = step + 1;
}

$(document).on('click', '.dialogue-next', function () {
    if (typingInProgress) return;

    $('.dialogue-next').remove();
    startTypingAnimation(dialogueStep);
});