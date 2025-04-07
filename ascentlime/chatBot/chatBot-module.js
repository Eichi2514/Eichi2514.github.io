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

    const profileImg = `<img class="${imgClass}" src="${imgSrc}" alt="${imgAlt}"/>`;

    const message = `
        <div class="flex gap-2">
            ${isUser ? `
                <div class="${className}">${text}</div>
                ${profileImg}
            ` : `
                ${profileImg}
                <div class="${className}">${text}</div>
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

$(document).on('click', '.chatBot-sand', async function () {
    const $textarea = $('textarea[name="chatBot-question"]');
    const question = $textarea.val().trim().replace(/\n/g, '<br>');
    const forbiddenChars = /[.#$/\[\]]/;

    if (!question) return;

    // 질문
    appendChat(question, true);

    const parsed = parseQuestion(question);

    if (parsed) {
        const { qText, aText, editable } = parsed;
        if (forbiddenChars.test(qText)) {
            // 대답
            appendChat("질문에 '.', '#', '$', '[', ']' 문자는 사용할 수 없어요😐");
        } else {
            const existing = await fetchAnswer(qText);
            if (existing) {
                if (existing.editable === true) {
                    // 대답
                    appendChat("이 질문은 수정할 수 없어요🤖");
                } else {
                    // 대답
                    appendChat(`'${qText}'(이)라는 질문이 수정되었고,<br>'${aText}'(이)라고 다시 대답할게요😊`);
                    await storeAnswer(qText, aText);
                }
            } else {
                // 대답
                appendChat(`'${qText}'(이)라는 질문이 등록되었고,<br>'${aText}'(이)라고 대답할게요😄`);
                const isEditable = editable === '2514';
                await storeAnswer(qText, aText, isEditable);
            }
        }
    } else {
        if (forbiddenChars.test(question)) {
            // 대답
            appendChat("질문에 '.', '#', '$', '[', ']' 문자는 사용할 수 없어요😐");
        } else {
            const directAnswer = await fetchAnswer(question);

            if (directAnswer) {
                // 대답
                appendChat(directAnswer.answer);
            } else {
                // 대답
                appendChat(`아직 그 질문에 대한 답변이 없어요😅<br>"안녕이라고 말하면 안녕하세요라고 대답해줘"<br>같은 형식으로 등록해 주세요!`);
            }
        }
    }
    $textarea.val('');
    scrollToBottom();
});