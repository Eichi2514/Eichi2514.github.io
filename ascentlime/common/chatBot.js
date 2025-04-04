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
const chatBots = ref(database, 'chatBots');

$(document).on('keydown', 'input[name="chatBot-input"]', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        $('.chatBot-sand').click();
    }
});

$(document).on('click', '.chatBot', async function () {
    $('body').append(`
        <div class="chatBot-bg">
            <div class="chatBot-box">
                <div class="friend-taps">
                    <button class="friend-tab friend-chat selected-tab">친구</button>
                    <div class="close-btn">✖</div>
                </div>
                <div class="chatBot-container">
	                <div class="popup-form-container chatBot-form-container"></div>
	                <div>
	                    <input class="chatBot-input" name="chatBot-input"/>
            	        <button type="button" class="chatBot-sand">전송</button>
	                </div>
                </div>
            </div>
        </div>
    `)
});