const plantItems = {
    "1": {
        "name": "5분",
        "price": 5
    },
    "2": {
        "name": "10분",
        "price": 10
    },
    "3": {
        "name": "30분",
        "price": 30
    },
    "4": {
        "name": "1시간",
        "price": 50
    },
    "5": {
        "name": "3시간",
        "price": 150
    },
    "6": {
        "name": "6시간",
        "price": 300
    },
    "7": {
        "name": "12시간",
        "price": 800
    },
    "8": {
        "name": "1일",
        "price": 1600
    },
    "9": {
        "name": "3일",
        "price": 4500
    }
};

// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    query,
    orderByChild,
    equalTo,
    get
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

const key = localStorage.getItem('nickname');
if (!key) {
    alert('로그인이 필요한 서비스 입니다');
    window.location.href = '../../ascentlime.html';
}

window.getUserMoney = function (key) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));
    return get(queryRef)
        .then((snapshot) => {
            if (!snapshot.exists()) {
                console.log('해당 아이디를 찾을 수 없습니다.');
                return null;
            }

            const memberData = snapshot.val();
            const memberKey = Object.keys(memberData)[0];
            return memberData[memberKey].money;
        })
        .catch((error) => {
            console.error("로그인 아이디 확인 중 오류 발생:", error);
            return null;
        });
};

function formatNumber(number) {
    return number.toLocaleString();
}

window.loginKeyCheckById = async function (key) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));
    try {
        const snapshot = await get(queryRef);
        if (!snapshot.exists()) {
            console.log('loginKeyCheckById) 해당 키가 존재하지 않습니다.');
            return null;
        }

        const memberData = snapshot.val();

        const memberKey = Object.keys(memberData)[0];
        return memberData[memberKey].id;
    } catch (error) {
        console.error("loginKeyCheckById) 해당 키 확인 중 오류 발생:", error);
        return null;
    }
};

let userMoney = 0;

async function loadUserData() {
    try {
        userMoney = await getUserMoney(key) || 0;
        let userMoneyString = formatNumber(userMoney);
        $('.money_count').text(userMoneyString);

        setInterval(updateTime, 1000);

    } catch (error) {
        console.error('돈 불러오는 중 오류 발생:', error);
        $('.money_count').text('불러오기 실패');
    }
}

loadUserData();

function formatTime(now) {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return { hours, minutes, seconds };
}

function updateTime() {
    const now = new Date();
    const { hours, minutes, seconds } = formatTime(now);

    $('.current-time').text(`${hours}:${minutes}:${seconds}`);

    const hourAngle = (now.getHours() % 12) * 30 + (now.getMinutes() / 60) * 30;
    const minuteAngle = now.getMinutes() * 6 + (now.getSeconds() / 60) * 6;
    const secondAngle = now.getSeconds() * 6;

    $('.clock-hour').css('transform', `rotate(${hourAngle}deg)`);
    $('.clock-minute').css('transform', `rotate(${minuteAngle}deg)`);
    $('.clock-second').css('transform', `rotate(${secondAngle}deg)`);
}

$('.buy-button').click(async function (event) {
    const button = $(this);
    const id = button.data('id');

    $('.body').append(`
    <div class="popup-bg buy-bg">
        <form class="buy-form" method="POST">
            <div class="popup-box">
                <div class="popup-title">씨앗 상점</div>
                <div class="close-button">✖</div>
                <div class="popup-form-container">
                    <button class="plant-buy-button" data-id="${id}-1">
                        <img src="https://github.com/user-attachments/assets/2990b137-d228-4d76-b384-d903880392cd" alt="씨앗(5분)">
                        <span>$5</span>
                    </button>
                    <button class="plant-buy-button" data-id="${id}-2">
                        <img src="https://github.com/user-attachments/assets/2990b137-d228-4d76-b384-d903880392cd" alt="씨앗(10분)">
                        <span>$10</span>
                    </button>
                    <button class="plant-buy-button" data-id="${id}-3">
                        <img src="https://github.com/user-attachments/assets/2990b137-d228-4d76-b384-d903880392cd" alt="씨앗(30분)">
                        <span>$30</span>
                    </button>
                    <button class="plant-buy-button" data-id="${id}-4">
                        <img src="https://github.com/user-attachments/assets/2990b137-d228-4d76-b384-d903880392cd" alt="씨앗(1시간)">
                        <span>$50</span>
                    </button>
                    <button class="plant-buy-button" data-id="${id}-5">
                        <img src="https://github.com/user-attachments/assets/2990b137-d228-4d76-b384-d903880392cd" alt="씨앗(3시간)">
                        <span>$150</span>
                    </button>
                    <button class="plant-buy-button" data-id="${id}-6">
                        <img src="https://github.com/user-attachments/assets/2990b137-d228-4d76-b384-d903880392cd" alt="씨앗(6시간)">
                        <span>$300</span>
                    </button>
                    <button class="plant-buy-button" data-id="${id}-7">
                        <img src="https://github.com/user-attachments/assets/2990b137-d228-4d76-b384-d903880392cd" alt="씨앗(12시간)">
                        <span>$800</span>
                    </button>
                    <button class="plant-buy-button" data-id="${id}-8">
                        <img src="https://github.com/user-attachments/assets/2990b137-d228-4d76-b384-d903880392cd" alt="씨앗(1일)">
                        <span>$1600</span>
                    </button>
                    <button class="plant-buy-button" data-id="${id}-9">
                        <img src="https://github.com/user-attachments/assets/2990b137-d228-4d76-b384-d903880392cd" alt="씨앗(3일)">
                        <span>$4500</span>
                    </button>
                </div>
            </div>
        </form>
    </div>
    `);

    $('.close-button').click(function () {
        $('.popup-bg').remove();
    });

    $('.plant-buy-button').click(function (event) {
        event.preventDefault();
        const button = $(this);
        const id = button.data('id');

        const [locationId, selectedId] = id.split('-');

        let isConfirm = confirm(`${plantItems[selectedId].name}(을)를 구매하시겠습니까?`)
        if (!isConfirm) return;

        alert(`Location ID : ${locationId}, Selected ID : ${selectedId}`);
    });
});