// 랜덤 수 불러오는 함수 생성
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

$(document).ready(function () {
    const slime = $('.restricted_slime');
    let Xcode1 = 10; // 초기 X 위치
    let Ycode1 = 0;  // 초기 Y 위치

    function moveSlime() {
        let Xcode2 = getRandom(0, 99); // X 위치를 랜덤으로 설정
        let Ycode2 = getRandom(0, 89); // Y 위치를 랜덤으로 설정

        // Xcode2가 Ycode2보다 크면 Ycode2를 0으로, 아니면 Xcode2를 0으로 설정
        if (Xcode2 > Ycode2) {
            if (Ycode1 !== 0) Ycode2 = (Math.random() < 0.5) ? 0 : 89;
            else Xcode2 = (Math.random() < 0.5) ? 0 : 99;
        } else {
            if (Xcode1 !== 10) Xcode2 = (Math.random() < 0.5) ? 0 : 99;
            else Ycode2 = (Math.random() < 0.5) ? 0 : 89;
        }

        Xcode1 = Xcode2; // 새로운 Xcode1 값 갱신
        Ycode1 = Ycode2; // 새로운 Ycode1 값 갱신

        let Xal = Xcode1 > 10 ? ` - 10vh` : ``;

        console.log(`
            'left': calc(${Xcode1}vw${Xal}),
            'top': ${Ycode1}vh,
            'animation': spin 10s infinite linear
        `);

        slime.css({
            'left': `calc(${Xcode1}vw${Xal})`,
            'top': `${Ycode1}vh`,
            'animation': 'spin 10s infinite linear' // spin 애니메이션 적용
        });

    }

    // 페이지 로드 시 첫 번째 실행
    moveSlime();

    // 5초마다 위치를 갱신
    setInterval(moveSlime, 5000);
});