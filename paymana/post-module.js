// Firebase 관련 라이브러리 임포트
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    get,
    remove
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

const $popupBg = $('.popup-bg');

$('.close-button').click(function () {
    $popupBg.removeClass('flex').addClass('hidden');
});

function generateCodes(num) {
    const chars = '0123456789';
    let code = 'PM';
    for (let i = 0; i < num; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

$('.export-button').click(async function () {
    let isConfirm = confirm('내보내기를 진행하시겠습니까?')

    if (!isConfirm) return;

    const urls = window.location.search;
    const postId = urls ? parseInt(urls.substring(1)) : 0;
    const decompressedData = LZString.decompressFromUTF16(localStorage.getItem(`PM-${postId}`));
    const post = decompressedData ? JSON.parse(decompressedData) : {};

    let generateCode = generateCodes(6);
    let postRef = ref(database, 'paymana/' + generateCode);

    let snapshot;
    do {
        snapshot = await get(postRef);
        if (snapshot.exists()) {
            console.log("이미 존재하는 코드입니다. 새로운 코드를 생성합니다.");
            generateCode = generateCodes(6);
            postRef = ref(database, 'paymana/' + generateCode);
        }
    } while (snapshot.exists());

    set(postRef, post)
        .then(() => {
            $('.code').text(generateCode.substring(2));
            $popupBg.removeClass('hidden').addClass('flex');
            console.log("데이터가 성공적으로 저장되었습니다.");
        })
        .catch((error) => {
            console.error("데이터 저장 실패: ", error);
            alert("데이터 전송에 실패했습니다 다시 시도해주세요.");
        });
});

$('.popup2-form').submit(async function (event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 막음

    const $codeInput = $('input[name="code"]');
    const code = $codeInput.val().trim();

    if (!code) {
        alert('코드를 입력해주세요.');
        return;
    }

    let postId = 1;

    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('PM-')) {
            const match = key.match(/\d+/);
            const num = match ? parseInt(match[0], 10) : NaN;
            if (!isNaN(num) && num >= postId) {
                postId = num + 1;
            }
        }
    });

    let postRef = ref(database, 'paymana/' + `PM${code}`);

    const snapshot = await get(postRef);
    if (!snapshot.exists()) {
        alert('입력하신 코드가 잘못되었습니다. 다시 확인해주세요.');
        return;
    }

    const compressedData = LZString.compressToUTF16(JSON.stringify(snapshot));
    localStorage.setItem(`PM-${postId}`, compressedData);

    await remove(postRef);

    window.location.href = `../paymana/post?${postId}`;
});