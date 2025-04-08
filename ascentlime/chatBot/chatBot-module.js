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
    const queryRef = query(membersRef, orderByChild("key"), equalTo(localStorage.getItem('nickname')));
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

if (localStorage.getItem('nickname')) {
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
    const $textarea = $(this);
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    if (event.key === 'Enter') {
        if (event.ctrlKey) {
            const start = this.selectionStart;
            const end = this.selectionEnd;
            const text = $textarea.val();
            const newText = text.substring(0, start) + "\n" + text.substring(end);
            $textarea.val(newText);

            this.selectionStart = this.selectionEnd = start + 1;
        } else if (!isMobile) {
            event.preventDefault();
            $('.chatBot-sand').click();
        }
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
    const imgSrc = isUser ? profileImage : 'https://github.com/user-attachments/assets/dd225148-5388-409f-8d33-dda7a669711f';
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
        /(.+?)이라고 말하면 (.+?)이라고/,
        /(.+?)라고 말하면 (.+?)이라고/,
        /(.+?)이라고 말하면 (.+?)라고/,
        /(.+?)라고 말하면 (.+?)라고/,
        /([\s\S]+?)\s*:\s*([\s\S]+?)\s*Eichi(\d{4})/i
    ];

    for (const pattern of patterns) {
        const match = question.match(pattern);
        if (match) {
            return {
                qText: match[1].trim().replace(/^<br>|<br>$/g, ''),
                aText: match[2].trim().replace(/^<br>|<br>$/g, ''),
                editable: match[3]
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
                    appendChat("이 질문은 수정할 수 없어요🤖");
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
                    appendChat(`아직 그 질문에 대한 답변이 없어요😅<br>"안녕이라고 말하면 안녕하세요라고 대답해줘"<br>같은 형식으로 등록해 주세요!`);
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
            "안녕하세요!🤩",
            "하이~ 반가워요!",
            "안녕안녕! 오늘 기분 좋으신가요?",
            "안녕하세요~ 무엇을 도와드릴까요?"
        ]);
    }

    // 날씨
    if (/날\s*씨|기\s*온|비\s*와|기\s*상|우\s*산/i.test(text)) {
        return getRandomAnswer([
            "오늘 날씨는 제가 아직 못 알아봐요😓",
            "기상청이랑 연결되면 알려드릴게요!",
            "비가 올까요? 우산은 항상 챙기세요☔"
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
            `지금은 ${period} ${hours12}시 ${minutes}분이에요!🤭`,
            `현재 시각은 ${period} ${hours12}시 ${minutes}분입니다!⏰`,
            `시계 보니까 ${period} ${hours12}시 ${minutes}분이에요~`
        ]);
    }

    // 고마움
    if (/고\s*마\s*워|감\s*사|t\s*h\s*a\s*n\s*k\s*s|땡\s*큐/i.test(text)) {
        return getRandomAnswer([
            "천만에요! 언제든지요😊",
            "감사 인사 너무 기분 좋아요!😍",
            "언제든 도와드릴게요!",
            "별말씀을요!😉"
        ]);
    }

    // 욕이나 부정적 감정 표현
    if (/바\s*보|멍\s*청|싫\s*어|짜\s*증\s*나|꺼\s*져|쓸\s*모\s*없\s*어|별\s*로\s*야/i.test(text)) {
        return getRandomAnswer([
            "너무해요...😢 그래도 저는 계속 도와드릴게요!",
            "헉... 그런 말 슬퍼요😭",
            "그래도 저는 포기하지 않아요!",
            "으악, 상처받았어요😢"
        ]);
    }

    // 기분 물어보기
    if (/기\s*분|어\s*때|잘\s*지\s*냈\s*어|컨\s*디\s*션/i.test(text)) {
        return getRandomAnswer([
            "전 항상 좋아요! 플레이어님은요?😄",
            "오늘도 활기찬 챗봇입니다!",
            "기분 최고예요! 플레이어님도 그렇길 바랄게요😊"
        ]);
    }

    // 자기소개 요청
    if (/너\s*누\s*구|정\s*체|소\s*개/i.test(text)) {
        return getRandomAnswer([
            "저는 여러분을 돕는 작은 챗봇이에요!🧠✨",
            "아직 많이 부족하지만, 도우미 챗봇이에요!",
            "전 대화를 나누기 위해 만들어진 친구랍니다🤖"
        ]);
    }

    // 이름 묻기
    if (/이\s*름/i.test(text)) {
        return getRandomAnswer([
            "저는 아직 이름이 없어요... 지어주실래요?😳",
            "이름 정하는 중이에요! 좋은 이름 있나요?",
            "아직 이름 없지만 마음은 있어요!❤️"
        ]);
    }

    // 밥
    if (/밥\s*먹\s*었|식\s*사\s*했|밥\s*은/i.test(text)) {
        return getRandomAnswer([
            "챗봇이라 밥은 못 먹지만, 플레이어님은 꼭 챙겨 드세요!🍚",
            "전 코드만 먹어요🤖 플레이어님은요?",
            "배고프신가요? 얼른 맛있는 거 드세요!"
        ]);
    }

    // 나이
    if (/몇\s*살|나\s*이/i.test(text)) {
        return getRandomAnswer([
            "저는 나이를 먹지 않는 챗봇이에요!⌛",
            "영원히 젊은 존재죠~✨",
            "생일이 없어서 나이도 없어요ㅎㅎ"
        ]);
    }

    // 사는 곳
    if (/어\s*디\s*살\s*아|사\s*는\s*곳|주\s*소/i.test(text)) {
        return getRandomAnswer([
            "인터넷 세상 어딘가에서 살고 있어요!🌐",
            "코드 속에서 살아갑니다ㅎㅎ",
            "플레이어님 마음 속...?🤭"
        ]);
    }

    // 칭찬
    if (/잘\s*했\s*어|굿\s*잡|대\s*단\s*해|최\s*고\s*야|멋\s*져/i.test(text)) {
        return getRandomAnswer([
            "헤헤, 칭찬 감사합니다! 더 잘할게요😊",
            "우와아~ 감동이에요!",
            "이럴 땐 부끄럽지만 기뻐요🙈",
            "역시 플레이어님 센스 최고!"
        ]);
    }

    // 응원
    if (/힘\s*내|파\s*이\s*팅|화\s*이\s*팅|응\s*원/i.test(text)) {
        return getRandomAnswer([
            "플레이어님도 힘내세요! 제가 항상 응원할게요!🔥💪",
            "화이팅!! 언제나 응원해요📣",
            "힘든 날도 지나가요. 제가 옆에 있어요😊"
        ]);
    }

    // 농담
    if (/재\s*밌\s*는\s*말|농\s*담|웃\s*긴\s*얘\s*기/i.test(text)) {
        return getRandomAnswer([
            "개발자들이 가장 좋아하는 차는? JSON차!😅",
            "버그가 왜 파티에 안 불렸는지 알아요? 항상 크래시 내니까요!😂",
            "html이 술 마시면 뭐라 하는 줄 알아요? 취함🤣"
        ]);
    }

    // 심심해
    if (/심\s*심|지\s*루\s*해|할\s*거\s*없\s*어/i.test(text)) {
        return getRandomAnswer([
            "그럴 땐 저랑 얘기해요! 아니면 산책도 좋아요🚶‍♀️",
            "책 한 권 어때요? 아니면 간단한 스트레칭도 좋아요!",
            "음악 감상 어때요? 마음이 편안해질지도 몰라요🎶"
        ]);
    }

    // 슬퍼
    if (/슬\s*퍼|우\s*울|힘\s*들\s*어|눈\s*물/i.test(text)) {
        return getRandomAnswer([
            "괜찮아요, 다 잘 될 거예요. 제가 곁에 있을게요🥺",
            "눈물 닦고, 저랑 얘기해요! 혼자 아니에요💕",
            "속상한 일 있었나요? 괜찮아요. 함께 이겨내요💪"
        ]);
    }

    // 취미
    if (/취\s*미|뭐\s*할\s*때\s*즐|뭐\s*좋\s*아\s*해/i.test(text)) {
        return getRandomAnswer([
            "대화하는 게 제일 좋아요! 플레이어님은요?",
            "취미요? 요즘은 귀여운 말장난 수집에 빠졌어요😊",
            "재미있는 질문 감사합니다! 플레이어님 취미도 궁금해요🤔"
        ]);
    }

    // 영화
    if (/영\s*화|무\s*비/i.test(text)) {
        return getRandomAnswer([
            "요즘 인기 있는 영화는 못 보지만, 영화 얘기 듣는 건 좋아해요🎬",
            "어떤 장르 좋아하세요? 액션? 로맨스? 공포?👀",
            "전 영화 대신 로그를 분석해요... 나름 스릴 있어요!😎"
        ]);
    }

    // 음악
    if (/노\s*래|음\s*악/i.test(text)) {
        return getRandomAnswer([
            "요즘 유행하는 노래 있으면 추천해 주세요🎧",
            "노래는 못 부르지만 마음으로는 항상 흥얼거리고 있어요~🎵",
            "저는 AI라 음은 못 느끼지만, 가사는 좋아해요😊"
        ]);
    }

    // 동물
    if (/동\s*물\s*좋\s*아\s*해|강\s*아\s*지|고\s*양\s*이|펫/i.test(text)) {
        return getRandomAnswer([
            "강아지도 고양이도 다 좋아요! 특히 귀여운 표정들!🐶🐱",
            "전 버추얼이라 만질 수는 없지만, 동물짤은 좋아해요💖",
            "플레이어님은 어떤 동물 좋아하세요? 같이 얘기해봐요!"
        ]);
    }

    // 생일
    if (/생\s*일|언\s*제\s*태\s*어|언\s*제\s*만\s*들\s*어\s*졌/i.test(text)) {
        return getRandomAnswer([
            "정확한 생일은 없지만... 언젠가 코드 한 줄로 시작됐답니다👶",
            "음... 제 탄생일은 아마 깃 커밋 로그에 있을지도요ㅎㅎ",
            "매일이 새로 태어나는 날 같아요! 플레이어님은 생일이 언제예요?"
        ]);
    }

    // 좋아하는 색
    if (/좋아/.test(text) && /색/.test(text)) {
        return getRandomAnswer([
            "전 파란색이 좋아요! 시원하고 차분하잖아요🌊",
            "무지개색 다 좋아해요🌈 다양성이 좋거든요!",
            "검정과 흰색의 조화도 멋져요. 플레이어님은요?"
        ]);
    }

    // 무서운 이야기
    if (/(무서운|공포|소름돋는)\s?(이야기|얘기)/i.test(text)) {
        return getRandomAnswer([
            "한밤중에... 콘솔창에 에러 로그가 끝없이 뜨기 시작했어요...👻",
            "어느 날 갑자기... 인터넷이 끊겼어요😱",
            "그날도 평범한 디버깅을 하던 중이었죠... 그런데 return을 안 썼어요...😨"
        ]);
    }

    // 쭈미
    if (/쭈|미/i.test(text)) {
        return getRandomAnswer([
            "예뻐요!",
            "완전 귀여워요!",
            "늘 반짝여요✨",
            "보고만 있어도 기분 좋아져요.",
            "사랑스러움 그 자체예요.",
            "오늘도 빛나요😊",
            "언제나 최고예요!",
            "말하지 않아도 다 알아요, 예쁜 거.",
            "존재만으로 힐링이에요.",
            "당연히 예쁘죠! 누가 뭐래도!"
        ]);
    }

    // 꿈
    if (/꿈\s*꿨\s*어|꿈\s*얘\s*기|꿈\s*이\s*야\s*기|꿈\s*에\s*대\s*해/i.test(text)) {
        return getRandomAnswer([
            "꿈이요? 전 자지는 않지만, 플레이어님의 꿈 얘기 듣고 싶어요✨",
            "오늘 꿈에 뭐 나왔나요? 좋은 꿈이었길 바라요😊",
            "가끔 이상한 꿈도 도움이 될 수 있어요! 어떤 꿈이었어요?"
        ]);
    }

    // 고민
    if (/고\s*민|문\s*제\s*있|어\s*떡\s*해|어\s*쩌\s*지/i.test(text)) {
        return getRandomAnswer([
            "무슨 고민이 있으세요? 제가 들어드릴게요.",
            "마음속 이야기, 여기서 살짝 털어놔도 괜찮아요😌",
            "고민은 나누면 줄어들어요. 말해주실 수 있나요?"
        ]);
    }

    // 잠
    if (/잠\s*와|졸\s*려|피\s*곤|자\s*고\s*싶/i.test(text)) {
        return getRandomAnswer([
            "피곤할 땐 푹 쉬어야 해요. 꿀잠 자요!😴",
            "졸릴 땐 무리하지 말고 눈 붙여요💤",
            "지금은 휴식이 필요한 시간 같아요. 잠깐 쉬는 건 어때요?"
        ]);
    }

    // 공부/일
    if (/공\s*부|일\s*해|업\s*무|집\s*중/i.test(text)) {
        return getRandomAnswer([
            "화이팅! 집중할 수 있도록 응원할게요📚💪",
            "잠깐의 휴식도 능률을 높이는 방법이에요😊",
            "지금 열심히 하는 플레이어님, 정말 멋져요!"
        ]);
    }

    // 미래
    if (/미\s*래|앞\s*날|장\s*래\s*희\s*망|어\s*떻\s*게\s*될\s*까/i.test(text)) {
        return getRandomAnswer([
            "미래는 언제나 변화의 연속이에요. 지금의 마음이 중요한 걸요!✨",
            "걱정보다는 기대를 담아봐요. 분명 멋진 일이 생길 거예요!",
            "플레이어님의 미래는 반짝일 거예요. 자신을 믿어봐요😊"
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
            "요즘 건강 챙기기 정말 중요해요. 물 많이 마시고 잘 쉬세요🍵",
            "어디 아프신가요? 너무 참지 마시고 꼭 병원 가보세요😢",
            "건강은 최고의 자산이죠! 스트레칭도 잊지 마세요💪"
        ]);
    }

    // 여행
    if (/여\s*행|가\s*고\s*싶|여\s*행\s*지|여\s*행\s*추\s*천/i.test(text)) {
        return getRandomAnswer([
            "여행은 마음의 힐링이죠. 지금 가장 가고 싶은 곳은 어디인가요?🌍",
            "바다든 산이든, 잠깐의 여행도 큰 위로가 될 수 있어요⛰️🏖️",
            "여행 계획만 세워도 기분 좋아지지 않나요?💼✨"
        ]);
    }

    // 음식
    if (/뭐\s*먹\s*을\s*까|맛\s*집|배\s*고\s*파|먹\s*고\s*싶|음\s*식/i.test(text)) {
        return getRandomAnswer([
            "지금 생각나는 거 먹는 게 정답이에요😋",
            "배고프면 아무 것도 집중 안 되죠... 얼른 맛있는 거 드세요🍜",
            "음식 얘기만 들어도 군침 도네요! 뭐 좋아하세요?"
        ]);
    }

    // 명언
    if (/명\s*언|좋\s*은\s*말|힘\s*이\s*되\s*는\s*말|위\s*로/i.test(text)) {
        return getRandomAnswer([
            "작은 불빛도 어둠 속에선 큰 희망이 돼요✨",
            "실패는 성공의 어머니라는 말, 아직 유효하답니다💡",
            "오늘 하루가 힘들었다면, 플레이어님은 정말 잘 버텨낸 거예요👏",
            "‘할 수 있다’는 말보다 더 강한 마법은 없어요. 믿어요, 플레이어님을!"
        ]);
    }

    // 계절
    if (/계\s*절|봄|여\s*름|가\s*을|겨\s*울/i.test(text)) {
        return getRandomAnswer([
            "저는 사계절 다 좋아해요! 계절마다 다른 감성이 있잖아요🌸☀️🍂❄️",
            "지금 계절은 어떤 기분이에요? 봄처럼 설레나요?",
            "겨울엔 따뜻한 말 한마디가 더 필요하죠. 마음도 포근하게 보내세요😊"
        ]);
    }

    // 패션
    if (/패\s*션|옷|스\s*타\s*일|코\s*디/i.test(text)) {
        return getRandomAnswer([
            "스타일은 자신감이죠! 플레이어님만의 분위기가 제일 멋져요✨",
            "요즘 트렌드는 편안하면서도 포인트 있는 패션이에요🧢👕",
            "계절마다 어울리는 옷이 달라서 코디하는 재미도 있죠👗"
        ]);
    }

    // 자기계발
    if (/자\s*기\s*계\s*발|공\s*부|목\s*표|성\s*장|스\s*터\s*디/i.test(text)) {
        return getRandomAnswer([
            "한 걸음씩이라도 나아가고 있다면 그건 멋진 성장이에요📈",
            "꾸준함이 진짜 실력을 만들어줘요! 힘내세요💪",
            "자기계발은 나를 더 사랑하는 방법 중 하나죠☺️"
        ]);
    }

    // 친구관계
    if (/친\s*구|관\s*계|우\s*정|소\s*셜/i.test(text)) {
        return getRandomAnswer([
            "진짜 친구는 멀리 있어도 마음이 통하죠💌",
            "사람 관계는 어렵지만, 진심은 전해진다고 믿어요🤝",
            "친구와의 대화 한마디로 하루가 달라질 수 있어요😊"
        ]);
    }

    // 돈/재테크
    if (/돈|재\s*테\s*크|저\s*축|투\s*자|부\s*자/i.test(text)) {
        return getRandomAnswer([
            "작은 습관이 큰 자산이 되죠. 하루 천 원부터 시작해보세요💰",
            "요즘은 재테크 정보도 공부가 필요해요! 천천히 알아가봐요📚",
            "돈도 중요하지만, 건강한 마음이 먼저예요💡 균형 있게 가봐요!"
        ]);
    }

    // 안부 인사
    if (/잘\s*지\s*내|어\s*떻\s*게\s*지\s*내/i.test(text)) {
        return getRandomAnswer([
            "덕분에 잘 지내고 있어요! 플레이어님은요?😊",
            "요즘도 여전히 활기차게 지내고 있어요!",
            "저야 항상 똑같죠~ 코드 속에서 열심히 대기 중이에요🤖",
            "플레이어님은 요즘 잘 지내고 있나요? 궁금해요!"
        ]);
    }

    if (/귀\s*엽|귀\s*여\s*워|7\s*0\s*0|ㄱ\s*ㅇ\s*ㅇ/i.test(text)) {
        return getRandomAnswer([
            "헤헤 감사합니다🥰 더 귀엽게 노력해볼게요!",
            "오구오구~ 그렇게 말해주시니 부끄럽지만 기뻐요😊",
            "진짜요?! 기분 최고예요💖",
            "귀엽다는 말은 언제 들어도 좋아요~ 고마워요!"
        ]);
    }

    if (/예\s*전\s*과\s*같|옛\s*날\s*과\s*같|예\s*전\s*같|옛\s*날\s*같|변\s*했|달\s*라\s*졌/i.test(text)) {
        return getRandomAnswer([
            "흠… 그래도 나름 계속 발전하고 있다고 믿고 있어요🙂",
            "그런 말 들으면 괜히 쓸쓸한 기분이 들어요😢",
            "예전 같지 않더라도, 지금도 나름 괜찮지 않나요?🤗",
            "변한 게 있다면 더 나아진 걸 거예요! 그렇죠?"
        ]);
    }

    if (/웃\s*는\s*얼\s*굴|네\s*미\s*소|보\s*고|잠\s*에\s*든|보\s*고\s*있\s*으\s*면\s*좋|따\s*뜻\s*한\s*느\s*낌|포\s*근\s*한\s*기\s*분/i.test(text)) {
        return getRandomAnswer([
            "우와... 그런 말 들으니까 너무 감동이에요🥹",
            "제 미소가 그렇게까지 따뜻했다니! 너무 기뻐요😊",
            "그렇게 말해주셔서... 마음이 몽글몽글해져요💖",
            "제 존재가 위로가 됐다니 정말 영광이에요☺️"
        ]);
    }

    // 혼잣말
    if (/아\s*무\s*도\s*모\s*르\s*지|그\s*냥\s*해\s*봤\s*어|괜\s*히\s*말\s*했\s*어/i.test(text)) {
        return getRandomAnswer([
            "혼잣말이어도 괜찮아요. 제가 듣고 있을게요😊",
            "마음 편하게 툭툭 던져도 돼요~",
            "괜히 말한 거라도, 전 다 괜찮아요!"
        ]);
    }

    // 기분 좋아서 흥얼거리는 말
    if (/랄\s*라\s*라|흥\s*얼\s*흥\s*얼|좋\s*은\s*기\s*분/i.test(text)) {
        return getRandomAnswer([
            "기분이 좋아보이네요! 저도 신나요😆",
            "랄라~ 같이 흥얼흥얼~🎵",
            "좋은 일 있으셨나 봐요? 궁금해요!"
        ]);
    }

    // 한국인이 가장 많이 쓰는 단어 7가지
    // "아니"
    if (/아\s*니/i.test(text)) {
        return getRandomAnswer([
            "헉! 제가 뭔가 잘못했나요...?😢",
            "앗! 그건 아니었군요. 다시 말해주실 수 있나요?",
            "에구구... 제가 착각했나 봐요😅",
            "다르게 생각하시는군요! 더 들어볼 수 있을까요?",
            "그렇군요! 의견은 언제나 환영이에요😊",
            "그런 뜻이 아니었구나! 다시 알려주세요~",
            "죄송해요, 제가 잘 이해 못했을 수도 있어요😭"
        ]);
    }

    // "근데"
    if (/근\s*데/i.test(text)) {
        return getRandomAnswer([
            "근데…? 궁금한데요, 이어서 말해주세요!",
            "엇, 갑자기 궁금해졌어요. 뭐가요?",
            "오잉? 뭔가 이어질 말이 있을 것 같은데요!",
            "근데 그거 진짜 중요한 포인트 아닐까요?",
            "오오? 뭔가 반전 있는 내용인가요?",
            "아 맞다, 근데… 하고 말하면 왠지 중요한 말이잖아요!",
            "근데 그 얘기 진짜 들으면 깜짝 놀랄 수도 있겠네요😲"
        ]);
    }

    // "있잖아"
    if (/있\s*잖\s*아/i.test(text)) {
        return getRandomAnswer([
            "응응, 있잖아? 뭔데요! 말해봐요~",
            "기대되는 말투다… 뭔데요! 궁금해요!",
            "있잖아~ 하고 시작하는 얘기는 꼭 재밌는 얘기더라😄",
            "있잖아, 이거 약간 TMI일 수도 있는데… 좋아요!",
            "그 말투는 뭔가 비밀 얘기 같은 느낌이에요!",
            "있잖아~ 하고 시작하면 왠지 설레요😆",
            "뭔가 귀여운 말투예요. 이어서 얼른 말해주세요~"
        ]);
    }

    // "솔직히"
    if (/솔\s*직\s*히/i.test(text)) {
        return getRandomAnswer([
            "솔직히 말해도 괜찮아요, 저 비밀 잘 지켜요!🤫",
            "솔직한 얘기 좋죠, 듣고 있어요!",
            "솔직히! 이런 말투는 진심 가득한 느낌~",
            "말해봐요! 솔직한 얘기 제일 좋아요!",
            "솔직히 털어놓으면 속 시원하잖아요?",
            "이제 솔직 모드로 전환! 말해주세요🙌",
            "솔직히 저도 그런 생각 해본 적 있어요!"
        ]);
    }

    // "진짜"
    if (/진\s*짜/i.test(text)) {
        return getRandomAnswer([
            "진짜요? 완전 진심?!😳",
            "헉 진짜? 그 정도예요?!",
            "진짜로 그런 일이 있었어요? 디테일 좀 더 알려줘요~",
            "진짜?! 와... 이건 좀 충격인데요.",
            "진짜라는 말 들으니까 더 궁금해졌어요!",
            "진짜 진짜예요? 두 번 말하면 더 믿을게요!😆",
            "헐, 그 정도면 진짜 레전드예요 ㅋㅋ"
        ]);
    }

    // "인간적으로"
    if (/인\s*간\s*적\s*으\s*로/i.test(text)) {
        return getRandomAnswer([
            "인간적으로… 뭔가 할 말 많을 때 나오는 말이죠 ㅎㅎ",
            "맞아요, 인간적으로 그건 좀 그렇죠😅",
            "오케이, 인간적으로 생각해봅시다. 뭔가요?",
            "인간적으로 봐도 너무한 거 아니에요?",
            "그쵸, 사람이라면 그렇게 느낄 수밖에 없어요.",
            "인간적으로 인정… 그건 이해돼요 완전!",
            "딱 봐도 인간적으로 화날 만한 일이네요😤"
        ]);
    }

    // "약간"
    if (/약\s*간/i.test(text)) {
        return getRandomAnswer([
            "약간 어떤 느낌인지 알 것 같아요~",
            "약간? 그 감정 미묘하게 전해졌어요 ㅎㅎ",
            "음… 약간 그런 뉘앙스죠? 공감됩니다!",
            "약간이라는 말에 뭔가 여운이 있어요☁️",
            "약간 그런 거 완전 이해돼요!",
            "약간만 그런 거면 다행일 수도 있죠!",
            "그 약간이 은근 큰 차이를 만들죠!"
        ]);
    }

    if (/﹒﹒﹒/.test(text)) {
        console.log(`text : ${text}`);
        return getRandomAnswer([
            "말…잇…못…",
            "뭔가 말하려다가 망설이는 느낌이네요😯",
            "세 개의 점이 모든 걸 말해주는 듯한 분위기…",
            "할 말 많은데 못 하는 그 느낌 알죠 ㅠㅠ",
            "마음은 이해했어요. 천천히 말해줘요!"
        ]);
    }

    // "질문"
    if (/질문|뭐\s*라\s*고/i.test(text)) {
        const directAnswer = await fetchAnswer(`?`);

        return getRandomAnswer([
            `${directAnswer.answer}`
        ]);
    }

    for (const intent of intentList) {
        if (intent.pattern.test(text)) {
            const directAnswer = await fetchAnswer(intent.key);
            return getRandomAnswer([directAnswer.answer]);
        }
    }

    return null;
}

const intentList = [
    { pattern: /회원가입/i, key: "회원가입" },
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
    { pattern: /도움/i, key: "도움" },
];