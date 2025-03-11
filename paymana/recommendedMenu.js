const foods = [
    "삼겹살", "돈까스", "제육볶음", "불고기", "갈비", "떡볶이", "김치찌개", "순두부찌개", "된장찌개", "해물파전",
    "치킨", "피자", "파스타", "초밥", "회", "삼계탕", "김밥", "부대찌개", "짜장면", "짬뽕", "순대국", "곱창",
    "오징어볶음", "닭갈비", "홍합탕", "김치전", "보쌈", "쭈꾸미", "갈비찜", "냉면", "칼국수", "볶음밥", "샤브샤브",
    "불닭볶음면", "양꼬치", "마라탕", "마라샹궈", "라멘", "소고기국밥", "장어구이", "소불고기", "스테이크",
    "튀김", "커리", "토스트", "샌드위치", "곰탕", "육회", "비빔밥", "회덮밥", "샐러드", "오므라이스", "전복죽",
    "소시지볶음", "깐풍기", "동태찌개", "가자미구이", "새우튀김", "등갈비", "소고기무국", "계란말이", "백숙", "소면",
    "오징어덮밥", "돌솥비빔밥", "김치볶음밥", "두부김치", "라자냐", "핫도그", "아귀찜", "물회", "한정식", "소곱창전골",
    "칼국수", "떡국", "잔치국수", "불고기버거", "브리또", "스파게티", "모듬전", "해물찜", "육회비빔밥", "알탕",
    "양배추쌈", "돼지고기볶음", "수제버거", "애플파이", "청국장찌개", "탕수육", "계란찜", "떡갈비", "해물볶음",
    "고등어구이", "가리비구이", "콩비지찌개", "한우불고기", "갈비탕", "닭꼬치", "황태국", "돼지고기김치찜", "삼치구이",
    "소불고기", "족발", "김치찌개", "홍어회", "산낙지", "냉모밀", "스팸김치볶음밥", "호박전", "감자탕", "매운탕",
    "설렁탕", "가정식백반", "양지국밥", "고추장찌개", "칡냉면", "볶음국수", "육전", "얼큰순두부", "전어구이", "부리또",
    "숯불치킨", "칠리새우", "스위트포테이토", "간장게장", "칠면조", "쭈꾸미볶음", "해물전", "소갈비구이", "순대",
    "고추잡채", "컵밥", "바지락칼국수", "조개구이", "어묵탕", "고등어조림", "장어덮밥", "돼지국밥", "전복구이", "파전",
    "비빔냉면", "순대볶음", "참치회", "연어초밥", "송이덮밥", "카레라이스", "타코야키", "낙지볶음", "닭날개구이",
    "자장면", "짬뽕", "만두", "깐풍새우", "꼬치", "훈제연어", "케밥", "훠궈", "홍합구이", "우동", "비빔국수",
    "국물떡볶이", "새우볶음밥", "덮밥", "쌀국수", "맛탕", "치즈스틱", "차돌박이", "해물탕", "소고기장조림", "두부전골",
    "닭볶음탕", "수육", "백짬뽕", "철판구이", "전복탕", "통닭", "계란찜", "무국", "중국집", "삼겹김치볶음밥",
    "핫윙", "쌈밥", "홍합찜", "닭강정", "홍합죽", "감자튀김", "버섯구이", "고추장불고기", "포케", "양념치킨", "콩국수",
    "가자미조림", "라면", "돼지갈비", "버섯탕", "양송이버섯스프", "햄버거", "해물순두부찌개", "치킨너겟", "떡갈비",
    "해물전골", "조개탕", "갈릭버터새우", "통삼겹구이", "양송이구이", "생선구이", "로제떡볶이", "미트볼파스타",
    "꽃등심", "안창살", "토시살", "양갈비", "돼지양념갈비", "소양념갈비", "스테이크 샐러드", "돼지등뼈찜", "양고기전골",
    "버섯불고기전골", "곱창전골", "어묵전골", "들깨칼국수", "바지락수제비", "감자옹심이", "굴국밥", "삼선짬뽕탕",
    "묵은지찜닭", "찜닭", "코다리찜", "소라무침", "차돌숙주볶음", "감자전", "녹두전", "동그랑땡", "낙지찜", "아귀수육",
    "연어덮밥", "가츠동", "돈코츠라멘", "가라아게", "모둠사시미", "타코와사비", "문어숙회", "대방어회", "규카츠",
    "장어덮밥", "트러플 파스타", "감바스", "리소토", "미트볼 스파게티", "크림뇨끼", "라따뚜이", "버팔로 윙",
    "치즈 퐁듀", "수제 소시지", "파니니", "미트볼", "에그 베네딕트", "탄두리 치킨",
    "바질 페스토 파스타", "오코노미야키", "팟타이", "반쎄오", "빠에야", "슈바인스학센", "참치타다키", "새우버터구이",
    "베이컨말이", "육회탕탕이", "만두국", "삼선볶음밥", "산채비빔밥", "곤드레나물밥", "사케동", "대구탕", "충무김밥",
    "돼지껍데기", "훈제오리", "삼합", "바베큐립", "폭립", "LA 갈비", "차슈 덮밥", "한우곱창구이", "한우육회비빔밥",
    "해물뼈찜", "매운갈비찜", "우거지해장국", "해장국", "꽃게", "꽃게탕", "누룽지탕", "매생이굴국", "생굴",
    "알곱창전골", "가리비찜", "꼬막비빔밥", "석화구이", "낙곱새", "연어장"
]

function getRandomNumbers(num, count) {
    const numbers = Array.from({length: num + 1}, (_, i) => i);
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers.slice(0, count);
}

$('.recommendedMenu').click(function () {
    const randomIndexes = getRandomNumbers(foods.length - 1, 3);

    $('.popup4-bg').removeClass('hidden').addClass('flex');

    let area = "근처"; // 기본값 설정

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`);
                const data = await response.json();

                if (data.error) {
                    console.log("주소 가져오기 오류");
                } else {
                    if (data.address.suburb) {
                        area = data.address.suburb;
                    } else if (data.address.road) {
                        area = data.address.road;
                    } else if (data.address.village) {
                        area = data.address.village;
                    } else if (data.address.city) {
                        area = data.address.city;
                    }
                }

                console.log(`area : ${area}`);

                for (let i = 1; i <= 3; i++) {
                    updateMenu(i, foods[randomIndexes[i - 1]], area);
                }
            } catch (error) {
                console.log(`위치 정보 가져오기 오류: ${error}`);
            }
        }, (error) => {
            console.log(`위치 정보 오류: ${error.message}`);
            for (let i = 1; i <= 3; i++) {
                updateMenu(i, foods[randomIndexes[i - 1]], "근처");
            }
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
        for (let i = 1; i <= 3; i++) {
            updateMenu(i, foods[randomIndexes[i - 1]], "근처");
        }
    }
});

function updateMenu(index, food, area) {
    const $menu = $('.menu-' + index);

    $menu.removeClass('removeBack');

    const newFood = `
                <a href="https://map.naver.com/p/search/${area}%20${food}%20맛집" class="cursor-pointer" target="_blank" style="display: block">                    
                    ${food}
                </a>
                `;

    $menu.html(newFood);

    $menu.css('animation', 'none');
    $menu.offset();
    $menu.css('animation', `rotate3d ${index}s linear`);

    setTimeout(function () {
        $menu.addClass('removeBack');
    }, index * 1000);
}