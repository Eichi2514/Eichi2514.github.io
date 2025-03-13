// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    query,
    orderByChild,
    equalTo,
    limitToFirst,
    get,
    update,
    child,
    set
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

const productGoldItems = [
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/3b0e2c34-227d-4135-91e3-b9cb0ff3207e"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">힘 + 10</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 200</span>
                        <button class="s-button buy-button" data-id="g1">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
             <div class="product-item">
                <img src="https://github.com/user-attachments/assets/3b0e2c34-227d-4135-91e3-b9cb0ff3207e"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">체력 + 10</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 200</span>
                        <button class="s-button buy-button" data-id="g2">구매</button>
                    </div>
                </div>
            </div>
    `
]

const productWeaponItems = [
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/98a45b38-4cb3-4ee4-b8f7-28205ff39cb6"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">톡신 오브</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 10</span>
                        <button class="s-button buy-button" data-id="w1">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/ca527de8-3ca6-44bb-9845-625e9f30ab89"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">디케이 큐브</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 20</span>
                        <button class="s-button buy-button" data-id="w2">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/91200c6c-bd4d-44eb-98df-96a7af967552"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">베놈 랜스</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 30</span>
                        <button class="s-button buy-button" data-id="w3">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/7403b724-19d1-49bf-9781-f97ac6936d68"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">포이즌 스타</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 40</span>
                        <button class="s-button buy-button" data-id="w4">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/eafa86a5-ff3c-4a3d-86e9-8f485c4905e1"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">플라그 애로우</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 50</span>
                        <button class="s-button buy-button" data-id="w5">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/fd1692a4-c906-4f24-b47d-1e2ac54fed56"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">코러시브 빔</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 60</span>
                        <button class="s-button buy-button" data-id="w6">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/f4621a93-e6db-4003-9e49-02fe7543491f"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">테트라 팽</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 70</span>
                        <button class="s-button buy-button" data-id="w7">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/027a11ed-96fa-4587-9b7f-c3efde0e40b1"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">블라이트 봄버맨</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 80</span>
                        <button class="s-button buy-button" data-id="w8">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/f531f906-2147-45b5-8af9-e0877201552c"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">퍼시드 스매셔</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 90</span>
                        <button class="s-button buy-button" data-id="w9">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/dcc3fdaa-fa09-42a9-a929-3e7904925b41"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">제노시스 블레이드</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 100</span>
                        <button class="s-button buy-button" data-id="w10">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/330ad6aa-ead1-485b-900e-dea99d69abbc"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">어비스 오브</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 210</span>
                        <button class="s-button buy-button" data-id="w11">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/4ba220d2-1c7f-4f84-bb1e-bc5eb8b4f531"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">크립틱 큐브</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 220</span>
                        <button class="s-button buy-button" data-id="w12">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/791c3025-5ee3-4528-8cc2-8bbe8daf4bc0"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">나이트 랜스</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 230</span>
                        <button class="s-button buy-button" data-id="w13">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/1dd703a6-d7be-48ad-8eec-11960337c59c"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">쉐이드 스타</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 240</span>
                        <button class="s-button buy-button" data-id="w14">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/87660691-5b05-427a-9471-94af0105d66d"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">팬텀 애로우</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 250</span>
                        <button class="s-button buy-button" data-id="w15">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/c1776b21-dae8-4890-a91c-c93198a28d2a"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">루나 빔</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 260</span>
                        <button class="s-button buy-button" data-id="w16">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/03def50a-b4a8-4ccc-80de-e9f570d03dc5"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">섀도우 팽</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 270</span>
                        <button class="s-button buy-button" data-id="w17">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/2ac29faa-dba5-46b1-9a15-665ce62596ba"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">나이트폴 봄버맨</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 280</span>
                        <button class="s-button buy-button" data-id="w18">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/3e3ebf0f-e700-4a6f-91f5-ffbf9f16d69f"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">스펙터 스매셔</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 290</span>
                        <button class="s-button buy-button" data-id="w19">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/383a1c05-7a15-4974-8842-a4f0d3f3b747"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">루나틱 블레이드</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 300</span>
                        <button class="s-button buy-button" data-id="w20">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/34b8096b-643c-4323-adb9-384198f35a05"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">스톰 오브</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 510</span>
                        <button class="s-button buy-button" data-id="w21">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/e745c414-919e-45a0-8ee8-b6708c677c97"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">타이달 큐브</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 520</span>
                        <button class="s-button buy-button" data-id="w22">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/98c2a891-0148-4b10-8ce8-1509fecdb511"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">블리자드 랜스</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 530</span>
                        <button class="s-button buy-button" data-id="w23">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/417ceca3-7c5a-4b46-b7ba-597320a7280b"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">스카이 스타</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 540</span>
                        <button class="s-button buy-button" data-id="w24">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/076ae1bc-5a66-4db3-be82-6f22e0b52155"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">제피르 애로우</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 550</span>
                        <button class="s-button buy-button" data-id="w25">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/c5b27034-7754-4a7c-b212-67bb919e60c1"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">볼텍스 빔</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 560</span>
                        <button class="s-button buy-button" data-id="w26">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/6e8c1158-10dd-4769-8d3f-27d0df7e1ac6"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">게일 팽</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 570</span>
                        <button class="s-button buy-button" data-id="w27">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/7cd68d64-55c6-4da3-98d6-ec641e4d139b"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">프로스트 봄버맨</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 580</span>
                        <button class="s-button buy-button" data-id="w28">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/7b8523d2-e443-44fc-9f79-dbebcf385b29"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">스카이 스매셔</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 590</span>
                        <button class="s-button buy-button" data-id="w29">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/2ea0d667-6c8b-42c2-9eac-435e19422256"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">글레이셔 블레이드</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 600</span>
                        <button class="s-button buy-button" data-id="w30">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/a114d57e-9995-4036-93be-e73087b93dee"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">포레스트 오브</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 910</span>
                        <button class="s-button buy-button" data-id="w31">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/fefa8e4d-6ce4-4258-9988-c6bee58defa6"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">베르던트 큐브</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 920</span>
                        <button class="s-button buy-button" data-id="w32">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/44fc98a6-87f8-4444-b6af-6fb31c513ed9"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">가이아 랜스</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 930</span>
                        <button class="s-button buy-button" data-id="w33">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/2de1f608-83ba-42ad-b0b1-8ac51dea567a"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">실피드 스타</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 940</span>
                        <button class="s-button buy-button" data-id="w34">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/a8369e91-a67f-44f0-9c4a-ef8fbb8cfe2a"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">바인 애로우</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 950</span>
                        <button class="s-button buy-button" data-id="w35">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/388af076-05e8-452f-a501-a56f64c992c9"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">테라 빔</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 960</span>
                        <button class="s-button buy-button" data-id="w36">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/96270c25-7a7b-4086-ac06-5634555b70ef"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">와일드 팽</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 970</span>
                        <button class="s-button buy-button" data-id="w37">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/89cf8667-6f45-440e-aa48-de352197809f"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">가이아 봄버맨</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 980</span>
                        <button class="s-button buy-button" data-id="w38">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/87a96719-bbac-410c-8a33-d7f67d39a2a2"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">네이처 스매셔</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 990</span>
                        <button class="s-button buy-button" data-id="w39">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/4c81b6d8-1ab6-41e3-99e8-e289eb7510de"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">스피릿 블레이드</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 1K</span>
                        <button class="s-button buy-button" data-id="w40">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/a08e3986-994d-4449-adb1-10e575714188"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">라이트닝 오브</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 1.51K</span>
                        <button class="s-button buy-button" data-id="w41">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/e8f0f8ed-0d14-4bed-8f14-d58a6ce6c537"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">볼태틱 큐브</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 1.52K</span>
                        <button class="s-button buy-button" data-id="w42">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/5f99f1a8-cce0-43f4-9bd0-b01aff7ed337"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">스파크 랜스</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 1.53K</span>
                        <button class="s-button buy-button" data-id="w43">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/b007b848-66f2-404f-9452-e4ca17e4ebf2"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">라디언트 스타</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 1.54K</span>
                        <button class="s-button buy-button" data-id="w44">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/c6d3d271-dc7c-4cc1-908b-1960ece2ed80"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">플래시 애로우</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 1.55K</span>
                        <button class="s-button buy-button" data-id="w45">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/157e3ef6-ca2b-47f8-96ba-4a4451534fec"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">라디언트 빔</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 1.56K</span>
                        <button class="s-button buy-button" data-id="w46">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/40a08051-7223-4472-ab42-42bdbfeca35c"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">썬더 팽</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 1.57K</span>
                        <button class="s-button buy-button" data-id="w47">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/62dedd0e-9806-4fca-a7fb-d06fea28d1c4"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">템페스트 봄버맨</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 1.58K</span>
                        <button class="s-button buy-button" data-id="w48">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/d3e44839-8d46-4c0f-9e26-169bab080fdd"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">디바인 스매셔</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 1.59K</span>
                        <button class="s-button buy-button" data-id="w49">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/1afae587-dff3-42dd-a663-6730f5766187"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">플라즈마 블레이드</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 2.60K</span>
                        <button class="s-button buy-button" data-id="w50">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/2e6e4dc2-3b84-4521-b9c1-7eb469d8d861"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">서지 오브</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 2.61K</span>
                        <button class="s-button buy-button" data-id="w51">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/44dc4242-4cc1-4bd9-bf1d-501625f79981"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">라디언트 큐브</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 2.62K</span>
                        <button class="s-button buy-button" data-id="w52">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/e0cd5573-f9ae-4a94-98b8-933b0317f6cd"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">블레이즈 랜스</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 2.63K</span>
                        <button class="s-button buy-button" data-id="w53">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/221e2115-c9fe-4777-90de-b690b272268b"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">썬셋 스타</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 2.64K</span>
                        <button class="s-button buy-button" data-id="w54">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/90731980-1fc7-49cb-8a99-f103082727ac"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">플레어 애로우</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 2.65K</span>
                        <button class="s-button buy-button" data-id="w55">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/74c267ea-fa2f-494b-923e-fd8728e7346c"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">솔라 빔</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 2.66K</span>
                        <button class="s-button buy-button" data-id="w56">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/e3ac88c9-4c23-4f76-8a66-4780e32afcf7"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">폭풍 팽</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 2.67K</span>
                        <button class="s-button buy-button" data-id="w57">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/47452f52-d6f9-4561-b984-59bf1abc6b0a"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">썬더 봄버맨</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 2.68K</span>
                        <button class="s-button buy-button" data-id="w58">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/6435b887-2b87-4367-a088-28e13d0a9b59"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">파워 스매셔</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 2.69K</span>
                        <button class="s-button buy-button" data-id="w59">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/fceed0f8-5b68-4263-b9f2-63d9dcb9eaa8"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">에너제틱 블레이드</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 2.7K</span>
                        <button class="s-button buy-button" data-id="w60">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/d3b5fb90-b21e-42a3-8964-a866132ace38"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">파이어 오브</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 4.71K</span>
                        <button class="s-button buy-button" data-id="w61">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/a75eb20d-7588-42c0-b517-c5cfa38293a1"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">인페르노 큐브</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 4.72K</span>
                        <button class="s-button buy-button" data-id="w62">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/bab07e9b-6bcc-4cc6-9782-d2e5491ed42e"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">헬파이어 랜스</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 4.73K</span>
                        <button class="s-button buy-button" data-id="w63">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/351cb011-e0d8-4b97-ade0-e591aecd63f2"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">플레임 스타</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 4.74K</span>
                        <button class="s-button buy-button" data-id="w64">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/df28a7ef-027e-4b9c-9dfe-5333945f79b4"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">피닉스 애로우</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 4.75K</span>
                        <button class="s-button buy-button" data-id="w65">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/402dde9c-aeba-4543-a5a2-77d95ec25bba"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">블러드 빔</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 4.76K</span>
                        <button class="s-button buy-button" data-id="w66">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/c9258612-c30a-4e6b-8f43-d63518485e72"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">크림슨 팽</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 4.77K</span>
                        <button class="s-button buy-button" data-id="w67">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/33899c93-1223-4e71-9113-7d7702c20b03"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">블레이즈 봄버맨</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 4.78K</span>
                        <button class="s-button buy-button" data-id="w68">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/ead726f4-fa9f-4fd8-935a-0c665b173069"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">파이로 스매셔</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 4.79K</span>
                        <button class="s-button buy-button" data-id="w69">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/a6dcabfb-34c7-41bc-ad0e-94228de15519"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">인페르노 블레이드</div>
                    <div class="product-purchase">
                        <span class="product-price">$ 4.8k</span>
                        <button class="s-button buy-button" data-id="w70">구매</button>
                    </div>
                </div>
            </div>
    `
]

const productCashItems = [
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/3b0e2c34-227d-4135-91e3-b9cb0ff3207e"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">닉네임 변경권</div>
                    <div class="product-purchase">
                        <span class="product-price">1,000원</span>
                        <button class="s-button buy-button" data-id="c1">구매</button>
                    </div>
                </div>
            </div>
    `,
    `
            <div class="product-item">
                <img src="https://github.com/user-attachments/assets/3b0e2c34-227d-4135-91e3-b9cb0ff3207e"
                     alt="상품 이미지" class="product-image"/>
                <div class="product-details">
                    <div class="product-name">초보 등반자 (여)</div>
                    <div class="product-purchase">
                        <span class="product-price">1,000원</span>
                        <button class="s-button buy-button" data-id="c2">구매</button>
                    </div>
                </div>
            </div>
    `
]

const key = localStorage.getItem('nickname');
if (!key) {
    alert('로그인이 필요한 서비스 입니다');
    window.location.href = 'ascentlime.html';
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

const urls = window.location.search;

const shopTap = urls ? parseInt(new URLSearchParams(urls).get('tap'), 10) || 0 : 0;
const page = urls ? parseInt(new URLSearchParams(urls).get('page'), 10) || 1 : 1;

// console.log(`shopTap : ${shopTap}, page : ${page}`);

$(`.tab-${shopTap}`).css('z-index', 1);

async function displayShopItems() {
    let itemsToDisplay = [];

    try {
        let userMoney = await getUserMoney(key);
        userMoney = convertNumberFormat(userMoney);
        $('.money_count').text(userMoney);
    } catch (error) {
        console.error('돈 불러오는 중 오류 발생:', error);
        $('.money_count').text('불러오기 실패');
    }

    if (shopTap === 1) {
        itemsToDisplay = [...productGoldItems, ...productWeaponItems];
    } else if (shopTap === 2) {
        itemsToDisplay = [...productCashItems];
    } else {
        itemsToDisplay = [...productGoldItems, ...productWeaponItems, ...productCashItems];
    }

    itemsToDisplay.slice((page - 1) * 15, page * 15).forEach(item => $('.shop-container').append(item));
}

displayShopItems();