const growthStages = [
    'https://github.com/user-attachments/assets/96f61b3a-6413-434c-b756-668eb1d53617',
    'https://github.com/user-attachments/assets/68170f34-d4bf-40f7-abcd-97a6fb5cc4dc',
    'https://github.com/user-attachments/assets/7cbac15a-1b76-4fa8-92b2-fbe33dba9fe2',
    'https://github.com/user-attachments/assets/3e11e472-a3e5-4ff7-aa8d-6ac53f8e8aec',
    'https://github.com/user-attachments/assets/215a354a-b3f9-45be-b1d4-81665445898a',
    'https://github.com/user-attachments/assets/7aa4ac5a-5219-4831-8c99-050e65647261',
    'https://github.com/user-attachments/assets/f007d51f-f7be-4707-b459-25c5bc5f651e',
    'https://github.com/user-attachments/assets/8f2dfff2-2a94-4da8-890e-f33c23b8d374',
    'https://github.com/user-attachments/assets/d7d40f1f-3a62-4af2-abbf-fb7eba85696c',
    'https://github.com/user-attachments/assets/513b7bf0-0aab-4a15-be8e-30de1472514d'
];

const fullyGrown = [
    'https://github.com/user-attachments/assets/9361cc45-f251-4f92-99c2-c4fdd69a2970',
    'https://github.com/user-attachments/assets/fac93404-41d6-4d9e-bfaa-8cfe788d7149',
    'https://github.com/user-attachments/assets/50aa82dc-099a-47e5-8089-8df3af968ad2',
    'https://github.com/user-attachments/assets/4b01953e-81a2-4a8d-8606-a75e5eef8919',
    'https://github.com/user-attachments/assets/09be19ad-3fd4-4179-b575-f34000965c54',
    'https://github.com/user-attachments/assets/c70737bb-ad9a-4edf-9f9c-fe8b7b1bae33',
    'https://github.com/user-attachments/assets/21e3d1bb-e03d-4780-b0b7-4ef9d5354109',
    'https://github.com/user-attachments/assets/e78bd9d2-cc77-4e97-abce-7bf33d5fba81',
    'https://github.com/user-attachments/assets/973f70d5-ebab-4f8b-94d7-55e826035e1a',
    'https://github.com/user-attachments/assets/bc64edff-7900-471b-9f03-31076e666053'
];

const plantItems = {
    "1": {
        "name": "씨앗 (5분)",
        "price": 5,
        "growthTime": 300
    },
    "2": {
        "name": "꽃망울 (10분)",
        "price": 10,
        "growthTime": 600
    },
    "3": {
        "name": "플라워 (30분)",
        "price": 30,
        "growthTime": 1800
    },
    "4": {
        "name": "새싹 (1시간)",
        "price": 50,
        "growthTime": 3600
    },
    "5": {
        "name": "풍성한 새싹 (3시간)",
        "price": 150,
        "growthTime": 10800
    },
    "6": {
        "name": "묘목 (6시간)",
        "price": 300,
        "growthTime": 21600
    },
    "7": {
        "name": "가지나무 (12시간)",
        "price": 800,
        "growthTime": 43200
    },
    "8": {
        "name": "돈나무 (1일)",
        "price": 1600,
        "growthTime": 86400
    },
    "9": {
        "name": "풍성한 돈나무 (3일)",
        "price": 4500,
        "growthTime": 259200
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

const key = localStorage.getItem('nickname');
const urls = window.location.search;
const safeId = urls ? parseInt(urls.substring(1)) : 0;

if (!key || !safeId) {
    alert(!key ? '로그인이 필요한 서비스입니다.' : '잘못된 경로입니다.');
    window.location.href = '../../ascentlime.html';
}

window.loginKeyCheckById = async function () {
    const loginKeyCheckByIdKey = localStorage.getItem('nickname');

    if (!loginKeyCheckByIdKey) return;

    const queryRef = query(membersRef, orderByChild("key"), equalTo(loginKeyCheckByIdKey));
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

let memberId = await loginKeyCheckById();

if (memberId === safeId) {
    window.location.href = 'myGarden.html';
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

let userMoney = 0;

async function loadUserData() {
    try {
        userMoney = await getUserMoney(key) || 0;
        let userMoneyString = formatNumber(userMoney);
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

function formatTime(now) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return { year, month, day, hours, minutes, seconds };
}

function displayTime($element, hours, minutes, seconds) {
    $element.text(`${hours}:${minutes}:${seconds}`);
}

function updateTime() {
    const now = new Date();
    const { hours, minutes, seconds } = formatTime(now);

    displayTime($('.current-time'), hours, minutes, seconds)

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

function calculateTime(plantedAt, growthTime) {
    const now = new Date();
    const completionTime = plantedAt.getTime() + growthTime;
    const timeRemaining = completionTime - now.getTime();

    return timeRemaining;
}

const $friendInfo = $('.friend-info');

async function loadPlantDate() {
    let completionTime = 0;
    let plantExists = 0;

    $('.plant-section .plant-slot').each(function(index) {
        const gardenRef = ref(database, `gardens/${safeId}/${index+1}`);

        const promise = get(gardenRef).then(snapshot => {
            if (snapshot.exists()) {
                plantExists = 1;
                const plantData = snapshot.val();
                const plantedAt = new Date(plantData.plantedAt);
                const growthTime = plantItems[plantData.plantId].growthTime * 1000;
                const newCompletionTime = plantedAt.getTime() + growthTime;

                if (completionTime < newCompletionTime) {
                    completionTime = newCompletionTime;
                }

                updatePlant(this, index + 1, snapshot.val());

            }
        }).catch(error => {
            console.error('Error fetching data:', error);
        });
    });

        try {
            const snapshot = await get(membersRef);
            if (snapshot.exists()) {
                let foundUsers = [];

                snapshot.forEach(childSnapshot => {
                    const memberId = childSnapshot.val().id;
                    if (memberId && memberId === safeId) {
                        foundUsers.push({
                            profileImageId: childSnapshot.val().profileImageId,
                            nickname: childSnapshot.val().nickname,
                            id: childSnapshot.val().id
                        });
                    }
                });

                if (foundUsers.length > 0) {
                    let resultMessage = foundUsers.map(user => `
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
            }
        } catch (error) {
            console.error("데이터 검색 오류:", error);
        }
}

function updatePlant(plantSlot, index, plantData) {
    const plantedAt = new Date(plantData.plantedAt);
    const growthTime = plantItems[plantData.plantId].growthTime * 1000;

    const timeRemaining = calculateTime(plantedAt, growthTime);

    if (timeRemaining > 0) {
        const elapsedTime = new Date().getTime() - plantedAt.getTime();
        const growthStagesId = updateGrowthStage(elapsedTime);

        $(plantSlot).html(`
            <img class="plant-img item${index}" src="${growthStages[growthStagesId]}" alt="Plant Stage ${index}">
            <span class="plant-name none">${plantItems[plantData.plantId].name}</span>
            <button class="s-button none assist-button" data-id="${index}">도움</button>
        `);
    } else {
        updateFullyGrown(plantSlot, timeRemaining, plantData, index);
    }
}

async function updateFullyGrown(plantSlot, timeRemaining, plantData, index) {
    if (-86400000 < timeRemaining && timeRemaining <= 0) {
        const gardenRef = ref(database, `gardens/${safeId}/${index}`);

        try {
            const snapshot = await get(gardenRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                const reward = data.reward;

                if (reward % 3 === 0) {
                    $(plantSlot).html(`
                        <img class="plant-img item${index}" src="${fullyGrown[plantData.plantId]}" alt="Plant Stage ${index}">
                        <span class="plant-name none">${plantItems[plantData.plantId].name}</span>
                        <button class="s-button none steal-button" data-id="${index}">서리</button>
                    `);
                } else {
                    $(plantSlot).html(`
                        <img class="plant-img item${index}" src="${fullyGrown[plantData.plantId]}" alt="Plant Stage ${index}">
                        <span class="plant-name none">${plantItems[plantData.plantId].name}</span>
                    `);
                }
            }
        } catch (error) {
            console.error("데이터 가져오기 실패", error);
        }
    } else if (timeRemaining <= -86400000) {
        $(plantSlot).html(`
            <img class="plant-img item${index}" src="${fullyGrown[0]}" alt="Plant Stage ${index}">
            <span class="plant-name none">${plantItems[plantData.plantId].name}</span>
        `);
    }
}

window.updateUserMoney = async function (memberKey, newMoney) {
    try {
        const queryRef = query(membersRef, orderByChild("key"), equalTo(memberKey));
        const snapshot = await get(queryRef);

        if (snapshot.exists()) {
            const key = Object.keys(snapshot.val())[0];
            const data = snapshot.val()[key];

            if (data) {
                const updatedData = {
                    ...data,
                    money: newMoney,
                };

                await update(ref(database, `members/${key}`), updatedData);
            }
        }
    } catch (error) {
        console.error("금액 업데이트 실패:", error);
        throw error;
    }
};

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
                await updateUserMoney(key, userMoney + reward - newReward);

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

function updateGrowthStage(elapsedTime) {
    const elapsedSeconds = Math.floor(elapsedTime / 1000);
    const growthStagesDurations = [300, 600, 1800, 3600, 10800, 21600, 43200, 86400, 259200];
    return growthStagesDurations.findIndex(time => elapsedSeconds < time) !== -1
        ? growthStagesDurations.findIndex(time => elapsedSeconds < time)
        : growthStagesDurations.length;
}

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

