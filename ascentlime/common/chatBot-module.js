$('head').append('<link rel="stylesheet" href="../common/chatBot.css" type="text/css"/>');

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
const chatBotRef = ref(database, 'chatBots');

$(document).on('keydown', 'input[name="chatBot-question"]', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        $('.chatBot-sand').click();
    }
});

$(document).on('click', '.close-btn', async function () {
    if ($(this).hasClass('close-btn')) {
        $('.chatBot-bg').remove();
    }
});

$(document).on('click', '.chatBot', async function () {
    $('body').append(`
        <div class="chatBot-bg">
            <div class="close-btn">✖</div>
            <div class="chatBot-box">
                <div class="chatBot-title">무엇이든 물어보세요</div>
	            <div class="popup-form-container chatBot-form-container"></div>
	            <div>
	                <input class="chatBot-input" name="chatBot-question"/>
            	    <button type="button" class="chatBot-sand">전송</button>
	            </div>
            </div>
        </div>
    `)
});

function appendChat(text, isUser = false) {
    const className = isUser ? 'myChat' : 'friendChat';
    $('.chatBot-form-container').append(`<div class="${className}">${text}</div>`);
}

function parseQuestion(question) {
    const patterns = [
        /(.+?)이라고 말하면 (.+?)이라고/,
        /(.+?)라고 말하면 (.+?)이라고/,
        /(.+?)이라고 말하면 (.+?)라고/,
        /(.+?)라고 말하면 (.+?)라고/,
        /(.+?) ?: (.+?) Eichi(\d{4})/
    ];

    for (const pattern of patterns) {
        const match = question.match(pattern);
        if (match) return { qText: match[1], aText: match[2], editable: match[3] };
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
    const $input = $('input[name="chatBot-question"]');
    const question = $input.val().trim();
    if (!question) return;

    appendChat(question, true);
    const parsed = parseQuestion(question);

    const directAnswer = await fetchAnswer(question);
    if (directAnswer) {
        appendChat(directAnswer.answer);
    } else if (parsed) {
        const { qText, aText, editable } = parsed;
        const existing = await fetchAnswer(qText);

        if (existing) {
            if (existing.editable === true) {
                appendChat("이 질문은 수정할 수 없어요 🤖");
            } else {
                appendChat(`'${qText}'(이)라는 질문이 수정되었고,<br>'${aText}'(이)라고 다시 대답할게요 😊`);
                await storeAnswer(qText, aText);
            }
        } else {
            appendChat(`'${qText}'(이)라는 질문이 등록되었고,<br>'${aText}'(이)라고 대답할게요 😄`);
            const isEditable = editable === '2514';
            await storeAnswer(qText, aText, isEditable);
        }
    } else {
        appendChat(`아직 그 질문에 대한 답변이 없어요 😅<br>"안녕이라고 말하면 안녕하세요라고 대답해줘"<br>같은 형식으로 등록해 주세요!`);
    }

    $input.val('');
    scrollToBottom();
});