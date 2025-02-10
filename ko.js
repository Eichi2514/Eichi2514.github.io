let isTyping = false;

function startTypingAnimation() {
    // console.log(isTyping);

    if(isTyping) return;

    isTyping = true;

    // 모든 텍스트를 순서대로 처리하는 배열
    const texts = [
        {selector: '#text1', text: '안녕하세요!', delay: 200},
        {selector: '#text2', text: '협업을 통한 성장을 추구하는 개발자', delay: 1100},
        {selector: '#text3', text: '유건혁', delay: 100},
        {selector: '#text4', text: '입니다.', delay: 0}
    ];

    // 모든 텍스트 초기화
    $.each(texts, function (i, item) {
        const {selector} = item;
        $(selector).text(''); // 텍스트 초기화
    });

    let totalDelay = 0; // 누적 딜레이

    // 타이핑 애니메이션 시작
    $.each(texts, function (i, item) {
        const {selector, text, delay} = item;
        setTimeout(function () {

            $(selector).text(''); // 텍스트 초기화
            $(selector).removeClass('no-blink'); // 깜빡임 제거 및 커서 없애기
            $(selector).addClass('text'); // 기본 깜빡임 애니메이션 추가

            TypeHangul.type(selector, {
                text: text, // 텍스트 설정
                intervalType: 50 // 타이핑 속도 설정
            });

            // 타이핑이 끝난 후 깜빡임 제거
            setTimeout(function () {
                $(selector).addClass('no-blink');
            }, text.length * 100 + delay); // 텍스트가 모두 타이핑된 후 시간(타이핑 속도 * 글자수)

        }, totalDelay);

        totalDelay += text.length * 100 + delay; // 타이핑 속도와 추가 딜레이 계산
    });

    setTimeout(function () {
        isTyping = false;
    }, 7000);
}

// 애니메이션 시작
$(window).on('load', function () {
    startTypingAnimation();
});

$(document).ready(function () {
    document.querySelector(".gform").addEventListener("submit", function (event) {
        event.preventDefault(); // 폼 기본 동작 중지
        document.getElementById("submitBtn").disabled = true; // 버튼 비활성화

        // 비동기로 폼 데이터 전송
        fetch(event.target.action, {
            method: "POST",
            body: new FormData(event.target)
        })
            .then((response) => {
                if (response.ok) {
                    alert("이메일이 성공적으로 전송되었습니다!");
                } else {
                    response.text().then((errorMessage) => {
                        console.log("전송 중 오류 발생 : " + errorMessage);
                        alert("이메일 전송에 실패했습니다");
                    });
                }
            })
            .catch((error) => {
                console.log("전송 중 오류 발생 : " + error);
                alert("이메일 전송에 실패했습니다. 다시 시도해주세요.");
            })
            .finally(() => {
                document.getElementById("submitBtn").disabled = false; // 버튼 활성화
            });
    });

    const followImageBasic = document.querySelector('.mouse__basic'); // 기본 이미지 선택
    const followImageAction = document.querySelector('.mouse__action'); // 액션 이미지 선택
    let posX = 0, posY = 0;

    const isMobile = () => window.innerWidth <= 768;

    if (!isMobile()) {
        document.addEventListener('mousemove', (event) => {
            posX = event.pageX;
            posY = event.pageY;
        });

        function animate() {
            const currentX = parseFloat(followImageAction.style.left) || 0;
            const currentY = parseFloat(followImageAction.style.top) || 0;

            const offsetX = 15; // X축 오프셋
            const offsetY = 0;  // Y축 오프셋

            // 이동 속도를 조절하는 계수 (0.1 값에서 작을수록 느려짐)
            const speedFactor = 0.1; // 속도를 늦추기 위해 작게 설정

            // 기본 이미지와 액션 이미지의 거리 계산
            const distance = Math.sqrt((posX - currentX) ** 2 + (posY - currentY) ** 2); // 현재 이미지와 마우스 위치 간 거리 계산
            const threshold = 16; // 거리 임계값

            // 기본 이미지의 위치 업데이트
            followImageBasic.style.left = posX + offsetX + 'px'; // 기본 이미지 위치 업데이트
            followImageBasic.style.top = posY + offsetY + 'px';  // 기본 이미지 위치 업데이트

            if (distance > threshold) {
                followImageBasic.style.display = 'none';
                followImageAction.style.display = 'block';
                followImageAction.style.left = currentX + (posX + offsetX - currentX) * speedFactor + 'px'; // X 축으로 오프셋 추가
                followImageAction.style.top = currentY + (posY + offsetY - currentY) * speedFactor + 'px';  // Y 축으로 오프셋 추가

                // 마우스 방향을 계산하여 회전 각도 설정
                const angle = Math.atan2(posY - currentY, posX - currentX) * (180 / Math.PI); // 라디안 값을 도로 변환

                // 마우스 위치에 따라 좌우 반전 처리
                if (posX < currentX) {
                    // 왼쪽을 바라볼 때 (기본값)
                    followImageAction.style.transform = `rotate(${angle + 180}deg) scaleX(1)`;
                } else {
                    // 오른쪽을 바라볼 때 (이미지를 뒤집음)
                    followImageAction.style.transform = `rotate(${angle}deg) scaleX(-1)`;
                }
            } else {
                followImageBasic.style.display = 'block';
                followImageAction.style.display = 'none';
            }

            // 이미지 크기 설정
            const imageHeight = window.innerHeight * 0.04;
            followImageAction.style.width = imageHeight * 2 + 'px';
            followImageAction.style.height = imageHeight * 2 + 'px';
            followImageBasic.style.width = imageHeight * 2 + 'px';
            followImageBasic.style.height = imageHeight * 2 + 'px';

            requestAnimationFrame(animate);
        }
    }
    animate()
});

const $portfolio = $('html');
const $sections = $('.portfolio-box');
let portfolioIndex = 0;
let isAnimating = false; // 애니메이션 상태 추적 변수

// 섹션 이동 함수
function scrollToSection(index) {
    if (isAnimating) return; // 애니메이션 중에는 함수 실행을 막음

    portfolioIndex = index;

    if (index === 0) setTimeout(function () {
        startTypingAnimation()
    }, 500);

    const targetPosition = $sections.eq(index).offset().top; // 해당 섹션의 위치
    isAnimating = true; // 애니메이션 시작

    // 페이지 스크롤을 부드럽게 이동
    $('html, body').animate({scrollTop: targetPosition}, 500, function () {
        isAnimating = false; // 애니메이션 완료 후, 스크롤 가능
    });
}

// 휠 이벤트 처리
$portfolio.on('wheel', function (e) {
    // e.preventDefault(); // 기본 스크롤 방지

    // 애니메이션이 진행 중이면 아무 동작도 하지 않음
    if (isAnimating) return;

    // 휠 방향에 따라 인덱스 변경
    if (e.originalEvent.deltaY > 0 && portfolioIndex < $sections.length - 1) {
        portfolioIndex++;
    } else if (e.originalEvent.deltaY < 0 && portfolioIndex > 0) {
        portfolioIndex--;
    }

    // 해당 섹션으로 이동
    scrollToSection(portfolioIndex);
});

$(document).on('contextmenu', function (event) {
    event.preventDefault(); // 기본 우클릭 메뉴 방지
});

const $projects = $('.projects');
const $project = $('.project');
const $left_btn = $('.left_btn');
const $right_btn = $('.right_btn');
const totalProjects = $project.length - 7;
let currentIndex = 0;
let intervalId;

// 슬라이드 시작 함수
function startSlider() {
    intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalProjects; // 현재 인덱스 갱신
        const offset = currentIndex * -720; // 720px씩 이동
        $projects.css('transform', `translateX(${offset}px)`);
    }, 2000);
}

// 슬라이드 중지 함수
function stopSlider() {
    clearInterval(intervalId);
}

// 슬라이드 이동 함수 (왼쪽, 오른쪽 버튼 클릭 시)
function moveSlide(direction) {
    if (direction === 'left') {
        currentIndex = (currentIndex - 1 + totalProjects) % totalProjects;
    } else if (direction === 'right') {
        currentIndex = (currentIndex + 1) % totalProjects;
    }
    const offset = currentIndex * -720; // 720px씩 이동
    $projects.css('transform', `translateX(${offset}px)`);
}

// 슬라이드를 시작
startSlider();

// 마우스가 .projects 위에 올라가면 슬라이드 멈추기
$project.on('mouseenter', stopSlider);
$left_btn.on('mouseenter', stopSlider);
$right_btn.on('mouseenter', stopSlider);

// 마우스가 .projects 를 떠나면 슬라이드 재시작
$project.on('mouseleave', startSlider);
$left_btn.on('mouseleave', startSlider);
$right_btn.on('mouseleave', startSlider);

// 왼쪽 버튼 클릭 시 슬라이드 이동
$left_btn.on('click', function () {
    moveSlide('left');
});

// 오른쪽 버튼 클릭 시 슬라이드 이동
$right_btn.on('click', function () {
    moveSlide('right');
});

<!-- Vanta.js 설정 스크립트 -->

<!-- VANTA.NET({ -->
<!-- el: "#body1", -->
<!-- mouseControls: true, -->
<!-- touchControls: true, -->
<!-- gyroControls: false, -->
<!-- minHeight: 200.00, -->
<!-- minWidth: 200.00, -->
<!-- scale: 1.00, -->
<!-- scaleMobile: 1.00, -->
<!-- color: 0x4a6b9c, -->
<!-- points: 20.00, -->
<!-- backgroundColor: 0x1e3a8a -->
<!-- }); -->