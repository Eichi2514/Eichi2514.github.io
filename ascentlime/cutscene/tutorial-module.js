// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    query,
    orderByChild,
    equalTo,
    get
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase 설정
const firebaseConfig = {
    apiKey: ".env/apiKey",
    authDomain: ".env/authDomain",
    databaseURL: "https://test-948ba-default-rtdb.firebaseio.com",
    projectId: ".env/projectId",
    storageBucket: ".env/storageBucket",
    messagingSenderId: ".env/messagingSenderId",
    appId: ".env/appId",
    measurementId: ".env/measurementId"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const membersRef = ref(database, 'members');

window.userName = function () {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(localStorage.getItem('nickname') || sessionStorage.getItem('nickname')));
    return get(queryRef)
        .then((snapshot) => {
            if (!snapshot.exists()) {
                console.log('해당 아이디를 찾을 수 없습니다.');
                return null;
            }

            const memberData = snapshot.val();
            const memberKey = Object.keys(memberData)[0];
            return memberData[memberKey].nickname;
        })
        .catch((error) => {
            console.error("로그인 아이디 확인 중 오류 발생:", error);
            return null;
        });
};

const nickname = localStorage.getItem('nickname') || sessionStorage.getItem('nickname');
let name = '게스트';

if (!nickname) {
    alert('잘못된 접근 방식입니다.');
    history.back();
} else {
    name = await userName();
}

// 캐릭터 위치 변수
let LR = 10;
let UD = 44;

// 페이지가 시작될 때 시간 기록
const startTime = new Date().getTime();
let estimatedLoadTime = 3000; // 예상 로드 시간

// 페이지 로딩 중에 로딩 바가 점진적으로 증가하도록 설정
const interval = setInterval(function () {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - startTime;

    // 경과된 시간에 비례해 로딩 바 너비 설정 (최대 80vh)
    const width = Math.min((elapsedTime / estimatedLoadTime) * 80, 80);
    $(".loading_bar").css("width", width + "vh");

    // 페이지가 로드되기 전에 80vh에 도달하지 않도록 안전하게 제한
    if (width >= 80) {
        clearInterval(interval); // 최대 너비에 도달하면 애니메이션 정지
    }
}, 100); // 100ms 마다 로딩 바 업데이트

// 윈도우 로딩 체크
let windowCheck = false;

// 로딩이 완료된 후 로딩 화면 제거 및 추가 작업 시작
const removeLoadingScreen = () => {
    const loadTime = new Date().getTime() - startTime;

    // 실제 로드 시간이 예상 시간을 초과하지 않으면, 비율로 로딩 바 채우기
    const finalWidth = Math.min((loadTime / estimatedLoadTime) * 80, 80);
    $(".loading_bar").css("width", finalWidth + "vh");

    console.log("로드 완료");

    // 로딩 바가 완료된 후 로딩 화면 서서히 제거
    setTimeout(function () {
        $(".loading").fadeOut(500);
    }, 500);  // 로드가 완료되면 잠시 후 로딩 화면 제거

    setTimeout(function () {
        windowCheck = true;
        startTypingAnimation(dialogueStep);
    }, 1000);
};

// 로딩이 끝날 때까지 계속 체크
const checkLoadingCompletion = () => {
    const loadTime = new Date().getTime() - startTime;
    if (loadTime >= estimatedLoadTime) {
        removeLoadingScreen();
    } else {
        setTimeout(checkLoadingCompletion, 100); // 100ms마다 계속 체크
    }
};

// 페이지 로드가 시작되면 로딩 체크 시작
checkLoadingCompletion();

let moveInterval; // 캐릭터 이동을 위한 interval
let moveActionCheck = null; // 현재 움직이고 있는 방향 추적
let lastKeyDirection = null; // 마지막으로 처리된 키 방향
let isCharControl = true;

const $characImg = $('.front_charac_img');

$(window).keydown(function (e) {
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
        const isRandomItemHidden = $random_item_text.hasClass('hidden');

        if (!isRandomItemHidden) {
            $('.item_get').click();
        } else {
            hide_alert();
        }
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
        if (dialogueStep === 20) {
            tutorialCheck();
        } else if (dialogueStep === 26 && 26 < LR && LR <= 70 && 40 < UD && UD <= 50) {
            //console.log(`LR ${LR}, UD ${UD}`);
            $('.front_mob').fadeOut(2000).addClass('hidden');
            tutorialCheck();
        }
    } else if (e.keyCode === 83) {
        attack_motion(1, 'S');
    }
});

function moveCharacter(moveAction, something) {
    // console.log("moveAction :" + moveAction + ", mob : " + "mob" + something);

    if (!windowCheck) return;

    showRandomItem_text();

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
            if (dialogueStep === 17) {
                tutorialCheck();
            }
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

const dialogues = [
    { speakerName: `${name}`, dialogue: "??? 여긴... 어디지?" }, // 0
    { speakerName: `???`, dialogue: "안녕! 드디어 왔구나. 이곳에 온 걸 환영해!" }, // 1
    { speakerName: `${name}`, dialogue: "넌... 누구야?" }, // 2
    { speakerName: `???`, dialogue: "내 이름은 에이치야!" }, // 3
    { speakerName: `에이치`, dialogue: "지금부터 네가 이 탑을 공략하는 걸 도와주러 왔어!" }, // 4
    { speakerName: `${name}`, dialogue: "탑? 공략..? 여긴 대체 뭐야?" }, // 5
    { speakerName: `에이치`, dialogue: "지금 너는 내 몸 안에 들어와 있는 상태야." }, // 6
    { speakerName: `에이치`, dialogue: "원래 이 탑은 우리 정령들이 평화롭게 살던 곳이었는데..." }, // 7
    { speakerName: `에이치`, dialogue: "어느 날 갑자기 슬라임들이 쳐들어와서 지금은 완전히 점령당했어." }, // 8
    { speakerName: `에이치`, dialogue: "그래서 지금은 슬라임의 탑이 돼버렸지..." }, // 9
    { speakerName: `에이치`, dialogue: "슬라임들을 물리치고, 우리 탑을 되찾아줘!" }, // 10

    { speakerName: `에이치`, dialogue: "우리를 도와주러 온 거 아니야? 😢" }, // 11
    { speakerName: `에이치`, dialogue: "괜찮아, 내가 옆에서 계속 도와줄게!" }, // 12
    { speakerName: `에이치`, dialogue: "자신 없어도 돼, 시작이 반이래!" }, // 13
    { speakerName: `에이치`, dialogue: "너 아니면 안 돼… 진짜로!" }, // 14
    { speakerName: `에이치`, dialogue: "겁나도 괜찮아. 우리 같이 천천히 해보자!" }, // 15

    { speakerName: `에이치`, dialogue: "좋아! 그럼 먼저 → 키를 눌러서 앞으로 가볼래?" }, // 16
    { speakerName: `에이치`, dialogue: "오른쪽으로 이동" }, // 17
    { speakerName: `에이치`, dialogue: "잘했어! ↑ ↓ ← → 키로 상하좌우로 자유롭게 움직일 수 있어" }, // 18

    { speakerName: `에이치`, dialogue: "이제 D키를 눌러서 공격해봐!" }, // 19
    { speakerName: `에이치`, dialogue: "오른쪽 공격" }, // 20
    { speakerName: `에이치`, dialogue: "오~ 역시 배우는 속도가 빠른걸?" }, // 21
    { speakerName: `에이치`, dialogue: "지금은 내 도움 덕분에 공격 범위가 넓지만" }, // 22
    { speakerName: `에이치`, dialogue: "본격적으로 탑 안에 들어가면 공격 거리가 짧아질 거야." }, // 23
    { speakerName: `에이치`, dialogue: "그러니까 몬스터들을 쓰러뜨리면서 스탯이나 무기를 얻어서 점점 강해져야 해!" }, // 24

    { speakerName: `에이치`, dialogue: "자, 저기 앞에 있는 블루 슬라임을 처치해볼래?" }, // 25
    { speakerName: `에이치`, dialogue: "슬라임 처치" }, // 26
    { speakerName: `에이치`, dialogue: "오! 처음 치고는 정말 잘했어!" }, // 27

    { speakerName: `에이치`, dialogue: "슬라임을 처치하면 가끔 '수상한 알약'이 떨어져." }, // 28
    { speakerName: `에이치`, dialogue: "저기! 하나 생겼네? 가서 먹어볼래?" }, // 29
    { speakerName: `에이치`, dialogue: "알약 획득" }, // 30
    { speakerName: `에이치`, dialogue: "수상한 알약을 먹으면 스탯이 증가할 수도 있고 반대로 감소할수도 있으니까," }, // 31
    { speakerName: `에이치`, dialogue: `먹을지 말지는 ${name} 네 선택이야!` }, // 32

    { speakerName: `에이치`, dialogue: "이제 진짜 슬라임의 탑에 도전해보자!" }, // 33
    { speakerName: `에이치`, dialogue: "앞으로도 도움이 필요하면 언제든지 날 불러줘!" }, // 34
    { speakerName: `에이치`, dialogue: "나는 메인 화면 왼쪽 아래에 있으니까 꼭 기억해!" }, // 35
    { speakerName: `에이치`, dialogue: `그럼... 힘내, ${name}! 🌟` }, // 36

    { speakerName: `에이치`, dialogue: "끝" } // 37
];

function startTypingAnimation(step) {
    $('.dialogue-next, .dialogue-positive, .dialogue-negative').remove();

    const targetSelector = "#typingTarget";
    const $speakerName = $('.speaker-name');
    const $speechTail = $('.speech-tail');
    const $dialogueText = $('.dialogue-text');
    const $characterImage = $('.character-image');
    const $eichiImage = $('.eichi-image');

    const currentDialogue = dialogues[step];

    $speakerName.text(`${currentDialogue.speakerName}`);

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
        intervalType: 30
    });

    setTimeout(() => {
        typingInProgress = false;
        // console.log(step);
        // console.log(step >= 10);
        // console.log(15 <= step);
        if (10 <= step && step <= 15) {
            choices();
        } else if (step === 17 || step === 20 || step === 26 || step === 30) {
            startTutorialAction();
        } else if (step === 37) {
            window.location.href = "../map/map.html";
        } else {
            $('.dialogue-box').append(`<div class="dialogue-next">>>></div>`);
            dialogueStep = step + 1;
        }
    }, currentDialogue.dialogue.length * 120);
}

$(window).keydown(function (e) {
    if (!windowCheck) return;

    if (e.keyCode === 32) {
        $('.dialogue-next').click();
    }
});

$(document).on('click', '.dialogue-next', function () {
    if (typingInProgress) return;
    startTypingAnimation(dialogueStep);
});

const positives = [
    "그래 나만 믿어! 내가 도와줄게",
    "아아... 맞다! 도와줄게! (살짝 귀찮지만...)",
    "응! 같이 힘내보자",
    "뭔진 잘 몰라도 재밌을 것 같아!",
    "오케이! 나 준비됐어!"
]

const negatives = [
    "음... 근데... 나 그런 거 잘 못하는데...?",
    "무섭기도 하고... 자신 없어",
    "내가 해도 괜찮을까...?",
    "어쩐지 좀 불안한데...",
    "그냥 집에 가면 안 될까?"
]

function choices() {
    const random1 = Math.floor(Math.random() * positives.length);
    const random2 = Math.floor(Math.random() * positives.length);
    
    $('.dialogue-box').append(`
        <div class="dialogue-positive">${positives[random1]}</div>
        <div class="dialogue-negative">${negatives[random2]}</div>
    `);
}

$(document).on('click', '.dialogue-positive', function () {
    if (typingInProgress) return;

    dialogueStep = 16;
    startTypingAnimation(dialogueStep);
});

$(document).on('click', '.dialogue-negative', function () {
    if (typingInProgress) return;

    const random = Math.floor(Math.random() * 5) + 11;

    dialogueStep = random;
    startTypingAnimation(dialogueStep);
});

function startTutorialAction() {
    $('.dialogue-container').addClass('hidden');
    $('.front_charac').removeClass('hidden');

    // console.log(dialogueStep);

    if (dialogueStep === 26) {
        $('.front_mob').fadeIn(50).removeClass('hidden');
    } else if (dialogueStep === 30) {
        $('.random_item').removeClass('hidden');
    }

    isCharControl = false;
}

function tutorialCheck() {
    dialogueStep++;

    setTimeout(() => {
        $('.dialogue-container').removeClass('hidden');
        $('.front_charac').addClass('hidden');
        isCharControl = true;
        startTypingAnimation(dialogueStep);
    }, 1000);
}

const $random_item = $('.random_item');
const $random_item_text = $('.random_item_text');

// 랜덤아이템 안내창 공개
function showRandomItem_text() {
    let randomItemCheck = $random_item.hasClass('hidden');
    // console.log("아이템 공개 여부"+itemCheck);
    if (UD > 64 && UD < 76 && LR < 56 && LR > 34 && !randomItemCheck) {
        $random_item_text.fadeIn(1000).removeClass('hidden');
    }
}

//랜덤아이템 안내창 먹는다 버튼 눌렀을 떄
$(document).on('click', '.item_get', function () {
    show_alert('힘+1');
    $random_item.fadeOut(1000).addClass('hidden');
    $random_item_text.fadeOut(1000).addClass('hidden');
});

//아이템 안내창 취소 버튼 눌렀을 떄
$(document).on('click', '.item_exit', function () {
    $random_item_text.fadeOut(1000).addClass('hidden');
});

const $alert = $('.alert');

function show_alert(message) {
    $('.alert_title').html(message);
    $alert.fadeIn(1000).removeClass('hidden');
}

$(document).on('click', '.alert_exit', function () {
    $alert.fadeOut(1000).addClass('hidden');
    tutorialCheck();
});

const $touch_left = $('.key-left');
const $touch_up = $('.key-up');
const $touch_center = $('.key-center');
const $touch_right = $('.key-right');
const $touch_down = $('.key-down');

const handleTouchStart = (direction, scale) => {
    if (moveActionCheck === direction) return;
    lastKeyDirection = direction;

    if (scale !== undefined) {
        $characImg.css('transform', `scaleX(${scale})`);
    }

    $characImg.css('animation', 'move_action' + scale + ' 1s linear infinite');
    startMoving(direction);
};

const handleTouchEnd = (direction) => {
    if (moveActionCheck === direction) {
        lastKeyDirection = null;
        $characImg.css('animation', 'none');
        stopMoving();
    }
};

$touch_left.on("touchstart", () => {
    handleTouchStart('left', -1)
});

$touch_up.on("touchstart", () => {
    handleTouchStart('up')
});

$touch_center.on("touchstart", () => {
    if (dialogueStep === 27) {
        const isRandomItemHidden = $random_item_text.hasClass('hidden');

        if (!isRandomItemHidden) {
            $('.item_get').click();
        } else {
            hide_alert();
        }
    } else {
        $('.dialogue-next').click();
    }
});

$touch_right.on("touchstart", () => {
    handleTouchStart('right', 1)
});

$touch_down.on("touchstart", () => {
    handleTouchStart('down')
});

$touch_left.on("touchend", () => {
    handleTouchEnd('left')
});

$touch_up.on("touchend", () => {
    handleTouchEnd('up')
});

$touch_right.on("touchend", () => {
    handleTouchEnd('right')
});

$touch_down.on("touchend", () => {
    handleTouchEnd('down')
});

const $touch_Aattack = $('.key-Aattack');
const $touch_Wattack = $('.key-Wattack');
const $touch_Zattack = $('.key-Zattack');
const $touch_Dattack = $('.key-Dattack');
const $touch_Sattack = $('.key-Sattack');

$touch_Aattack.on("touchstart", () => {
    $characImg.css("transform", "scaleX(-1)");
    attack_motion(1, 'A');
});

$touch_Wattack.on("touchstart", () => {
    attack_motion(1, 'W');
});

$touch_Zattack.on("touchstart", () => {
    $('.dialogue-next').click();
});

$touch_Dattack.on("touchstart", () => {
    $characImg.css("transform", "scaleX(1)");
    attack_motion(1, 'D');
    if (dialogueStep === 20) {
        tutorialCheck();
    } else if (dialogueStep === 26 && 26 < LR && LR <= 70 && 40 < UD && UD <= 50) {
        //console.log(`LR ${LR}, UD ${UD}`);
        $('.front_mob').fadeOut(2000).addClass('hidden');
        tutorialCheck();
    }
});

$touch_Sattack.on("touchstart", () => {
    attack_motion(1, 'S');
});