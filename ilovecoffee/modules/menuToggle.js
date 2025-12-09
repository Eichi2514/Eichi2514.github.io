// ✅ 메뉴 토글 + 자동 생성 + 관리자 모달 포함
import {
    getDatabase,
    ref,
    get,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import {getActiveNickname, goToPage, showAlert, getKoreanDate} from "../common/utils.js";
import {initializeApp, getApps, getApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyA4ERWaxTCYUiEijuhdQITVsP_VlYrVXEU",
    authDomain: ".env/authDomain",
    databaseURL: "https://test-948ba-default-rtdb.firebaseio.com",
    projectId: "test-948ba",
    storageBucket: ".env/storageBucket",
    messagingSenderId: "214442102094",
    appId: "1:214442102094:web:844878f6a9c4080538e21f"
};

$(async function () {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const db = getDatabase(app);

    const activeNickname = getActiveNickname();
    const currentPage = window.location.pathname.split("/").pop().replace(".html", "");

    // ✅ 메뉴 영역이 없으면 자동 생성
    if ($(".floating-btn-area").length === 0) {
        $("body").append(`
            <div class="floating-btn-area">
                <button class="floating-btn subCharacterBtn">부캐</button>
                <button class="floating-btn advancedSettingBtn">필터모드</button>                
                <button class="floating-btn levelupBtn">그럴수이치</button>
                <button class="floating-btn rankingBtn">아카이브</button>
                <button class="floating-btn memoryBtn">추억수집</button>
                <button class="floating-btn memoryRoomBtn">메모리룸</button>
                <button class="floating-btn adminBtn">관리자</button>
                <button class="floating-toggle">▲</button>
            </div>
        `);
    }

    // ✅ 관리자 모달이 없으면 자동 생성
    if ($("#adminOptionModal").length === 0) {
        $("body").append(`
            <div id="adminOptionModal" class="login-overlay" style="display:none;">
                <div class="login-modal" style="width:260px; text-align:center; position:relative;">
                    <button id="closeAdminOptionModal" class="closeBtn">✕</button>
                    <h2 style="margin-bottom:16px;">관리자 메뉴</h2>
                    <button id="adminDashboardBtn"
                        style="width:100%; padding:10px; border:2px solid #5a4398; color:#5a4398;
                            border-radius:8px; font-size:16px; font-weight:600;
                            background:transparent; transition:0.2s;">
                        대시보드
                    </button>
                    <button id="adminArchiveBtn"
                        style="width:100%; padding:10px; border:2px solid #5a4398; color:#5a4398;
                            border-radius:8px; font-size:16px; font-weight:600;
                            background:transparent; transition:0.2s;">
                        아카이브
                    </button>
                    <button id="adminMemoryBtn"
                        style="width:100%; padding:10px; border:2px solid #5a4398; color:#5a4398;
                            border-radius:8px; font-size:16px; font-weight:600;
                            background:transparent; transition:0.2s;">
                        메모리룸
                    </button>
                    <button id="adminWriteBtn"
                        style="width:100%; padding:10px; border:2px solid #5a4398; color:#5a4398;
                            border-radius:8px; font-size:16px; font-weight:600;
                            background:transparent; transition:0.2s;">
                        게시글 작성
                    </button>
                    <button id="adminEditBtn"
                        style="width:100%; padding:10px; border:2px solid #5a4398; color:#5a4398;
                            border-radius:8px; font-size:16px; font-weight:600;
                            background:transparent; transition:0.2s;">
                        게시글 수정
                    </button>
                    <button id="testBtn"
                        style="width:100%; padding:10px; border:2px solid #5a4398; color:#5a4398;
                            border-radius:8px; font-size:16px; font-weight:600;
                            background:transparent; transition:0.2s;">
                        Test
                    </button>
                </div>
            </div>
        `);
    }

    const $area = $(".floating-btn-area");
    const $toggle = $(".floating-toggle");

    // ✅ 모든 버튼 숨기고 필요할 때만 표시
    $(".floating-btn").hide();
    $toggle.hide();

    /* ✅ 접힘 상태 복원
    const isOpen = localStorage.getItem("floatingMenuOpen") === "true";
    if (!isOpen) {
        $area.removeClass("collapsed");
        $toggle.text("▼ 닫기");
    } else {
        $area.addClass("collapsed");
        $toggle.text("▲");
    }*/

    const isToggle = localStorage.getItem("closeMenu") === "true";

    if (!isToggle) {
        $area.removeClass("collapsed");
    } else {
        $area.addClass("collapsed");
        $toggle.show();
    }

    // ✅ 토글 버튼 클릭
    $toggle.on("click", function () {
        const nowCollapsed = $area.hasClass("collapsed");

        if (nowCollapsed) {
            $area.removeClass("collapsed");
            $toggle.text("▼ 닫기");
            // localStorage.setItem("floatingMenuOpen", "false");
        } else {
            $area.addClass("collapsed");
            $toggle.text("▲");
            // localStorage.setItem("floatingMenuOpen", "true");
        }
    });

    // ✅ 로그인 안 되어 있으면 종료
    if (!activeNickname) return;

    try {
        const snap = await get(ref(db, `coffeeUsers/${activeNickname}`));
        if (!snap.exists()) return;
        const user = snap.val();

        const {memoryRoomPublic, rankingPublic, isAdmin} = user;
        const hasSubCharacter = localStorage.getItem("coffee-subnickname");

        // ✅ 페이지별 표시 조건
        if (currentPage !== "memory" && currentPage !== "levelup" && currentPage !== "ranking") $(".levelupBtn").show();
        if (currentPage === "levelup" && hasSubCharacter) $(".subCharacterBtn").show();

        if (currentPage !== "memory" && currentPage !== "levelup" && currentPage !== "memoryRoom") $(".memoryBtn").show();
        if (currentPage === "memory") $(".advancedSettingBtn").show();

        if (rankingPublic && currentPage !== "ranking") $(".rankingBtn").show();
        if (memoryRoomPublic && currentPage !== "memoryRoom") $(".memoryRoomBtn").show();
        if (isAdmin) $(".adminBtn").show();

    } catch (err) {
        console.error("menuToggle: 사용자 정보 불러오기 실패", err);
    }

    // ✅ 버튼별 이동 처리
    $(document).on("click", ".levelupBtn", () => goToPage());
    $(document).on("click", ".memoryBtn", () => goToPage("memory"));
    // ✅ 클릭 시 아카이브 접근 조건 검증
    $(document).on("click", ".rankingBtn", async () => {
        const nickname = getActiveNickname();
        if (!nickname) return showAlert("로그인 후 이용해주세요.");

        // 1️⃣ 공개 여부만 가져오기
        const publicRef = ref(db, `coffeeUsers/${nickname}/rankingPublic`);
        const publicSnap = await get(publicRef);
        const rankingPublic = publicSnap.exists() && publicSnap.val();

        if (!rankingPublic) {
            showAlert("아카이브 공개 설정이 꺼져 있습니다.\n설정 후 이용해주세요.");
            return;
        }

        // 2️⃣ 오늘 / 어제 기록만 확인 (전체 expRecords 안 불러옴)
        const today = getKoreanDate();
        const yesterday = (() => {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        })();

        const todayRef = ref(db, `coffeeUsers/${nickname}/expRecords/${today}`);
        const yestRef = ref(db, `coffeeUsers/${nickname}/expRecords/${yesterday}`);

        const [todaySnap, yestSnap] = await Promise.all([get(todayRef), get(yestRef)]);
        const hasRecentRecord = todaySnap.exists() || yestSnap.exists();

        if (!hasRecentRecord) {
            showAlert("최근 경험치 기록이 없습니다.\n입력 후 이용해주세요.");
            return;
        }

        // ✅ 통과 시 페이지 이동
        goToPage("ranking");
    });
    $(document).on("click", ".memoryRoomBtn", () => goToPage("memoryRoom"));
    $(document).on("click", ".adminBtn", () => $("#adminOptionModal").css("display", "flex"));

    // ✅ 관리자 모달 동작
    $(document).on("click", "#closeAdminOptionModal", () => $("#adminOptionModal").hide());
    $(document).on("click", "#adminDashboardBtn", () => {
        $("#adminOptionModal").hide();
        goToPage("aDash");
    });
    $(document).on("click", "#adminArchiveBtn", () => {
        $("#adminOptionModal").hide();
        goToPage("admin");
    });
    $(document).on("click", "#adminMemoryBtn", () => {
        $("#adminOptionModal").hide();
        goToPage("aMemory");
    });
    $(document).on("click", "#adminWriteBtn", () => {
        $("#adminOptionModal").hide();
        goToPage("aWrite");
    });
    $(document).on("click", "#adminEditBtn", () => {
        $("#adminOptionModal").hide();
        goToPage("aEdit");
    });
    $(document).on("click", "#testBtn", () => {
        $("#adminOptionModal").hide();
        goToPage("test");
    });

    const $btn = $(".closeMenuBtn");
    localStorage.removeItem("floatingMenuOpen");

    // ✅ 페이지 로드 시 현재 상태 반영
    const isActive = localStorage.getItem("closeMenu") === "true";
    $btn.text(isActive ? "메뉴열기" : "메뉴닫기");

    // ✅ 버튼 클릭 시 토글 + 새로고침
    $btn.on("click", function () {
        const nowActive = localStorage.getItem("closeMenu") === "true";
        const nextState = !nowActive;

        localStorage.setItem("closeMenu", nextState ? "true" : "false");
        $btn.text(nextState ? "메뉴열기" : "메뉴닫기");

        const $area = $(".floating-btn-area");
        const $toggle = $(".floating-toggle");

        if (nowActive) {
            $area.removeClass("collapsed");
            $toggle.hide();
            $toggle.text("▼ 닫기");
        } else {
            $area.addClass("collapsed");
            $toggle.show();
            $toggle.text("▲");
        }
    });
});
