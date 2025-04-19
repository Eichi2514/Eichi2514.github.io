const productStatItems = {
    "s1": {
        "img": "https://github.com/user-attachments/assets/c8fa776d-4542-4ff9-a720-3def28066354",
        "name": "힘 10 증가",
        "price": 200
    },
    "s2": {
        "img": "https://github.com/user-attachments/assets/d2325c86-7fa2-4c39-a105-8b51c3a8d496",
        "name": "힘 20 증가",
        "price": 380
    },
    "s3": {
        "img": "https://github.com/user-attachments/assets/3529dc2b-8a3d-478c-9bcf-078736ee5b0b",
        "name": "힘 50 증가",
        "price": 900
    },
    "s4": {
        "img": "https://github.com/user-attachments/assets/1bff301c-0adb-4109-94fa-6eff7be8ef66",
        "name": "힘 80 증가",
        "price": 1360
    },
    "s5": {
        "img": "https://github.com/user-attachments/assets/3a61e399-7e23-4a81-9a85-fa0bfc5fb1bb",
        "name": "힘 100 증가",
        "price": 1600
    },
    "s6": {
        "img": "https://github.com/user-attachments/assets/140b3b12-d14b-4168-9e8c-c2a652f25704",
        "name": "체력 10 회복",
        "price": 200
    },
    "s7": {
        "img": "https://github.com/user-attachments/assets/b3795aa4-bbfc-4658-bd19-02eacafa7020",
        "name": "체력 20 회복",
        "price": 380
    },
    "s8": {
        "img": "https://github.com/user-attachments/assets/a992c00d-36ef-4cde-a602-8ff5af49d73b",
        "name": "체력 50 회복",
        "price": 900
    },
    "s9": {
        "img": "https://github.com/user-attachments/assets/1289412b-5507-4f13-a9a4-9809a3d979ff",
        "name": "체력 80 회복",
        "price": 1360
    },
    "s10": {
        "img": "https://github.com/user-attachments/assets/0a978402-9dd5-4280-8d95-ac0f57193ac6",
        "name": "체력 100 회복",
        "price": 1600
    },
    "s11": {
        "img": "https://github.com/user-attachments/assets/274f7067-2d2b-4ec3-96c4-c8ee9149cea7",
        "name": "속도 10 증가",
        "price": 1000
    }
};

const productWeaponItems = {
    "w1": {
        "img": "https://github.com/user-attachments/assets/98a45b38-4cb3-4ee4-b8f7-28205ff39cb6",
        "name": "톡신 오브",
        "price": 10
    },
    "w2": {
        "img": "https://github.com/user-attachments/assets/ca527de8-3ca6-44bb-9845-625e9f30ab89",
        "name": "디케이 큐브",
        "price": 20
    },
    "w3": {
        "img": "https://github.com/user-attachments/assets/91200c6c-bd4d-44eb-98df-96a7af967552",
        "name": "베놈 랜스",
        "price": 30
    },
    "w4": {
        "img": "https://github.com/user-attachments/assets/7403b724-19d1-49bf-9781-f97ac6936d68",
        "name": "포이즌 스타",
        "price": 40
    },
    "w5": {
        "img": "https://github.com/user-attachments/assets/eafa86a5-ff3c-4a3d-86e9-8f485c4905e1",
        "name": "플라그 애로우",
        "price": 50
    },
    "w6": {
        "img": "https://github.com/user-attachments/assets/fd1692a4-c906-4f24-b47d-1e2ac54fed56",
        "name": "코러시브 빔",
        "price": 60
    },
    "w7": {
        "img": "https://github.com/user-attachments/assets/f4621a93-e6db-4003-9e49-02fe7543491f",
        "name": "테트라 팽",
        "price": 70
    },
    "w8": {
        "img": "https://github.com/user-attachments/assets/027a11ed-96fa-4587-9b7f-c3efde0e40b1",
        "name": "블라이트 봄버맨",
        "price": 80
    },
    "w9": {
        "img": "https://github.com/user-attachments/assets/f531f906-2147-45b5-8af9-e0877201552c",
        "name": "퍼시드 스매셔",
        "price": 90
    },
    "w10": {
        "img": "https://github.com/user-attachments/assets/dcc3fdaa-fa09-42a9-a929-3e7904925b41",
        "name": "제노시스 블레이드",
        "price": 100
    },
    "w11": {
        "img": "https://github.com/user-attachments/assets/330ad6aa-ead1-485b-900e-dea99d69abbc",
        "name": "어비스 오브",
        "price": 210
    },
    "w12": {
        "img": "https://github.com/user-attachments/assets/4ba220d2-1c7f-4f84-bb1e-bc5eb8b4f531",
        "name": "크립틱 큐브",
        "price": 220
    },
    "w13": {
        "img": "https://github.com/user-attachments/assets/791c3025-5ee3-4528-8cc2-8bbe8daf4bc0",
        "name": "나이트 랜스",
        "price": 230
    },
    "w14": {
        "img": "https://github.com/user-attachments/assets/1dd703a6-d7be-48ad-8eec-11960337c59c",
        "name": "쉐이드 스타",
        "price": 240
    },
    "w15": {
        "img": "https://github.com/user-attachments/assets/87660691-5b05-427a-9471-94af0105d66d",
        "name": "팬텀 애로우",
        "price": 250
    },
    "w16": {
        "img": "https://github.com/user-attachments/assets/c1776b21-dae8-4890-a91c-c93198a28d2a",
        "name": "루나 빔",
        "price": 260
    },
    "w17": {
        "img": "https://github.com/user-attachments/assets/03def50a-b4a8-4ccc-80de-e9f570d03dc5",
        "name": "섀도우 팽",
        "price": 270
    },
    "w18": {
        "img": "https://github.com/user-attachments/assets/2ac29faa-dba5-46b1-9a15-665ce62596ba",
        "name": "나이트폴 봄버맨",
        "price": 280
    },
    "w19": {
        "img": "https://github.com/user-attachments/assets/3e3ebf0f-e700-4a6f-91f5-ffbf9f16d69f",
        "name": "스펙터 스매셔",
        "price": 290
    },
    "w20": {
        "img": "https://github.com/user-attachments/assets/383a1c05-7a15-4974-8842-a4f0d3f3b747",
        "name": "루나틱 블레이드",
        "price": 300
    },
    "w21": {
        "img": "https://github.com/user-attachments/assets/34b8096b-643c-4323-adb9-384198f35a05",
        "name": "스톰 오브",
        "price": 510
    },
    "w22": {
        "img": "https://github.com/user-attachments/assets/e745c414-919e-45a0-8ee8-b6708c677c97",
        "name": "타이달 큐브",
        "price": 520
    },
    "w23": {
        "img": "https://github.com/user-attachments/assets/98c2a891-0148-4b10-8ce8-1509fecdb511",
        "name": "블리자드 랜스",
        "price": 530
    },
    "w24": {
        "img": "https://github.com/user-attachments/assets/417ceca3-7c5a-4b46-b7ba-597320a7280b",
        "name": "스카이 스타",
        "price": 540
    },
    "w25": {
        "img": "https://github.com/user-attachments/assets/076ae1bc-5a66-4db3-be82-6f22e0b52155",
        "name": "제피르 애로우",
        "price": 550
    },
    "w26": {
        "img": "https://github.com/user-attachments/assets/c5b27034-7754-4a7c-b212-67bb919e60c1",
        "name": "볼텍스 빔",
        "price": 560
    },
    "w27": {
        "img": "https://github.com/user-attachments/assets/6e8c1158-10dd-4769-8d3f-27d0df7e1ac6",
        "name": "게일 팽",
        "price": 570
    },
    "w28": {
        "img": "https://github.com/user-attachments/assets/7cd68d64-55c6-4da3-98d6-ec641e4d139b",
        "name": "프로스트 봄버맨",
        "price": 580
    },
    "w29": {
        "img": "https://github.com/user-attachments/assets/7b8523d2-e443-44fc-9f79-dbebcf385b29",
        "name": "스카이 스매셔",
        "price": 590
    },
    "w30": {
        "img": "https://github.com/user-attachments/assets/2ea0d667-6c8b-42c2-9eac-435e19422256",
        "name": "글레이셔 블레이드",
        "price": 600
    },
    "w31": {
        "img": "https://github.com/user-attachments/assets/a114d57e-9995-4036-93be-e73087b93dee",
        "name": "포레스트 오브",
        "price": 910
    },
    "w32": {
        "img": "https://github.com/user-attachments/assets/fefa8e4d-6ce4-4258-9988-c6bee58defa6",
        "name": "베르던트 큐브",
        "price": 920
    },
    "w33": {
        "img": "https://github.com/user-attachments/assets/44fc98a6-87f8-4444-b6af-6fb31c513ed9",
        "name": "가이아 랜스",
        "price": 930
    },
    "w34": {
        "img": "https://github.com/user-attachments/assets/2de1f608-83ba-42ad-b0b1-8ac51dea567a",
        "name": "실피드 스타",
        "price": 940
    },
    "w35": {
        "img": "https://github.com/user-attachments/assets/a8369e91-a67f-44f0-9c4a-ef8fbb8cfe2a",
        "name": "바인 애로우",
        "price": 950
    },
    "w36": {
        "img": "https://github.com/user-attachments/assets/388af076-05e8-452f-a501-a56f64c992c9",
        "name": "테라 빔",
        "price": 960
    },
    "w37": {
        "img": "https://github.com/user-attachments/assets/96270c25-7a7b-4086-ac06-5634555b70ef",
        "name": "와일드 팽",
        "price": 970
    },
    "w38": {
        "img": "https://github.com/user-attachments/assets/89cf8667-6f45-440e-aa48-de352197809f",
        "name": "가이아 봄버맨",
        "price": 980
    },
    "w39": {
        "img": "https://github.com/user-attachments/assets/87a96719-bbac-410c-8a33-d7f67d39a2a2",
        "name": "네이처 스매셔",
        "price": 990
    },
    "w40": {
        "img": "https://github.com/user-attachments/assets/4c81b6d8-1ab6-41e3-99e8-e289eb7510de",
        "name": "스피릿 블레이드",
        "price": 1000
    },
    "w41": {
        "img": "https://github.com/user-attachments/assets/a08e3986-994d-4449-adb1-10e575714188",
        "name": "라이트닝 오브",
        "price": 1510
    },
    "w42": {
        "img": "https://github.com/user-attachments/assets/e8f0f8ed-0d14-4bed-8f14-d58a6ce6c537",
        "name": "볼태틱 큐브",
        "price": 1520
    },
    "w43": {
        "img": "https://github.com/user-attachments/assets/5f99f1a8-cce0-43f4-9bd0-b01aff7ed337",
        "name": "스파크 랜스",
        "price": 1530
    },
    "w44": {
        "img": "https://github.com/user-attachments/assets/b007b848-66f2-404f-9452-e4ca17e4ebf2",
        "name": "라디언트 스타",
        "price": 1540
    },
    "w45": {
        "img": "https://github.com/user-attachments/assets/c6d3d271-dc7c-4cc1-908b-1960ece2ed80",
        "name": "플래시 애로우",
        "price": 1550
    },
    "w46": {
        "img": "https://github.com/user-attachments/assets/157e3ef6-ca2b-47f8-96ba-4a4451534fec",
        "name": "라디언트 빔",
        "price": 1560
    },
    "w47": {
        "img": "https://github.com/user-attachments/assets/40a08051-7223-4472-ab42-42bdbfeca35c",
        "name": "썬더 팽",
        "price": 1570
    },
    "w48": {
        "img": "https://github.com/user-attachments/assets/62dedd0e-9806-4fca-a7fb-d06fea28d1c4",
        "name": "템페스트 봄버맨",
        "price": 1580
    },
    "w49": {
        "img": "https://github.com/user-attachments/assets/d3e44839-8d46-4c0f-9e26-169bab080fdd",
        "name": "디바인 스매셔",
        "price": 1590
    },
    "w50": {
        "img": "https://github.com/user-attachments/assets/1afae587-dff3-42dd-a663-6730f5766187",
        "name": "플라즈마 블레이드",
        "price": 1600
    },
    "w51": {
        "img": "https://github.com/user-attachments/assets/2e6e4dc2-3b84-4521-b9c1-7eb469d8d861",
        "name": "서지 오브",
        "price": 2610
    },
    "w52": {
        "img": "https://github.com/user-attachments/assets/44dc4242-4cc1-4bd9-bf1d-501625f79981",
        "name": "라디언트 큐브",
        "price": 2620
    },
    "w53": {
        "img": "https://github.com/user-attachments/assets/e0cd5573-f9ae-4a94-98b8-933b0317f6cd",
        "name": "블레이즈 랜스",
        "price": 2630
    },
    "w54": {
        "img": "https://github.com/user-attachments/assets/221e2115-c9fe-4777-90de-b690b272268b",
        "name": "썬셋 스타",
        "price": 2640
    },
    "w55": {
        "img": "https://github.com/user-attachments/assets/90731980-1fc7-49cb-8a99-f103082727ac",
        "name": "플레어 애로우",
        "price": 2650
    },
    "w56": {
        "img": "https://github.com/user-attachments/assets/74c267ea-fa2f-494b-923e-fd8728e7346c",
        "name": "솔라 빔",
        "price": 2660
    },
    "w57": {
        "img": "https://github.com/user-attachments/assets/e3ac88c9-4c23-4f76-8a66-4780e32afcf7",
        "name": "폭풍 팽",
        "price": 2670
    },
    "w58": {
        "img": "https://github.com/user-attachments/assets/47452f52-d6f9-4561-b984-59bf1abc6b0a",
        "name": "썬더 봄버맨",
        "price": 2680
    },
    "w59": {
        "img": "https://github.com/user-attachments/assets/6435b887-2b87-4367-a088-28e13d0a9b59",
        "name": "파워 스매셔",
        "price": 2690
    },
    "w60": {
        "img": "https://github.com/user-attachments/assets/fceed0f8-5b68-4263-b9f2-63d9dcb9eaa8",
        "name": "에너제틱 블레이드",
        "price": 2700
    },
    "w61": {
        "img": "https://github.com/user-attachments/assets/d3b5fb90-b21e-42a3-8964-a866132ace38",
        "name": "파이어 오브",
        "price": 4710
    },
    "w62": {
        "img": "https://github.com/user-attachments/assets/a75eb20d-7588-42c0-b517-c5cfa38293a1",
        "name": "인페르노 큐브",
        "price": 4720
    },
    "w63": {
        "img": "https://github.com/user-attachments/assets/bab07e9b-6bcc-4cc6-9782-d2e5491ed42e",
        "name": "헬파이어 랜스",
        "price": 4730
    },
    "w64": {
        "img": "https://github.com/user-attachments/assets/351cb011-e0d8-4b97-ade0-e591aecd63f2",
        "name": "플레임 스타",
        "price": 4740
    },
    "w65": {
        "img": "https://github.com/user-attachments/assets/df28a7ef-027e-4b9c-9dfe-5333945f79b4",
        "name": "피닉스 애로우",
        "price": 4750
    },
    "w66": {
        "img": "https://github.com/user-attachments/assets/402dde9c-aeba-4543-a5a2-77d95ec25bba",
        "name": "블러드 빔",
        "price": 4760
    },
    "w67": {
        "img": "https://github.com/user-attachments/assets/c9258612-c30a-4e6b-8f43-d63518485e72",
        "name": "크림슨 팽",
        "price": 4770
    },
    "w68": {
        "img": "https://github.com/user-attachments/assets/33899c93-1223-4e71-9113-7d7702c20b03",
        "name": "블레이즈 봄버맨",
        "price": 4780
    },
    "w69": {
        "img": "https://github.com/user-attachments/assets/ead726f4-fa9f-4fd8-935a-0c665b173069",
        "name": "파이로 스매셔",
        "price": 4790
    },
    "w70": {
        "img": "https://github.com/user-attachments/assets/a6dcabfb-34c7-41bc-ad0e-94228de15519",
        "name": "인페르노 블레이드",
        "price": 4800
    }
};

const productCashItems = {
    "c1": {
        "img": "https://github.com/user-attachments/assets/58999c47-910e-4eea-8fc0-9c2cf3a1ca3f",
        "name": "닉네임 변경권",
        "price": 1000
    },
    "c2": {
        "img": "https://github.com/user-attachments/assets/25b5197e-0ab4-4fb5-9d11-644a7e46d954",
        "name": "초보 등반자 (여)",
        "price": 1000
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
    child,
    update
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
const weaponFindRef = ref(database, 'weaponFind');

const key = localStorage.getItem('nickname') || sessionStorage.getItem('nickname');
if (!key) {
    alert('로그인이 필요한 서비스 입니다');
    window.location.href = '../../ascentlime.html';
}

window.getUserAssets = function (key) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));
    return get(queryRef)
        .then((snapshot) => {
            if (!snapshot.exists()) {
                console.log('해당 아이디를 찾을 수 없습니다.');
                return null;
            }

            const memberData = snapshot.val();
            const memberKey = Object.keys(memberData)[0];
            const data = memberData[memberKey];

            return {
                money: data.money || 0,
                cash: data.cash || 0,
            };
        })
        .catch((error) => {
            console.error("유저 재화 확인 중 오류 발생:", error);
            return null;
        });
};

/*
function convertNumberFormat(value) {
    const units = {K: 1_000, M: 1_000_000, B: 1_000_000_000};

    if (typeof value === 'string') {
        const unit = value.slice(-1);
        if (units[unit]) {
            return parseFloat(value.replace(unit, '')) * units[unit];
        }
    }

    if (typeof value === 'number') {
        for (let [unit, threshold] of Object.entries(units).reverse()) {
            if (value >= threshold) {
                return (Math.floor(value / threshold * 10) / 10) + unit;
            }
        }
    }

    return value;
}
*/

function formatNumber(number) {
    return number.toLocaleString();
}

const urls = window.location.search;

const shopTap = urls ? parseInt(new URLSearchParams(urls).get('tap'), 10) || 0 : 0;
const page = urls ? parseInt(new URLSearchParams(urls).get('page'), 10) || 1 : 1;

// console.log(`shopTap : ${shopTap}, page : ${page}`);

$(`.tab-${shopTap}`).css('z-index', 1);

window.loginKeyCheckById = async function () {
    const loginKeyCheckByIdKey = localStorage.getItem('nickname') || sessionStorage.getItem('nickname');

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

window.getWeaponFind = async function (memberKey) {
    const memberId = await loginKeyCheckById();
    const safeId = memberId.toString();
    const newWeaponFindRef = child(weaponFindRef, safeId);

    try {
        const snapshot = await get(newWeaponFindRef);
        if (!snapshot.exists()) return;

        const weaponData = snapshot.val();

        let newProductWeaponItems = {}; // 객체로 초기화

        Object.keys(weaponData).forEach((key) => {
            newProductWeaponItems[`w${key}`] = productWeaponItems[`w${key}`];
        });

        return newProductWeaponItems;

    } catch (error) {
        console.error("무기 데이터를 가져오는 중 오류 발생:", error);
    }
};

let userMoney = 0;
let userCash = 0;
const unknownItems = 'https://github.com/user-attachments/assets/34628dee-0e58-4d89-a510-13ebb9a2dcae';

async function displayShopItems() {
    let itemsToDisplay = [];

    try {
        const userAssets = await getUserAssets(key);
        userMoney = userAssets.money;
        userCash = userAssets.cash;

        let userCashString = formatNumber(userAssets.cash);
        let userMoneyString = formatNumber(userAssets.money);

        $('.cash_count').text(userCashString);
        $('.money_count').text(userMoneyString);

    } catch (error) {
        console.error('돈 불러오는 중 오류 발생:', error);
        $('.cash_count').text('불러오기 실패');
        $('.money_count').text('불러오기 실패');
    }

    const createProductItem = (product, itemKey, price) => `
        <div class="product-item">
            <img src="${product.img || unknownItems}" alt="상품 이미지" class="product-image"/>
            
            <div class="product-details">
                <div class="product-name">${product.name || '미확인 아이템'}</div>
                <div class="product-purchase">
                    ${product.name ? `
                    <span class="product-price">${price}</span>
                    <button class="s-button buy-button" data-id="${itemKey}">구매</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    const renderItems = (productItems, isStat, prefix, length = Object.keys(productItems).length) => {
        for (let i = 1; i <= length; i++) {
            const itemKey = prefix ? `${prefix}${i}` : `c${i}`;
            const product = productItems[itemKey] || {};
            const price = isStat ? `$ ${formatNumber(product.price || 0)}` : `${formatNumber(product.price || 0)}원`;
            itemsToDisplay.push(createProductItem(product, itemKey, price));
        }
    };

    if (shopTap === 1 || shopTap === 0) {
        renderItems(productStatItems, true, 's');
    }
    if (shopTap === 2 || shopTap === 0) {
        const newProductWeaponItems = await getWeaponFind(key);
        if (newProductWeaponItems) {
            renderItems(newProductWeaponItems, true, 'w', Object.keys(productWeaponItems).length);
        }
    }
    if (shopTap === 3 || shopTap === 0) {
        renderItems(productCashItems, false, 'c');
    }

    itemsToDisplay.slice((page - 1) * 15, page * 15).forEach(item => $('.shop-container').append(item));
    await updatePagination(itemsToDisplay.length);
}

displayShopItems();

$(document).on('click', '.buy-button', async function () {
    const button = $(this);
    button.prop('disabled', true).text('구매 중...');

    const id = button.data('id');

    let success = false;

    try {
        if (id.startsWith('s')) {
            if (userMoney < productStatItems[id].price) {
                alert(`재화가 부족합니다.`);
            } else {
                await applyStatItem(key, id);
                success = true;
            }
        } else if (id.startsWith('w')) {
            if (userMoney < productWeaponItems[id].price) {
                alert(`재화가 부족합니다.`);
            } else {
                await equipWeaponItem(key, id);
                success = true;
            }
        } else if (id.startsWith('c')) {
            alert('현재 구매가 불가능한 상품입니다.');
        }
    } catch (error) {
        button.prop('disabled', false).text('구매');
        console.error('구매 처리 실패:', error);
        return;
    }

    if (success) {
        const productName = id.startsWith('s')
            ? productStatItems[id].name
            : productWeaponItems[id].name;

        alert(`${productName}을(를) 구매하셨습니다!`);
        location.reload();
    }
});

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


window.applyStatItem = async function (memberKey, id) {
    const memberId = await loginKeyCheckById();
    const safeId = memberId.toString();
    const characRef = ref(database, `characs/${safeId}`);

    let newId = parseInt(id.replace('s', ''), 10);
    const characSnapshot = await get(characRef);
    const characData = characSnapshot.val();
    const originalCharacData = JSON.parse(JSON.stringify(characData));

    const updateHp = async (hpIncrease) => {
        if (characData.hp >= 1000) {
            throw new Error('현재 체력이 이미 최대치입니다!');
        } else if (characData.hp + hpIncrease > 1000) {
            await update(characRef, {hp: 1000});
        } else {
            await update(characRef, {hp: characData.hp + hpIncrease});
        }
    };

    const updatePower = async (powerIncrease) => {
        await update(characRef, {power: characData.power + powerIncrease});
    };

    const updateSpeed = async (powerIncrease) => {
        if (characData.speed <= 10) {
            throw new Error('현재 속도가 이미 최대치입니다!');
        } else {
            await update(characRef, {speed: characData.speed - powerIncrease});
        }
    };

    try {
        switch (newId) {
            case 1:
                await updatePower(10);
                break;
            case 2:
                await updatePower(20);
                break;
            case 3:
                await updatePower(50);
                break;
            case 4:
                await updatePower(80);
                break;
            case 5:
                await updatePower(100);
                break;
            case 6:
                await updateHp(10);
                break;
            case 7:
                await updateHp(20);
                break;
            case 8:
                await updateHp(50);
                break;
            case 9:
                await updateHp(80);
                break;
            case 10:
                await updateHp(100);
                break;
            case 11:
                await updateSpeed(10);
                break;
        }

        await updateUserMoney(memberKey, userMoney - productStatItems[id].price);
    } catch (err) {
        try {
            await update(characRef, {...originalCharacData});
            await updateUserMoney(memberKey, userMoney);
            alert(err.message);
        } catch (recoveryError) {
            console.error("원상복구에 실패했습니다!", recoveryError);
            alert("Error : 원상복구에 실패했습니다. Q & A 게시판으로 문의해주세요.");
            throw recoveryError;
        }
        throw err;
    }
};

window.equipWeaponItem = async function (memberKey, id) {
    const memberId = await loginKeyCheckById();
    const safeId = memberId.toString();
    const characRef = ref(database, `characs/${safeId}`);

    let newId = parseInt(id.replace('w', ''), 10);
    const characSnapshot = await get(characRef);
    const characData = characSnapshot.val();
    const originalCharacData = JSON.parse(JSON.stringify(characData));

    if (characData.weaponId === newId) {
        alert('이미 착용중인 무기 입니다.');
        throw new Error('이미 착용중인 무기 입니다.');
    }

    try {
        await update(characRef, {weaponId: newId});
        await updateUserMoney(memberKey, userMoney - productWeaponItems[id].price);
    } catch (err) {
        try {
            await update(characRef, {...originalCharacData});
            await updateUserMoney(memberKey, userMoney);
            alert(err.message);
        } catch (recoveryError) {
            console.error("원상복구에 실패했습니다!", recoveryError);
            alert("Error : 원상복구에 실패했습니다. Q & A 게시판으로 문의해주세요.");
            throw recoveryError;
        }
        throw err;
    }
};

// 페이지네이션 동적 링크 계산
async function updatePagination(totalLogsCount) {
    const pagination = $('.pagination');
    let lastPage = Math.ceil(totalLogsCount / 15.0) || 1;

    if (page > lastPage) {
        location.href = `../shop/shop.html?tap=${shopTap}&page=${lastPage}`;
    }

    pagination.html(`        
            <!-- '처음' 버튼 -->
            <a href="../shop/shop.html?page=1">처음 )</a>
            &nbsp;
            <!-- 이전 페이지 버튼들 -->
            <a class="page" href="../shop/shop.html?tap=${shopTap}&page=${Math.max(page - 4, 1)}" style="${page <= 4 ? 'display: none;' : ''}">${Math.max(page - 4, 1)}</a>
            <a class="page" href="../shop/shop.html?tap=${shopTap}&page=${Math.max(page - 3, 1)}" style="${page <= 3 ? 'display: none;' : ''}">${Math.max(page - 3, 1)}</a>
            <a class="page" href="../shop/shop.html?tap=${shopTap}&page=${Math.max(page - 2, 1)}" style="${page <= 2 ? 'display: none;' : ''}">${Math.max(page - 2, 1)}</a>
            <a class="page" href="../shop/shop.html?tap=${shopTap}&page=${Math.max(page - 1, 1)}" style="${page === 1 ? 'display: none;' : ''}">${Math.max(page - 1, 1)}</a>
            <!-- 현재 페이지 -->
            <a class="page active" href="../scoreboard.html?tap=${shopTap}&page=${page}">${page}</a>
            <!-- 다음 페이지 버튼들 -->
            <a class="page" href="../shop/shop.html?tap=${shopTap}&page=${Math.min(page + 1, lastPage)}" style="${page >= lastPage ? 'display: none;' : ''}">${Math.min(page + 1, lastPage)}</a>
            <a class="page" href="../shop/shop.html?tap=${shopTap}&page=${Math.min(page + 2, lastPage)}" style="${page + 1 >= lastPage ? 'display: none;' : ''}">${Math.min(page + 2, lastPage)}</a>
            <a class="page" href="../shop/shop.html?tap=${shopTap}&page=${Math.min(page + 3, lastPage)}" style="${page + 2 >= lastPage ? 'display: none;' : ''}">${Math.min(page + 3, lastPage)}</a>
            <a class="page" href="../shop/shop.html?tap=${shopTap}&page=${Math.min(page + 4, lastPage)}" style="${page + 3 >= lastPage ? 'display: none;' : ''}">${Math.min(page + 4, lastPage)}</a>
            <!-- '마지막' 버튼 -->
            &nbsp;
            <a href="../shop/shop.html?tap=${shopTap}&page=${lastPage}">( 마지막</a>        
    `);
}