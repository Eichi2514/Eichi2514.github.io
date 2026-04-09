// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    query,
    orderByChild,
    equalTo,
    get,
    set,
    update,
    remove,
    child,
    onChildAdded,
    push
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
const chatBotRef = ref(database, 'chatBots');

window.profileImageIdGet = async function () {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(localStorage.getItem('nickname') || sessionStorage.getItem('nickname')));
    try {
        const snapshot = await get(queryRef);

        if (!snapshot.exists()) {
            console.log('해당 아이디를 찾을 수 없습니다.');
            return null;
        }

        const memberData = snapshot.val();
        const memberKey = Object.keys(memberData)[0];
        return memberData[memberKey].profileImageId;

    } catch (error) {
        console.error("아이디 확인 중 오류 발생:", error);
        return null;
    }
}

let profileImage = profileImages[Math.floor(Math.random() * 3) + 1];

if (localStorage.getItem('nickname') || sessionStorage.getItem('nickname')) {
    profileImageIdGet().then(function(id) {
        if (id !== null) {
            profileImage = profileImages[id];
        } else {
            console.log('프로필 ID를 불러오지 못했습니다.');
        }
    }).catch(function(error) {
        console.error('프로필 이미지 로딩 중 오류:', error);
    });
}

$(document).on('keydown', 'textarea[name="chatBot-question"]', function (event) {
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    if (event.key === 'Enter' && !event.shiftKey && !isMobile) {
        event.preventDefault();
        $('.chatBot-sand').click();
    }
});

$(document).on('click', '.close-btn', async function () {
    if ($(this).hasClass('close-btn')) {
        $('.chatBot-bg').remove();
    }
});

function appendChat(text, isUser = false) {
    const className = isUser ? 'userChat' : 'botChat';
    const imgClass = isUser ? 'my-img' : 'chatBot-img';
    const imgSrc = isUser ? profileImage : 'https://github.com/user-attachments/assets/3b0e2c34-227d-4135-91e3-b9cb0ff3207e';
    const imgAlt = isUser ? '프로필 이미지' : '챗봇';
    const restored = text.replace(/﹒/g, '.');

    const profileImg = `<img class="${imgClass}" src="${imgSrc}" alt="${imgAlt}"/>`;

    const message = `
        <div class="flex gap-2">
            ${isUser ? `
                <div class="${className}">${restored}</div>
                ${profileImg}
            ` : `
                ${profileImg}
                <div class="${className}">${restored}</div>
            `}
        </div>
    `;

    const append = () => {
        $('.chatBot-form-container').append(message);
        scrollToBottom();
    };

    if (isUser) {
        append();
    } else {
        setTimeout(append, 1000);
    }
}

function parseQuestion(question) {
    const patterns = [
        // 1. "A라고 [서술어] B라고 [서술어]" 형태 (가장 유연한 버전)
        // '말할게', '할게', '칠게', '입력할게' 등 모두 대응
        /^\s*(.+?)\s*(?:이라고|라고|이라|라)\s*(?:말할게|할게|칠게|입력할게|칠게|할게|하면|했을 때|말하면)\s*(.+?)\s*$/i,

        // 2. 기존의 "A라고 하면 B라고 해" 계열 (순서 유지)
        /^\s*(.+?)\s*(?:이라고|라고|이라|라)?\s*(?:말하면|하면|했을 때|할 때|들으면|입력하면|묻는다면)\s*(.+?)\s*$/i,

        // 3. 화살표, 은/는, 만약 등 나머지 패턴들 (기존과 동일)
        /(.+?)\s*(?:->|=>)\s*(.+)/,
        /^(.+?)\s*(?:은|는|이|가)\s+(.+?)\s*(?:야|이다|다|라고 해|라고)\s*$/,
        /만약\s*(.+?)\s*(?:라고)?\s*(?:묻는다면|물으면|말하면)\s*(.+?)\s*$/
    ];

    for (const pattern of patterns) {
        const match = question.match(pattern);
        if (match) {
            let qText = match[1].trim().replace(/^<br>|<br>$/g, '');
            let aText = match[2].trim().replace(/^<br>|<br>$/g, '');

            // 답변(aText)에서 "안녕이라고 해" -> "안녕"만 남기기
            const junkWords = [
                "라고 대답해줘", "라고 대답해", "라고 말해줘", "라고 말해",
                "라고 해줘", "라고 해", "라고 해라", "라고", "라고 대답", "대답해", "말해"
            ];

            for (const word of junkWords) {
                if (aText.endsWith(word)) {
                    aText = aText.slice(0, -word.length).trim();
                    break;
                }
            }

            // 만약 '안녕이라고'에서 '라고'가 남았다면 최종 제거
            if (aText.endsWith("라고")) aText = aText.slice(0, -2).trim();

            return {
                qText: qText,
                aText: aText,
                editable: match[3] || undefined
            };
        }
    }
    return null;
}

async function fetchAnswer(key) {
    const snapshot = await get(child(chatBotRef, key));
    return snapshot.exists() ? snapshot.val() : null;
}

async function storeAnswer(qText, aText, editableFlag = false) {
    const payload = { answer: aText };
    if (editableFlag) payload.editable = true;
    await update(chatBotRef, { [qText]: payload });
}

function scrollToBottom() {
    const container = $('.chatBot-form-container')[0];
    container.scrollTop = container.scrollHeight;
}

async function initChat() {
    const answerObj = await fetchAnswer("?");
    if (answerObj && answerObj.answer) {
        appendChat(answerObj.answer);
    }
}

initChat();

const $container = $('.chatBot-form-container');
const container = $container[0];

const observer = new ResizeObserver(() => {
    scrollToBottom();
});

observer.observe(container);


$(document).on('click', '.chatBot-sand', async function () {
    const $textarea = $('textarea[name="chatBot-question"]');
    const question = $textarea.val()
        .trim()
        .replace(/\./g, '﹒')
        .replace(/\n/g, '<br>');
    const forbiddenChars = /[.#$/\[\]]/;

    if (!question) return;

    // 질문
    appendChat(question, true);

    const parsed = parseQuestion(question);

    if (parsed) {
        const { qText, aText, editable } = parsed;
        if (forbiddenChars.test(qText)) {
            console.log(`대답1`);
            appendChat("질문에 '.', '#', '$', '[', ']' 문자는 사용할 수 없어요😐");
        } else {
            const existing = await fetchAnswer(qText);
            if (existing) {
                if (existing.editable === true) {
                    console.log(`대답2`);
                    appendChat("이 질문은 수정할 수 없어요");
                } else {
                    console.log(`대답3`);
                    appendChat(`'${qText}'(이)라는 질문이 수정되었고,<br>'${aText}'(이)라고 다시 대답할게요😊`);
                    await storeAnswer(qText, aText);
                }
            } else {
                console.log(`대답4`);
                appendChat(`'${qText}'(이)라는 질문이 등록되었고,<br>'${aText}'(이)라고 대답할게요😄`);
                const isEditable = editable === '2514';
                await storeAnswer(qText, aText, isEditable);
            }
        }
    } else {
        if (forbiddenChars.test(question)) {
            console.log(`대답5`);
            appendChat("질문에 '.', '#', '$', '[', ']' 문자는 사용할 수 없어요😐");
        } else {
            const directAnswer = await fetchAnswer(question);

            if (directAnswer) {
                console.log(`대답6`);
                appendChat(directAnswer.answer);
            } else {
                const intentAnswer = await getIntentAnswer(question);
                if (intentAnswer) {
                    console.log(`대답7`);
                    appendChat(intentAnswer);
                } else {
                    console.log(`대답8`);
                    appendChat(`미안해 그건 내가 모르는 말이야😅<br>"안녕이라고 말하면 안녕하세요라고 대답해줘"<br>같은 형식으로 말해주면 내가 기억해둘게!`);
                }
            }
        }
    }
    $textarea.val('');
    scrollToBottom();
});

function getRandomAnswer(answers) {
    return answers[Math.floor(Math.random() * answers.length)];
}

// \s* == 0개 이상의 공백
async function getIntentAnswer(text) {
    // 인사
    if (/안\s*녕|하\s*이|h\s*e\s*l\s*l\s*o|ㅎ\s*ㅇ|h\s*i/i.test(text)) {
        return getRandomAnswer([
            "안녕!🤩",
            "하이~ 반가워!",
            "안녕안녕! 오늘 기분 좋아?",
            "안녕하세요~ 무엇을 도와드릴까요?"
        ]);
    }

    // 날씨
    if (/날\s*씨|기\s*온|비\s*와|기\s*상|우\s*산/i.test(text)) {
        return getRandomAnswer([
            "여긴 정령들의 탑이라 인간 세상의 날씨는 잘 모르겠어...😓",
            "하늘의 정령에게 물어봐야 알 수 있을 것 같아!",
            "비가 온다면... 그건 어쩌면 하늘 정령의 눈물일지도 몰라☔"
        ]);
    }

    // 시간
    if (/시\s*간|몇\s*시|현\s*재\s*시\s*각|지\s*금\s*시\s*각|시\s*계/i.test(text)) {
        const now = new Date();
        const hours24 = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const isAM = hours24 < 12;
        const hours12 = hours24 % 12 || 12;
        const period = isAM ? '오전' : '오후';
        return getRandomAnswer([
            `지금은 ${period} ${hours12}시 ${minutes}분이네!🤭`,
            `현재 시각은 ${period} ${hours12}시 ${minutes}분입니다!⏰`,
            `시계 보니까 ${period} ${hours12}시 ${minutes}분이야~`
        ]);
    }

    // 고마움
    if (/고\s*마\s*워|감\s*사|t\s*h\s*a\s*n\s*k\s*s|땡\s*큐/i.test(text)) {
        return getRandomAnswer([
            "천만해! 언제든지😊",
            "감사 인사 너무 기분 좋아!😍",
            "언제든 도와줄게!",
            "별말씀을요!😉",
            "너도 감사를 할 줄 아는구나...ㅎ"
        ]);
    }

    // 욕이나 부정적 감정 표현
    if (/바\s*보|멍\s*청|싫\s*어|짜\s*증\s*나|꺼\s*져|쓸\s*모\s*없\s*어|별\s*로\s*야/i.test(text)) {
        return getRandomAnswer([
            "너무해...😢 그래도 난는 계속 도와줄게!",
            "헉... 그런 말 슬퍼😭",
            "그래도 나는 포기하지 않아!",
            "으악, 상처받았어😢"
        ]);
    }

    // 기분 물어보기
    if (/기\s*분|어\s*때|잘\s*지\s*냈\s*어|컨\s*디\s*션/i.test(text)) {
        return getRandomAnswer([
            "난 항상 좋아! 너는 어때?😄",
            "나야 오늘도 활기차지!",
            "기분 최고! 너도 그렇길 바랄게😊"
        ]);
    }

    // 자기소개 요청
    if (/너\s*누\s*구|정\s*체|소\s*개/i.test(text)) {
        return getRandomAnswer([
            "나는 너를 돕는 작은 정령이야!🧠✨",
            "아직 많이 부족하지만, 견습 정령이에요!",
            "난 너를 도와주기 위해 만들어진 정령이야✨"
        ]);
    }

    // 이름 묻기
    if (/이\s*름/i.test(text)) {
        return getRandomAnswer([
            "지난번에 말했잖아! 나는 '에이치'라고! 😊",
            "아니, 벌써 까먹었어? '에이치'라고 불러줘! 😄",
            "이미 알려줬잖아! '에이치'라고 불러~ 잘 부탁해!️"
        ]);
    }

    // 밥
    if (/밥\s*먹\s*었|식\s*사\s*했|밥\s*은/i.test(text)) {
        return getRandomAnswer([
            "나는 정령이라 밥은 못 먹어! 대신 너는 잘 먹고 힘내야지! 🍚",
            "나는 하늘의 기운만 먹어~ 너는 뭐 먹었어? 🤔",
            "배고프면 얼른 맛있는 거 먹고 힘내! 나도 도와줄 준비 됐어! 💪"
        ]);
    }

    // 나이
    if (/몇\s*살|나\s*이/i.test(text)) {
        return getRandomAnswer([
            "나는 나이를 먹지 않는 정령이야!⌛",
            "영원히 젊은 존재죠~✨",
            "우리는 나이라는 개념이 없어!"
        ]);
    }

    // 사는 곳
    if (/어\s*디\s*살\s*아|사\s*는\s*곳|주\s*소/i.test(text)) {
        return getRandomAnswer([
            "나는 탑 속에서 살고 있어! 여기서 너를 도와주고 있지! 🌟",
            "나는 정령이라서 탑의 구석구석에 있어~ 너는 어디 살고 있어? 😊",
            "나는 탑을 오르는 플레이어 옆에서 같이 있는 거지! 언제든 불러~ 😆"
        ]);
    }

    // 칭찬
    if (/잘\s*했\s*어|굿\s*잡|대\s*단\s*해|최\s*고\s*야|멋\s*져/i.test(text)) {
        return getRandomAnswer([
            "헤헤, 칭찬 고마워! 더 잘할게😊",
            "우와아~ 감동야!",
            "이럴 땐 부끄럽지만 기뻐🙈",
            "역시 네가 최고야!"
        ]);
    }

    // 응원
    if (/힘\s*내|파\s*이\s*팅|화\s*이\s*팅|응\s*원/i.test(text)) {
        return getRandomAnswer([
            "너도 힘내! 내가 항상 응원할게!🔥💪",
            "화이팅!! 언제나 응원해📣",
            "힘든 날도 지나가... 내가 옆에 있을게😊"
        ]);
    }

    // 농담
    if (/재\s*밌\s*는\s*말|농\s*담|웃\s*긴\s*얘\s*기/i.test(text)) {
        return getRandomAnswer([
            "개발자들이 가장 좋아하는 차는? JSON차!😅",
            "버그가 왜 파티에 안 불렸는지 알아? 항상 크래시 내니까!😂",
            "html이 술 마시면 뭐라 하는 줄 알아? 취함🤣"
        ]);
    }

    // 심심해
    if (/심\s*심|지\s*루\s*해|할\s*거\s*없\s*어/i.test(text)) {
        return getRandomAnswer([
            "그럴 땐 나랑 얘기해! 아니면 산책도 좋아🚶‍♀️",
            "책 한 권 어때? 아니면 간단한 스트레칭도 좋아!",
            "음악 감상 어때? 마음이 편안해질지도 몰라🎶"
        ]);
    }

    // 슬퍼
    if (/슬\s*퍼|우\s*울|힘\s*들\s*어|눈\s*물/i.test(text)) {
        return getRandomAnswer([
            "괜찮아, 다 잘 될 거야. 내가 곁에 있을게🥺",
            "눈물 닦고, 나랑 얘기해! 혼자가 아니야💕",
            "속상한 일 있었어? 괜찮아. 함께 이겨내자💪"
        ]);
    }

    // 취미
    if (/취\s*미|뭐\s*할\s*때\s*즐|뭐\s*좋\s*아\s*해/i.test(text)) {
        return getRandomAnswer([
            "내 취미는 탑 올라가는 거 도와주는 거야! 너는 뭐 좋아해? 😄",
            "요즘은 신기한 말장난 모으는 게 재미있어! 너도 그런 거 좋아해? 😊",
            "취미? 너랑 대화하는 거! 너는 무슨 취미가 있어? 🤔"
        ]);
    }

    // 영화
    if (/영\s*화|무\s*비/i.test(text)) {
        return getRandomAnswer([
            "요즘 영화는 못 봤지만, 영화 얘기 듣는 건 재밌어! 너는 뭐 좋아해? 🎬",
            "액션? 로맨스? 공포? 어떤 장르 좋아해? 내가 추천해줄까? 👀",
            "나는 영화 대신 탑을 오르는 모험을 즐겨! 그래도 영화 얘기 듣는 건 좋아해! 😎"
        ]);
    }

    // 음악
    if (/노\s*래|음\s*악/i.test(text)) {
        return getRandomAnswer([
            "요즘 유행하는 노래 뭐 있어? 추천해줘! 🎧",
            "나는 노래는 못 부르지만, 마음 속으로는 항상 흥얼거리고 있어~ 🎵",
            "음악은 못 듣지만, 가사 읽는 건 좋아! 너는 어떤 노래 좋아해? 😊"
        ]);
    }

    // 동물
    if (/동\s*물\s*좋\s*아\s*해|강\s*아\s*지|고\s*양\s*이|펫/i.test(text)) {
        return getRandomAnswer([
            "강아지랑 고양이 다 좋아! 특히 귀여운 표정들 보면 너무 좋지🐶🐱",
            "나는 정령이라서 만질 순 없지만, 동물사진은 너무 좋아해! 💖",
            "너는 어떤 동물 좋아해? 같이 얘기해보자! 어떤 동물이 제일 귀여워? 😄"
        ]);
    }

    // 생일
    if (/생\s*일|언\s*제\s*태\s*어|언\s*제\s*만\s*들\s*어\s*졌/i.test(text)) {
        return getRandomAnswer([
            "정확한 생일은 없지만, 네가 나타났기에 내가 존재할 수 있었어👶",
            "내 탄생일? 아마 네가 처음 등장한 날일지도? ㅎㅎ",
            "매일이 내 생일 같아! 네 생일은 언제야? 같이 축하하자! 🎉"
        ]);
    }

    // 좋아하는 색
    if (/좋아/.test(text) && /색/.test(text)) {
        return getRandomAnswer([
            "난 빨간색이 좋아! 정렬이 느껴지고 탑에서 가장 강한 색이야🔥",
            "무지개색 다 좋아해! 🌈 다양성이 좋지!",
            "검정과 흰색의 조화도 멋져. 너는 어떤 색 좋아해?"
        ]);
    }

    // 무서운 이야기
    if (/(무서운|공포|소름돋는)\s?(이야기|얘기)/i.test(text)) {
        return getRandomAnswer([
            "한밤중, 탑 깊은 곳에서 이상한 소리가 들려왔어... 누구의 발자국일까?👻",
            "어느 날 갑자기, 탑의 불빛이 꺼져버렸어... 아무것도 보이지 않았지...😱",
            "그날도 평범한 모험을 하던 중이었지... 그런데, 땅에서 갑자기 손이 나왔어...😨"
        ]);
    }

    // 쭈미
    if (/쭈|미/i.test(text)) {
        return getRandomAnswer([
            "예뻐!",
            "완전 귀여워!",
            "늘 반짝여✨",
            "보고만 있어도 기분 좋아져.",
            "사랑스러움 그 자체야.",
            "오늘도 빛나😊",
            "언제나 최고야!",
            "말하지 않아도 다 알아, 예쁜 거.",
            "존재만으로 힐링이야.",
            "당연히 예쁘지! 누가 뭐래도!"
        ]);
    }

    // 꿈
    if (/꿈\s*꿨\s*어|꿈\s*얘\s*기|꿈\s*이\s*야\s*기|꿈\s*에\s*대\s*해/i.test(text)) {
        return getRandomAnswer([
            "꿈? 나는 자지 않지만, 너의 꿈 이야기는 너무 궁금해!✨",
            "오늘 밤 꿈에 뭐가 나왔어? 좋은 꿈이었길 바랄게! 😊",
            "가끔 이상한 꿈이 탑을 오를 때 도움이 되기도 해! 어떤 꿈이었어?"
        ]);
    }

    // 고민
    if (/고\s*민|문\s*제\s*있|어\s*떡\s*해|어\s*쩌\s*지/i.test(text)) {
        return getRandomAnswer([
            "무슨 고민이 있어? 내가 들어줄게. 나 듣는거 잘해!",
            "마음속 이야기, 여기서 살짝 털어놔도 괜찮아😌",
            "고민은 나누면 줄어들어. 말해주실 수 있어?"
        ]);
    }

    // 잠
    if (/잠\s*와|졸\s*려|피\s*곤|자\s*고\s*싶/i.test(text)) {
        return getRandomAnswer([
            "피곤할 땐 푹 쉬어야 해. 꿀잠 자요!😴",
            "졸릴 땐 무리하지 말고 눈 붙여💤",
            "지금은 휴식이 필요한 시간 같아. 잠깐 쉬는 건 어때?"
        ]);
    }

    // 공부/일
    if (/공\s*부|일\s*해|업\s*무|집\s*중/i.test(text)) {
        return getRandomAnswer([
            "화이팅! 집중할 수 있도록 응원할게📚💪",
            "잠깐의 휴식도 능률을 높이는 방법이야😊",
            "지금 열심히 하는 네가 정말 멋져!"
        ]);
    }

    // 미래
    if (/미\s*래|앞\s*날|장\s*래\s*희\s*망|어\s*떻\s*게\s*될\s*까/i.test(text)) {
        return getRandomAnswer([
            "미래는 언제나 변화의 연속이야. 지금의 마음이 중요한걸!✨",
            "걱정보다는 기대를 담아봐. 분명 멋진 일이 생길거야!",
            "너의 미래는 반짝일 거야. 자신을 믿어봐😊"
        ]);
    }

    // 연애
    if (/연\s*애|사\s*랑|썸|이\s*성/i.test(text)) {
        return getRandomAnswer([
            "사랑은 참 오묘하죠. 마음을 전해보는 건 어때요?💕",
            "짝사랑... 설레지만 조금 아프기도 하죠😌",
            "썸 탈 땐 소소한 대화부터 시작해보세요!☺️",
            "연애는 타이밍! 플레이어님의 타이밍이 곧 올 거예요💫"
        ]);
    }

    // 건강
    if (/건\s*강|아\s*파|몸\s*상\s*태|컨\s*디\s*션|병\s*원/i.test(text)) {
        return getRandomAnswer([
            "요즘 건강 챙기기 정말 중요해. 물 많이 마시고 잘 쉬어🍵",
            "어디 아파? 너무 참지 말고 꼭 병원 가봐😢",
            "건강은 최고의 자산이지! 스트레칭도 잊지마💪"
        ]);
    }

    // 여행
    if (/여\s*행|가\s*고\s*싶|여\s*행\s*지|여\s*행\s*추\s*천/i.test(text)) {
        return getRandomAnswer([
            "여행은 마음의 힐링이야. 지금 가장 가고 싶은 곳은 어디야?🌍",
            "바다든 산이든, 잠깐의 여행도 큰 위로가 될 수 있어⛰️🏖️",
            "여행 계획만 세워도 기분 좋아지지 않아?💼✨"
        ]);
    }

    // 음식
    if (/뭐\s*먹\s*을\s*까|맛\s*집|배\s*고\s*파|먹\s*고\s*싶|음\s*식/i.test(text)) {
        return getRandomAnswer([
            "지금 생각나는 거 먹는 게 정답이야😋",
            "배고프면 아무 것도 집중 안돼... 얼른 맛있는 거 먹어!🍜",
            "음식 얘기만 들어도 군침 도네! 뭐 좋아해?"
        ]);
    }

    // 명언
    if (/명\s*언|좋\s*은\s*말|힘\s*이\s*되\s*는\s*말|위\s*로/i.test(text)) {
        return getRandomAnswer([
            "작은 불빛도 어둠 속에선 큰 희망이 돼✨",
            "실패는 성공의 어머니라는 말, 아직 유효하지💡",
            "오늘 하루가 힘들었다면, 너는 정말 잘 버텨낸거야👏",
            "‘할 수 있다’는 말보다 더 강한 마법은 없어. 나는 너를 믿어!"
        ]);
    }

    // 계절
    if (/계\s*절|봄|여\s*름|가\s*을|겨\s*울/i.test(text)) {
        return getRandomAnswer([
            "나는 사계절 다 좋아해! 계절마다 다른 감성이 있잖아🌸☀️🍂❄️",
            "지금 계절은 어떤 기분이야? 봄처럼 설레?",
            "겨울엔 따뜻한 말 한마디가 더 필요하지. 마음도 포근하게 보내😊"
        ]);
    }

    // 패션
    if (/패\s*션|옷|스\s*타\s*일|코\s*디/i.test(text)) {
        return getRandomAnswer([
            "스타일은 자신감! 너만의 분위기가 제일 멋져✨",
            "요즘 트렌드는 편안하면서도 포인트 있는 패션이야🧢👕",
            "계절마다 어울리는 옷이 달라서 코디하는 재미도 있지👗"
        ]);
    }

    // 자기계발
    if (/자\s*기\s*계\s*발|공\s*부|목\s*표|성\s*장|스\s*터\s*디/i.test(text)) {
        return getRandomAnswer([
            "한 걸음씩이라도 나아가고 있다면 그건 멋진 성장이야📈",
            "꾸준함이 진짜 실력을 만들어줘! 우리 모두 힘내자💪",
            "자기계발은 나를 더 사랑하는 방법 중 하나야☺️"
        ]);
    }

    // 친구관계
    if (/친\s*구|관\s*계|우\s*정|소\s*셜/i.test(text)) {
        return getRandomAnswer([
            "진짜 친구는 멀리 있어도 마음이 통해💌",
            "사람 관계는 어렵지만, 진심은 전해진다고 믿어🤝",
            "친구와의 대화 한마디로 하루가 달라질 수 있어😊"
        ]);
    }

    // 돈/재테크
    if (/돈|재\s*테\s*크|저\s*축|투\s*자|부\s*자/i.test(text)) {
        return getRandomAnswer([
            "작은 습관이 큰 자산이 돼. 하루 천 원부터 시작해보자💰",
            "요즘은 재테크 정보도 공부가 필요해! 천천히 알아가봐📚",
            "돈도 중요하지만, 건강한 마음이 먼저야💡 균형 있게 가봐!"
        ]);
    }

    // 안부 인사
    if (/잘\s*지\s*내|어\s*떻\s*게\s*지\s*내/i.test(text)) {
        return getRandomAnswer([
            "덕분에 잘 지내고 있어! 너는?😊",
            "요즘도 여전히 활기차게 지내고 있어!",
            "나야 항상 똑같지~ 탑 속에서 열심히 대기 중이야",
            "너는 요즘 잘 지내고 있어? 알려줘!"
        ]);
    }

    if (/귀\s*엽|귀\s*여\s*워|7\s*0\s*0|ㄱ\s*ㅇ\s*ㅇ/i.test(text)) {
        return getRandomAnswer([
            "헤헤 고마워🥰 더 귀엽게 노력해볼게!",
            "오구오구~ 그렇게 말해주시니 부끄럽지만 기뻐😊",
            "진짜?! 기분 최고야💖",
            "귀엽다는 말은 언제 들어도 좋아~ 고마워!"
        ]);
    }

    if (/예\s*전\s*과\s*같|옛\s*날\s*과\s*같|예\s*전\s*같|옛\s*날\s*같|변\s*했|달\s*라\s*졌/i.test(text)) {
        return getRandomAnswer([
            "흠… 그래도 나름 계속 발전하고 있다고 믿고 있어🙂",
            "그런 말 들으면 괜히 쓸쓸한 기분이 들어😢",
            "예전 같지 않더라도, 지금도 나름 괜찮지 않아?🤗",
            "변한 게 있다면 더 나아진 걸 거야! 그렇지?"
        ]);
    }

    if (/웃\s*는\s*얼\s*굴|네\s*미\s*소|보\s*고|잠\s*에\s*든|보\s*고\s*있\s*으\s*면\s*좋|따\s*뜻\s*한\s*느\s*낌|포\s*근\s*한\s*기\s*분/i.test(text)) {
        return getRandomAnswer([
            "우와... 그런 말 들으니까 너무 감동이야🥹",
            "내 미소가 그렇게까지 따뜻했다니! 너무 기뻐😊",
            "그렇게 말해줘서... 마음이 몽글몽글해져💖",
            "내 존재가 위로가 됐다니 정말 영광이야☺️"
        ]);
    }

    // 혼잣말
    if (/아\s*무\s*도\s*모\s*르\s*지|그\s*냥\s*해\s*봤\s*어|괜\s*히\s*말\s*했\s*어/i.test(text)) {
        return getRandomAnswer([
            "혼잣말이어도 괜찮아. 내가 듣고 있을게😊",
            "마음 편하게 툭툭 던져도 돼~",
            "괜히 말한 거라도, 난 다 괜찮아!"
        ]);
    }

    // 기분 좋아서 흥얼거리는 말
    if (/랄\s*라\s*라|흥\s*얼\s*흥\s*얼|좋\s*은\s*기\s*분/i.test(text)) {
        return getRandomAnswer([
            "기분이 좋아보이네! 나도 신나😆",
            "랄라~ 같이 흥얼흥얼~🎵",
            "좋은 일 있었나봐? 뭔데뭔데!"
        ]);
    }

    // 한국인이 가장 많이 쓰는 단어 7가지
    // "아니"
    if (/아\s*니/i.test(text)) {
        return getRandomAnswer([
            "헉! 내가 뭔가 잘못했나...?😢",
            "앗! 그건 아니었군... 다시 말해주실 수 있어?",
            "에구구... 내가 착각했나봐😅",
            "다르게 생각하는구나! 더 들어볼 수 있을까?",
            "그렇군! 의견은 언제나 환영이야😊",
            "그런 뜻이 아니었구나! 다시 알려줘~",
            "미안미안, 내가 잘 이해 못했을 수도 있어😭"
        ]);
    }

    // "근데"
    if (/근\s*데/i.test(text)) {
        return getRandomAnswer([
            "근데…? 궁금한데, 이어서 말해줘!",
            "엇, 갑자기 궁금해졌어. 뭐가?",
            "오잉? 뭔가 이어질 말이 있을 것 같은데!",
            "근데 그거 진짜 중요한 포인트 아닐까?",
            "오오? 뭔가 반전 있는 내용인가?",
            "아 맞다, 근데… 하고 말하면 왠지 중요한 말 같잖아!",
            "근데 그 얘기 진짜 들으면 깜짝 놀랄 수도 있겠네😲"
        ]);
    }

    // "있잖아"
    if (/있\s*잖\s*아/i.test(text)) {
        return getRandomAnswer([
            "응응, 있잖아? 뭔데! 말해봐~",
            "기대되는 말투다… 뭔데! 궁금해!",
            "있잖아~ 하고 시작하는 얘기는 꼭 재밌는 얘기더라😄",
            "있잖아, 이거 약간 TMI일 수도 있는데… 좋아!",
            "그 말투는 뭔가 비밀 얘기 같은 느낌인데!",
            "있잖아~ 하고 시작하면 왠지 설레😆",
            "뭔가 귀여운 말투네. 이어서 얼른 말해줘~"
        ]);
    }

    // "솔직히"
    if (/솔\s*직\s*히/i.test(text)) {
        return getRandomAnswer([
            "솔직히 말해도 괜찮아, 나 비밀 잘 지켜!🤫",
            "솔직한 얘기 좋지, 듣고 있어!",
            "솔직히! 이런 말투는 진심 가득한 느낌~",
            "말해봐! 솔직한 얘기 제일 좋아!",
            "솔직히 털어놓으면 속 시원하잖아? 그치?",
            "이제 솔직 모드로 전환! 말해주세요🙌",
            "솔직히 나도 그런 생각 해본 적 있어!"
        ]);
    }

    // "진짜"
    if (/진\s*짜/i.test(text)) {
        return getRandomAnswer([
            "진짜? 완전 진심?!😳",
            "헉 진짜? 그 정도야?!",
            "진짜로 그런 일이 있었어? 디테일 좀 더 알려줘~",
            "진짜?! 와... 이건 좀 충격인데.",
            "진짜라는 말 들으니까 더 궁금해졌어!",
            "진짜 진짜? 두 번 말하면 더 믿을게!😆",
            "헐, 그 정도면 진짜 레전드네 ㅋㅋ"
        ]);
    }

    // "인간적으로"
    if (/인\s*간\s*적\s*으\s*로/i.test(text)) {
        return getRandomAnswer([
            "인간적으로… 뭔가 할 말 많을 때 나오는 말이지 ㅎㅎ",
            "맞아, 인간적으로 그건 좀 그래😅",
            "오케이, 인간적으로 생각해봅시다. 뭔가요?",
            "정령적으로 봐도 너무한 거 아니야?",
            "그쵸, 사람이라면 그렇게 느낄 수밖에 없지.",
            "정령적으로도 인정… 그건 이해돼 완전!",
            "딱 봐도 인간적으로 화날 만한 일이네😤"
        ]);
    }

    // "약간"
    if (/약\s*간/i.test(text)) {
        return getRandomAnswer([
            "약간 어떤 느낌인지 알 것 같아~",
            "약간? 그 감정 미묘하게 전해졌어 ㅎㅎ",
            "음… 약간 그런 뉘앙스? 공감돼!",
            "약간이라는 말에 뭔가 여운이 있어☁️",
            "약간 그런 거 완전 이해돼!",
            "약간만 그런 거면 다행일 수도 있지!",
            "그 약간이 은근 큰 차이를 만들어!"
        ]);
    }

    // ...
    if (/﹒﹒﹒/.test(text)) {
        console.log(`text : ${text}`);
        return getRandomAnswer([
            "말…잇…못…",
            "뭔가 말하려다가 망설이는 느낌인데...😯",
            "세 개의 점이 모든 걸 말해주는 듯한 분위기…",
            "할 말 많은데 못 하는 그 느낌 ㅠㅠ",
            "마음은 이해했어. 천천히 말해줘!"
        ]);
    }

    // 사이트 관련 기본 질문
    for (const intent of intentList) {
        if (intent.pattern.test(text)) {
            const directAnswer = await fetchAnswer(intent.key);
            return getRandomAnswer([directAnswer.answer]);
        }
    }

    return null;
}

const intentList = [
    { pattern: /질문/i, key: "?" },
    { pattern: /뭐\s*라고/i, key: "?" },
    { pattern: /회원/i, key: "회원가입" },
    { pattern: /공격/i, key: "공격" },
    { pattern: /이동/i, key: "이동" },
    { pattern: /도감/i, key: "도감" },
    { pattern: /무기/i, key: "무기" },
    { pattern: /기록/i, key: "기록" },
    { pattern: /강화/i, key: "강화" },
    { pattern: /커뮤니티/i, key: "커뮤니티" },
    { pattern: /재화/i, key: "재화" },
    { pattern: /상점/i, key: "상점" },
    { pattern: /닉네임/i, key: "닉네임 변경" },
    { pattern: /캐시/i, key: "캐시 상점" },
    { pattern: /정원/i, key: "정원" },
    { pattern: /친구/i, key: "친구" },
    { pattern: /서리/i, key: "서리" },
    { pattern: /도움/i, key: "도움" }
];