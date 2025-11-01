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

// 🔹 로그인 닉네임 (subnick → nickname)
export function getActiveNickname() {
    const subNick = localStorage.getItem("coffee-subnick");
    if (subNick) {
        localStorage.removeItem("coffee-subnick");
        return subNick;
    }
    return localStorage.getItem("coffee-nickname") || null;
}

// 🔹 페이지 이동
export function goToPage(target = "levelup") {
    // 현재 경로에서 마지막 슬래시 이전까지만 추출 → 프로젝트 루트 경로
    const basePath = window.location.pathname.split("/").slice(0, -2).join("/");

    const pageMap = {
        admin: `${basePath}/admin/main.html`,
        ranking: `${basePath}/ranking/main.html`,
        levelup: `${basePath}/levelup/levelup.html`,
        layout: `${basePath}/layout/layout.html`,
        barista: `${basePath}/barista/barista.html`,
        memory: `${basePath}/memory/memory.html`
    };

    // target이 잘못된 경우 기본값 levelup으로 이동
    location.href = pageMap[target] || pageMap.levelup;
}

// ==============================
// ✅ 커스텀 알림 / 컨펌 모달
// ==============================
export function showAlert(message) {
    $("#customAlert .alert-text").html(message);
    $("#customAlert").fadeIn(150);
}

export function closeAlert() {
    $("#customAlert").fadeOut(150);
}

export function showConfirm(message, onConfirm) {
    $("#customConfirm .alert-text").html(message);
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