import * as friendGardenService from './friendGardenService.js';
import * as gardenService from './gardenService.js';
import * as memberService from '../member/memberService.js';

import * as utils from '../common/utils.js';
import { plantItems, growthStages, fullyGrown } from './gardenConstants.js';

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
    child
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

const key = localStorage.getItem('nickname') || sessionStorage.getItem('nickname');
const urls = window.location.search;
const safeId = urls ? parseInt(urls.substring(1)) : 0;

if (!key || !safeId) {
    alert(!key ? '로그인이 필요한 서비스입니다.' : '잘못된 경로입니다.');
    window.location.href = '../../ascentlime.html';
}

let memberId = await memberService.loginKeyCheckById(key);

if (memberId === safeId) {
    window.location.href = 'myGarden.html';
}

let userMoney = 0;

async function loadUserData() {
    try {
        userMoney = await memberService.getUserMoney(key) || 0;
        let userMoneyString = await utils.formatNumber(userMoney);
        $('.money_count').text(userMoneyString);

        setInterval(updateTime, 1000);
        loadPlantDate();
        loadFertilizerDate();

    } catch (error) {
        console.error('돈 불러오는 중 오류 발생:', error);
        $('.money_count').text('불러오기 실패');
    }
}

loadUserData();

async function updateTime() {
    const now = new Date();
    const { hours, minutes, seconds } = await utils.formatTime(now);

    gardenService.displayTime($('.current-time'), hours, minutes, seconds)

    const hourAngle = (now.getHours() % 12) * 30 + (now.getMinutes() / 60) * 30;
    const minuteAngle = now.getMinutes() * 6 + (now.getSeconds() / 60) * 6;
    const secondAngle = now.getSeconds() * 6;

    $('.clock-hour').css('transform', `rotate(${hourAngle}deg)`);
    $('.clock-minute').css('transform', `rotate(${minuteAngle}deg)`);
    $('.clock-second').css('transform', `rotate(${secondAngle}deg)`);
}

$(document).on('click', '.close-button', function () {
    $('.popup-bg').remove();
});

const $friendInfo = $('.friend-info');

async function loadPlantDate() {
    try {
        const { completionTime, foundUsers } = await friendGardenService.loadPlantDate(safeId, plantItems);

        if (foundUsers.length > 0) {
            const resultMessage = foundUsers.map(user => `
                <div class="profile-container flex gap-2">
                    <img src="${profileImages[user.profileImageId]}" alt="프로필 이미지">
                    <div class="profile-info">
                        <div class="profile-nickname">${user.nickname}</div>
                        <div class="garden-label">정원</div>
                    </div>
                </div>
            `);
            $friendInfo.html(resultMessage);
        } else {
            $friendInfo.html("검색 결과가 없습니다.");
        }
    } catch (error) {
        console.error("컨트롤러 오류:", error);
    }
}

$(document).on('click', '.steal-button', async function (event) {
    event.preventDefault();
    const button = $(this);
    const id = button.data('id');

    const gardenRef = ref(database, `gardens/${safeId}/${id}`);

    try {
        const snapshot = await get(gardenRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const reward = data.reward;

            if (reward % 3 === 0) {
                const newReward = (reward * 2) / 3;

                await update(gardenRef, { reward: newReward });
                await memberService.updateUserMoney(key, userMoney + reward - newReward);

                alert(`$${reward - newReward}을(를) 획득하였습니다!`);
                location.reload();
            } else {
                alert(`아쉽지만, 이미 다른 사람이 서리해 갔어요! 다음 기회를 노려보세요.`);
            }
        }
    } catch (error) {
        console.error("데이터 가져오기 실패", error);
    }
});

const $fertilizerCount = $('.fertilizer-count');

function loadFertilizerDate() {
    const now = new Date();
    const formattedTime = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

    const fertilizersRef = ref(database, `fertilizers/${memberId}`);
    const todayFertilizerRef = ref(database, `fertilizers/${memberId}/${formattedTime}`);

    get(todayFertilizerRef).then((snapshot) => {
        if (!snapshot.exists()) {
            remove(fertilizersRef)
                .then(() => {
                    console.log(`이전 비료 데이터 삭제 완료!`);
                    return set(todayFertilizerRef, 10);
                })
                .then(() => {
                    console.log(`새로운 비료 데이터 추가 완료! (날짜: ${formattedTime}, 값: 10)`);
                    $fertilizerCount.text('10');
                })
                .catch((error) => {
                    console.error("오류 발생:", error);
                });
        } else {
            console.log(`이미 존재하는 비료 개수: ${snapshot.val()} (날짜: ${formattedTime})`);
            $fertilizerCount.text(`${snapshot.val()}`);
        }
    }).catch((error) => {
        console.error("데이터 조회 실패:", error);
    });
}

$(document).on('click', '.assist-button', async function (event) {
    event.preventDefault();

    const now = new Date();
    const formattedTime = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const todayFertilizerRef = ref(database, `fertilizers/${memberId}/${formattedTime}`);
    const button = $(this);
    const id = button.data('id');
    const gardenRef = ref(database, `gardens/${safeId}/${id}`);

    try {
        const fertilizerSnapshot = await get(todayFertilizerRef);
        if (fertilizerSnapshot.exists()) {
            let currentCount = fertilizerSnapshot.val();

            if (currentCount > 0) {
                await set(todayFertilizerRef, currentCount - 1);
                console.log(`비료 개수 감소: ${currentCount} → ${currentCount - 1}`);
            } else {
                alert('사용 가능한 비료가 없습니다.');
                return;
            }
        } else {
            alert("오늘 사용 가능한 비료가 없습니다.");
            return;
        }
    } catch (error) {
        console.error("비료 개수 감소 실패:", error);
        return;
    }

    $(`.item${id}`).parent().append(`
        <img class="fertilizer-action" src="https://github.com/user-attachments/assets/16357e92-a575-4eae-89f2-fdc46f281b44" alt="비료 뿌리기">
    `);

    try {
        const gardenSnapshot = await get(gardenRef);
        if (gardenSnapshot.exists()) {
            const data = gardenSnapshot.val();
            if (!data.plantId || !plantItems[data.plantId]) {
                console.error("식물 데이터 오류: plantId가 없거나 plantItems에서 찾을 수 없음.");
                return;
            }

            const growthTime = plantItems[data.plantId].growthTime * 1000;
            const plantedAtDate = new Date(Date.now() - growthTime);
            const plantedAtString = plantedAtDate.toLocaleString('sv-SE').replace(' ', 'T');

            await update(gardenRef, {
                plantedAt: plantedAtString
            });

             setTimeout(() => {
                location.reload();
             }, 3000);
        } else {
            console.log("해당 식물 데이터를 찾을 수 없습니다.");
        }
    } catch (error) {
        console.error("식물 데이터 업데이트 실패:", error);
    }
});