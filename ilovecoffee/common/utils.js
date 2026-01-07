// ==============================
// ✅ 공통 유틸 함수 (common/utils.js)
// ==============================

// 🔹 한국 시간 기준 오늘 날짜 (YYYY-MM-DD)
export function getKoreanDate() {
    const koreaTime = new Date();
    const year = koreaTime.getFullYear();
    const month = String(koreaTime.getMonth() + 1).padStart(2, "0");
    const day = String(koreaTime.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// 🔹 한국 시간 기준 타임스탬프 (YY.MM.DD-hh:mm:ss)
export function getKoreanTimestamp() {
    const koreaTime = new Date();
    const yy = String(koreaTime.getFullYear()).slice(2);
    const mm = String(koreaTime.getMonth() + 1).padStart(2, "0");
    const dd = String(koreaTime.getDate()).padStart(2, "0");
    const hh = String(koreaTime.getHours()).padStart(2, "0");
    const mi = String(koreaTime.getMinutes()).padStart(2, "0");
    const ss = String(koreaTime.getSeconds()).padStart(2, "0");
    return `${yy}.${mm}.${dd}-${hh}:${mi}:${ss}`;
}

// 🔹 게시판용 날짜 파싱 (YY.MM.DD-hh:mm:ss → timestamp)
export function parseKoreanTimestamp(str) {
    if (!str) return 0;

    // 예: "25.11.23-20:11:10"
    const [datePart, timePart] = str.split('-'); // ["25.11.23", "20:11:10"]

    const [yy, mm, dd] = datePart.split('.').map(Number);
    const [HH, MI, SS] = timePart.split(':').map(Number);

    const fullYear = 2000 + yy; // 25 → 2025

    return new Date(fullYear, mm - 1, dd, HH, MI, SS);
}

// 🔹 짧은 날짜 포맷 (MM.DD)
export function formatShortDate(dateStr) {
    if (!dateStr) return "-";
    const [yyyy, mm, dd] = dateStr.split("-");
    return `${mm}.${dd}`;
}

// 🔹 닉네임 유효성 검사
export function validateNickname(nickname) {
    nickname = nickname.trim();

    // ✅ 허용 문자 확인
    if (!/^[가-힣a-zA-Z0-9_]+$/.test(nickname)) {
        showAlert("이름 길이가 맞지 않습니다.\n(한글 2~6자, 영문 3~9자)");
        return false;
    }

    const koreanCount = (nickname.match(/[가-힣]/g) || []).length;
    const totalLength = nickname.length;
    const isKorean = /[가-힣]/.test(nickname);

    // ✅ 전부 한글인 경우
    if (totalLength === koreanCount) {
        // 한글 2~6자 제한
        if (totalLength < 2 || totalLength > 6) {
            console.log(1);
            showAlert("이름 길이가 맞지 않습니다.\n(한글 2~6자, 영문 3~9자)");
            return false;
        }
    }

    // ✅ 한글 포함된 경우
    if (isKorean) {
        // 한글 1자 + 영문 1자 (예: 이e) ❌
        if (totalLength <= 2 && koreanCount === 1) {
            console.log(5);
            showAlert("이름 길이가 맞지 않습니다.\n(한글 2~6자, 영문 3~9자)");
            return false;
        }

        // 한글 5자 이상인데 다른 문자가 포함된 경우 ❌ (예: 이이이이이ee)
        if (koreanCount >= 5 && totalLength > 6) {
            console.log(4);
            showAlert("이름 길이가 맞지 않습니다.\n(한글 2~6자, 영문 3~9자)");
            return false;
        }

        return true;
    }

    // ✅ 한글 없는 경우 → 영문/숫자 3~9자
    if (totalLength < 3 || totalLength > 9) {
        showAlert("이름 길이가 맞지 않습니다.\n(한글 2~6자, 영문 3~9자)");
        return false;
    }

    return true;
}

// 🔹 비밀번호 유효성 검사
export function validatePassword(password) {
    if (!password || password.trim().length < 4) {
        showAlert("비밀번호는 4자 이상이어야 합니다.");
        return false;
    }
    if (password.length > 20) {
        showAlert("비밀번호는 최대 20자까지 가능합니다.");
        return false;
    }
    if (!/^[a-zA-Z0-9!@#$%^&*]+$/.test(password)) {
        showAlert("비밀번호는 영문, 숫자, 특수문자(!@#$%^&*)만 가능합니다.");
        return false;
    }
    return true;
}

// 🔹 미래 날짜 방지
export function validateDateNotFuture(dateStr) {
    if (!dateStr) {
        showAlert("날짜를 선택해주세요.");
        return false;
    }
    const today = getKoreanDate();
    if (dateStr > today) {
        showAlert("미래 날짜는 입력할 수 없습니다.");
        return false;
    }
    return true;
}

// 🔹 목표 중복 방지
export function validateUniqueGoals(goals) {
    const unique = [...new Set(goals)];
    if (unique.length !== goals.length) {
        showAlert("중복된 목표값이 있습니다.");
        return false;
    }
    return true;
}

// 🔹 숫자 → 3자리 콤마 추가
export function addComma(num) {
    return Number(num).toLocaleString();
}

// 🔹 문자열 → 숫자 (콤마 제거)
export function removeComma(str) {
    return parseInt(String(str).replace(/,/g, ""), 10) || 0;
}

// 🔹 숫자 입력 시 실시간 포맷 적용
export function bindNumericCommaFormatter(selector, maxValue = 1_000_000_000_000, maxMsg = "최대 1조까지 입력할 수 있어요.") {
    $(document).off("input", selector).on("input", selector, function () {
        let value = $(this).val().replace(/[^0-9]/g, "");
        if (!value) {
            $(this).val("");
            return;
        }

        let num = parseInt(value, 10);
        if (num > maxValue) {
            showAlert(maxMsg);
            num = maxValue;
        }

        $(this).val(num.toLocaleString());
    });
}

function obscureText(text, key = "EichiKey2025") {
    if (!text) return "";

    try {
        const t = Array.from(new TextEncoder().encode(text));
        const k = Array.from(key).map(ch => ch.charCodeAt(0));
        const mixed = t.map((c, i) => c ^ k[i % k.length]); // XOR
        return btoa(String.fromCharCode(...mixed))
            .replace(/\+/g, "@")
            .replace(/\//g, "#")
            .replace(/=/g, "*");
    } catch (err) {
        return text;
    }
}

function revealText(obscured, key = "EichiKey2025") {
    if (!obscured) return null;

    try {
        const b64 = obscured.replace(/@/g, "+").replace(/#/g, "/").replace(/\*/g, "=");
        const bytes = Array.from(atob(b64)).map(ch => ch.charCodeAt(0));
        const k = Array.from(key).map(ch => ch.charCodeAt(0));
        const decoded = bytes.map((b, i) => b ^ k[i % k.length]);
        return new TextDecoder().decode(new Uint8Array(decoded));
    } catch (err) {
        return null;
    }
}

// 🔹 닉네임 저장
export function setActiveNickname(nickname, key = "coffee-nickname") {
    if (!nickname) return;
    const encrypted = obscureText(nickname);
    localStorage.setItem(key, encrypted);
}

// 🔹 로그인 닉네임 (subnick → nickname)
export function getActiveNickname() {
    const subNick = localStorage.getItem("coffee-subnick");
    if (subNick) {
        localStorage.removeItem("coffee-subnick");
        return revealText(subNick);
    }
    const raw = localStorage.getItem("coffee-nickname");
    return revealText(raw);
}

export function getActiveSubNickname() {
    const raw = localStorage.getItem("coffee-subnickname");
    return revealText(raw);
}

// 🔹 페이지 이동
export function goToPage(target = "levelup") {
    // 현재 경로에서 마지막 슬래시 이전까지만 추출 → 프로젝트 루트 경로
    const basePath = window.location.pathname.split("/").slice(0, -2).join("/");

    const pageMap = {
        levelup: `${basePath}/levelup/levelup.html`,
        ranking: `${basePath}/ranking/ranking.html`,

        memory: `${basePath}/memory/memory.html`,
        memoryRoom: `${basePath}/memory/memoryRoom.html`,

        aDash: `${basePath}/admin/dashboard.html`,
        admin: `${basePath}/admin/main.html`,
        aMemory: `${basePath}/admin/aMemory.html`,
        aWrite: `${basePath}/post/write.html`,
        aEdit: `${basePath}/post/edit.html`,

        postList: `${basePath}/post/list.html`,

        layout: `${basePath}/layout/layout.html`,
        barista: `${basePath}/barista/barista.html`,

        shop: `${basePath}/shop/shop.html`,

        test: `${basePath}/test/test.html`,
    };

    // target이 잘못된 경우 기본값 levelup으로 이동
    location.href = pageMap[target] || pageMap.levelup;
}

// ==============================
// ✅ 커스텀 알림 / 컨펌 모달
// ==============================
// 🔹 HTML 구조를 자동으로 주입하는 내부 함수
function ensureModalExists() {
    // 알림창이 없으면 body 끝에 추가
    if ($("#customAlert").length === 0) {
        const alertHtml = `
        <div id="customAlert" class="login-overlay" style="display:none; z-index: 10000;">
            <div class="alert-box">
                <div class="alert-content">
                    <div class="alert-text"></div>
                    <img src="../../favicon/Eichi2.png" alt="Eichi" class="alert-img">
                </div>
                <button id="alertConfirmBtn">확인</button>
            </div>
        </div>`;
        $("body").append(alertHtml);

        // 알림창 확인 버튼 이벤트 연결
        $(document).on("click", "#alertConfirmBtn", closeAlert);
    }

    // 컨펌창이 없으면 body 끝에 추가
    if ($("#customConfirm").length === 0) {
        const confirmHtml = `
        <div id="customConfirm" class="login-overlay" style="display:none; z-index: 10000;">
            <div class="alert-box">
                <div class="alert-content">
                    <div class="alert-text"></div>
                    <img src="../../favicon/Eichi2.png" alt="Eichi" class="alert-img">
                </div>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button id="confirmYesBtn" style="flex:1; background: var(--primary); color: var(--text-accent); border:none; border-radius:8px; font-size:16px; font-weight:600; padding:10px;">확인</button>
                    <button id="confirmNoBtn" style="flex:1; background: var(--btn-close); color: var(--text-accent); border:none; border-radius:8px; font-size:16px; font-weight:600; padding:10px;">취소</button>
                </div>
            </div>
        </div>`;
        $("body").append(confirmHtml);
    }
}

export function showAlert(message) {
    ensureModalExists();
    $("#customAlert .alert-text").html(message);
    $("#customAlert").fadeIn(150);
}

export function closeAlert() {
    $("#customAlert").fadeOut(150);
}

export function showConfirm(message, onConfirm, yesText = "확인", noText = "취소") {
    ensureModalExists();
    $("#customConfirm .alert-text").html(message);
    $("#confirmYesBtn").text(yesText);
    $("#confirmNoBtn").text(noText);
    $("#customConfirm").fadeIn(150);

    $(document)
        .off("click", "#confirmYesBtn")
        .on("click", "#confirmYesBtn", function () {
            $("#customConfirm").fadeOut(150);
            if (typeof onConfirm === "function") onConfirm(true);
        });

    $(document)
        .off("click", "#confirmNoBtn")
        .on("click", "#confirmNoBtn", function () {
            $("#customConfirm").fadeOut(150);
            if (typeof onConfirm === "function") onConfirm(false);
        });
}

export function formatKoreanNumber(num) {
    let n = Number(num);

    const eok = Math.floor(n / 100000000);  // 억
    n %= 100000000;

    const man = Math.floor(n / 10000);      // 만
    n %= 10000;

    const ge = n;                           // 나머지

    const parts = [];
    if (eok > 0) parts.push(`${eok.toLocaleString()}억`);
    if (man > 0) parts.push(`${man.toLocaleString()}만`);
    if (ge > 0 || parts.length === 0) parts.push(`${ge.toLocaleString()}`);

    return parts.join(" ");
}

export function isToday(koreanTimeStr) {
    const d = parseKoreanTimestamp(koreanTimeStr);
    const now = new Date();

    return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    );
}

export function formatDisplayDate(koreanTimeStr) {
    const d = parseKoreanTimestamp(koreanTimeStr);

    if (isToday(koreanTimeStr)) {
        // 오늘이면 → HH:MM
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
    } else {
        // 오늘이 아니면 → M-D
        const yyyy = d.getFullYear();
        const mm = d.getMonth() + 1;
        const day = d.getDate();
        return `${yyyy}-${mm}-${day}`;
    }
}

export function getCssVar(name) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
}

export const cssVar = (name) => getCssVar(`--${name}`);

export const COLORS = {
    P: cssVar("primary"),
    P_L: cssVar("primary-light"),
    P_D: cssVar("primary-dark"),

    BG_M: cssVar("bg-main"),
    BG_S: cssVar("bg-sub"),
    BG_A: cssVar("bg-accent"),

    TXT_M: cssVar("text-main"),
    TXT_S: cssVar("text-sub"),
    TXT_A: cssVar("text-accent"),
    TXT_D: cssVar("text-danger"),

    BTN_C: cssVar("btn-close"),
    BTN_D: cssVar("btn-danger"),
    BTN_T: cssVar("btn-toggle"),

    BO_M: cssVar("border-main"),
    BO_S: cssVar("border-sub"),
};