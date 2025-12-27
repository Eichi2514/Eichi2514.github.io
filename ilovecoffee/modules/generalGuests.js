import {COLORS} from "../common/utils.js";

const generalGuests = {
    "순수남": {
        face: "순수소년",
        hair: [
            "댄디 가이",
            "스포티 가이",
            "단정한 2대8",
            "백호 알머리",
            "그 외 다수",
            "계절 영향 O"
        ],
        lines: [
            "룰룰루♪",
            "뭐 더 먹을까~",
            "여기 좀 괜찮네.",
            "자주 와야 겠다.",
            "아직도 좀 출출하네.",
            "여자친구가 늦나봐요.",
            "오늘은 뭐해야 좋을지...",
            "맛도 좋고, 기분도 좋고.",
            "이거 좀 쓴데, 시럽이 어디있지."
        ]
    },

    "순수녀": {
        face: "순수소녀",
        hair: [
            "큐트 단발",
            "청순한 긴생머리",
            "큐트 꽁지머리",
            "양갈래머리",
            "그 외 다수",
            "계절 영향 O"
        ],
        lines: [
            "신난다~",
            "맛있당~",
            "심심해요.",
            "기분 좋은 날!",
            "랄랄라 흠흠♪",
            "아~ 집에 가기 싫당!",
            "여기 너무 맘에 들어요~",
            "사람 구경 은근 재밌어요.",
            "친구가 오기로 했는대...?"
        ]
    },

    "차도남": {
        face: "차도남",
        hair: [
            "댄디 가이",
            "스포티 가이",
            "메트로섹슈얼",
            "락앤롤베이비",
            "그 외 다수",
            "계절 영향 O"
        ],
        lines: [
            "누구...?",
            "어디....?",
            "아니, 맛있잖아?",
            "나도 성격 많이 죽었다~",
            "어디 예쁜 아가씨들 없나...",
            "이 주변에는 편의점이 없나?",
            "다행히 염장커플은 안 보이는군.",
            "내 여자에겐 따뜻할 자신 있는데..",
            "나란 남자, 주위를 둘러볼 줄 아는 남자.",
            "오늘은 어디를 가지"
        ]
    },

    "차도녀": {
        face: "차도녀",
        hair: [
            "큐트 단발",
            "청순한 긴생머리",
            "큐트 꽁지머리",
            "양갈래머리",
            "그 외 다수",
            "계절 영향 O"
        ],
        lines: [
            "뭐, 나름...",
            "아, 피곤해..",
            "휴, 머리 아프다.",
            "이번 주 일정은 어쩌지.",
            "저 남잔 왜 자꾸 쳐다봐.",
            "뭐가 문제인지 모르겠네.",
            "아, 맞다. 머리 해야 하는데..",
            "여기 유동인구가 원래 많았나.",
            "이따 요 뒤 백화점이나 갈까."
        ]
    },

    "졸린남": {
        face: "멍시크",
        hair: [
            "댄디가이",
            "스포티가이",
            "백호 알머리",
            "락앤롤베이비",
            "그 외 다수",
            "계절 영향 O"
        ],
        lines: [
            "배고파..",
            "움직이기 싫다..",
            "음...!? 이 맛은?",
            "아, 이제 뭐하지.",
            "이따 밥 뭐 먹지?",
            "점점 게을러지네 ..",
            "커피를 마셔도 졸린 난 뭐지.",
            "요즘 개그 소재가 통 안 떠오르네.",
            "요새 배가 좀 나오는 것 같기도 하고."
        ]
    },

    "졸린녀": {
        face: "멍시크",
        hair: [
            "큐트 단발",
            "청순한 긴생머리",
            "큐트 꽁지머리",
            "양갈래머리",
            "그 외 다수",
            "계절 영향 O"
        ],
        lines: [
            "!!!!!",
            "맘에 들어!",
            "맛이 있군!",
            "나쁘지 않군!",
            "여기 좀 짱인듯.",
            "아, 가기 싫은데...",
            "아는 사람 없나?",
            "뭐라고 핑계 대지?",
            "(멍--------)"
        ]
    },

    "중년남": {
        face: "인자하신 분",
        hair: [
            "단정한 2대8"
        ],
        lines: [
            "허리가 아프네...",
            "길을 잘 못 찾나...?",
            "너무 오래 앉아 있었나.",
            "여기 사장... 감각이 좋구만.",
            "이 친구는 언제 오려고 이래.",
            "씹고 마시고 맛보고 즐기고~♪",
            "그새 많이 바뀌었구만, 여기도.",
            "여기서 어떻게 가는 게 빠르려나.",
            "예쁘장한 아줌마들도 보이는구만~"
        ]
    },

    "중년녀": {
        face: "고우신 분",
        hair: [
            "엘레강스펌"
        ],
        lines: [
            "비가 오려나..",
            "종종 와야겠어..",
            "이 가게 괜찮네...",
            "이렇게 깜빡깜빡하니..",
            "에휴, 저녁밥은 뭘 하나.",
            "아까 차를 어디다 댔더라...",
            "이 동네는 땅값이 안 오르나...",
            "내 또래 사람들도 간혹 보이네...",
            "아니, 그나저나 얘는 어딜 간거야."
        ]
    },

    "외국남": {
        face: "타이거아이",
        hair: [
            "내 귀에 헤드폰",
            "러블리 베이비펌",
            "동글동글 사과머리"
        ],
        lines: [
            "Chu~♥",
            "Good!!",
            "Really?",
            "I LOVE YOU♥",
            "땡큐~",
            "렛츠 고!!!",
            "오~ 쏘리~",
            "뷰리풀 걸~",
            "팁을 얼마 줘야 하지.."
        ]
    },

    "외국녀": {
        face: "캐츠아이 / 매력만점",
        hair: [
            "물결 웨이브",
            "진주핀 꽂은 올림머리"
        ],
        lines: [
            "Merci.",
            "아.. 다리 아파.",
            "마시따.. 헤헤.",
            "ATM 오디 이찌?",
            "다음엔 어디 가지?",
            "Photo 찌거도 되나..",
            "요기.. 쌤 안 와써요?",
            "메이크업 고치고십따..",
            "이 카페 빠리보다 더 포근하다."
        ]
    },

    "부자남": {
        face: "매력만점",
        hair: [
            "재즈바 인기남의 꽁지머리"
        ],
        lines: [
            "천상천하 유아독존!",
            "이 가게.. 얼마면 살 수 있소?",
            "나를 기다리게 할 셈이오?",
            "여기가 커피숍이란 곳인가?",
            "요트를 하나 더 살까 하오.",
            "이게 최선이오? 확실하오?",
            "이거 맛있군. 하나 더 주겠소?",
            "일? 사랑? 돈만 있으면 다 된다오.",
            "여기.. 그럭저럭 괜찮은 거 같구만."
        ]
    },

    "부자녀": {
        face: "성북동 공주",
        hair: [
            "청담동 공주 단발 웨이브",
            "무대 위 여신의 올림머리"
        ],
        lines: [
            "다행이군요.",
            "아. 먼지 묻었네.",
            "에? 아아, 그래요.",
            "노블리스 오블리제.",
            "이 맛, 인정해드리죠.",
            "돈이란 종잇조각에 불과하죠.",
            "가게가 꽤 크네요. 우리 집보단 작지만.",
            "따.. 딱히 커피가 맛있어서 온 건 아니예요",
            "돈은 많이 버는 것 보다 잘 쓰는게 중요해요."
        ]
    },

    "바리스타남": {
        face: "째진눈",
        hair: [
            "앤티크 리젠트컷"
        ],
        lines: [
            "한 잔 더 주문하러 갈까.",
            "역시 소문은 과장되지 않았어.",
            "저 음료는 대체 뭐죠? 처음 보네요.",
            "바리스타로서 배울 점이 많아 좋습니다.",
            "음~ 아늑한 커피향이 피로를 풀어주는군요.",
            "저 손님이 시킨 사이드. 나도 한번 시켜볼까.",
            "나중에 저도 이런 가게를 차리는 게 꿈입니다.",
            "손님들만 봐도 사장님의 대단함을 알 것 같습니다."
        ]
    },

    "바리스타녀": {
        face: "풀메이크업",
        hair: [
            "성북동 공주 웨이브 머리"
        ],
        lines: [
            "사장님, 최고!",
            "내일 또 올까...",
            "사장님! 오랜만이예요.",
            "으~ 한잔 더 마시고 싶어요.",
            "이건 인정할 수밖에 없네요.",
            "이 에스프레소의 진한 향은!",
            "여기 커피. 중독될 것만 같아.",
            "혹시 일하시는 모습을 구경해도 될까요?",
            "손님이 많아서 일손이 부족할 거 같은데."
        ]
    }
};

$(document).on("click", ".generalGuestsBtn", function () {
    if ($("#generalGuestsModal").length === 0) createGeneralGuestsModal();
    $("#generalGuestsModal").fadeIn(200);
    renderGeneralGuestList(); // 1단계
});

function createGeneralGuestsModal() {
    const modal = `
    <div id="generalGuestsModal" class="login-overlay" style="display:none;">
      <div class="login-modal" style="position:relative;">
        <button id="closeGeneralGuestsModal" class="closeBtn" style="color:${COLORS.P} !important;">✕</button>
        <h2 class="modal-title">일반손님 목록</h2>

        <!-- 검색 입력 -->
        <input type="text" id="guestSearch"
               placeholder="대사 검색"
               style="width:100%; padding:8px; margin-bottom:12px; border:1px solid ${COLORS.BO_S}; border-radius:6px;">

        <!-- 손님 목록 -->
        <div id="generalGuestList"></div>

        <!-- 상세 보기 -->
        <div id="generalGuestDetail" style="display:none; margin-top:15px;">
            <button id="generalGuestBackBtn" style="position:absolute; top:8px; left:10px; height: 43px; width: 40px; background: none; color: ${COLORS.P}">←</button>
            <div id="generalGuestContent"></div>
        </div>

      </div>
    </div>
    `;
    $("body").append(modal);

    $("#closeGeneralGuestsModal").on("click", () => {
        $("#generalGuestsModal").fadeOut(200);
    });

    $("#generalGuestBackBtn").on("click", function(){
        $("#generalGuestDetail").hide();
        $("#generalGuestList").fadeIn(200);
        $(".modal-title").text("일반손님 목록");
    });

    // 검색 이벤트
    $(document).on("input", "#guestSearch", function () {
        applyGeneralGuestSearch($(this).val().trim());
    });
}

function renderGeneralGuestList() {
    const $list = $("#generalGuestList");
    $list.empty().show();
    $("#generalGuestDetail").hide();
    $(".modal-title").text("일반손님 목록");

    $list.css({
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
        gap: "10px",
        justifyItems: "center"
    });

    Object.keys(generalGuests).forEach((guest, idx) => {
        // const imgSrc = `../image/general${idx+1}.jpg`;
        const imgSrc = `../image/profile${idx + 101}.jpg`;

        const card = $(`
            <div class="guestCard">
                <img src="${imgSrc}" class="guestImg"/>
                <div class="guestName">${guest}</div>
            </div>
        `);

        // 카드 스타일
        applyGeneralGuestCardStyle(card);

        card.on("click", () => showGeneralGuestDetail(guest, imgSrc));

        $list.append(card);
    });
}

function applyGeneralGuestSearch(keyword) {
    keyword = keyword.toLowerCase();

    if (keyword === "") {
        renderGeneralGuestList();
        return;
    }

    const $list = $("#generalGuestList");
    $list.empty().show();
    $("#generalGuestDetail").hide();

    $(".modal-title").text("검색 결과");

    Object.entries(generalGuests).forEach(([guest, data], idx) => {
        const matchedLines = data.lines.filter(line =>
            line.toLowerCase().includes(keyword)
        );

        matchedLines.forEach(line => {
            const imgSrc = `../image/profile${idx + 101}.jpg`;

            const card = $(`
                <div class="guestCard" style="width:100%; border:1px solid ${COLORS.BO_S};">
                    <img src="${imgSrc}" class="guestImg" style="width:60px; height:60px"/>
                    <div class="guestName" style="font-weight:bold">${guest}</div>
                    <div class="guestLinePreview" style="font-size: 10px; word-break: keep-all;">${line}</div>
                </div>
            `);

            applyGeneralGuestCardStyle(card);

            card.on("click", () => showGeneralGuestDetail(guest, imgSrc));
            $list.append(card);
        });
    });
}

function applyGeneralGuestCardStyle(card) {
    card.css({
        width: "90px",
        textAlign: "center",
        cursor: "pointer",
        border: `1px solid ${COLORS.BO_S}`,
        borderRadius: "10px",
        paddingTop: "8px",
        background: `${COLORS.BG_S}`,
        transition: "0.2s",
    });

    card.find(".guestImg").css({
        width: "60px",
        height: "60px",
        borderRadius: "8px",
        objectFit: "cover",
        display: "block",
        margin: "0 auto 6px"
    });
}

function showGeneralGuestDetail(name, imgSrc) {
    const data = generalGuests[name];

    $("#generalGuestList").hide();
    $("#generalGuestDetail").show();

    $(".modal-title").text(name);

    const linesHTML = data.lines.map(line => `<li>• ${line}</li>`).join("");
    const hairHTML = data.hair.join(", ");

    const content = `
        <div style="display: flex;">            
            <img src="${imgSrc}" style="width:120px; height:120px; border-radius:10px; margin-bottom:10px;">            
            <div style="text-align:left;">
                <p style="padding: 5px; margin: 0;"><b>얼굴 : </b> ${data.face}</p>
                <p style="padding: 5px; margin: 0; word-break: keep-all;"><b>헤어 : </b> ${hairHTML}</p>
            </div>            
        </div>
        <div style="font-weight: bold; padding-top: 10px">대사 목록</div>
        <ul style="text-align:left; list-style:none; padding:0; margin: 0;">
            ${linesHTML}
        </ul>
    `;

    $("#generalGuestContent").html(content);
}