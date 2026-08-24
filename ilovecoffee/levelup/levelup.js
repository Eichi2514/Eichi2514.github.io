import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {get, getDatabase, ref, remove, set, update, runTransaction} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// ✅ 공통 유틸 모듈
import { calcAvgExp } from "../common/expUtils.js";
import { levelExp } from "../common/levelExp.js";
import { PROFILE_GROUPS } from "../common/profileData.js";
import { getSafeProfileById } from "../common/profileUtils.js";
import { giveCoupon } from "../common/walletUtils.js";
import {SHOP_DATA} from "../common/shopData.js";
import {
    bindNumericCommaFormatter,
    closeAlert,
    formatKoreanNumber,
    getActiveNickname,
    getActiveSubNickname,
    getKoreanDate,
    getKoreanTimestamp,
    goToPage,
    setActiveNickname,
    showAlert,
    showConfirm,
    validateDateNotFuture,
    validateNickname,
    validatePassword,
    validateUniqueGoals,
    COLORS
} from "../common/utils.js";

const firebaseConfig = {
    apiKey: "AIzaSyA4ERWaxTCYUiEijuhdQITVsP_VlYrVXEU",
    authDomain: ".env/authDomain",
    databaseURL: "https://test-948ba-default-rtdb.firebaseio.com",
    projectId: "test-948ba",
    storageBucket: ".env/storageBucket",
    messagingSenderId: "214442102094",
    appId: "1:214442102094:web:844878f6a9c4080538e21f"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const MAX_LEVEL = levelExp.length;

$(".logoutBtn").on("click", function () {
    showConfirm("정말 로그아웃할까요?", async (ok) => {
        if (ok) {
            localStorage.removeItem("coffee-nickname");
            localStorage.removeItem("coffee-subnickname");
            location.reload();
        }
    });
});

// ✅ 부캐 등록 모달 열기
$(document).on("click", ".addSubCharacterBtn", function () {
    $("#subLoginPopup").show();
});

function calcRemainingDays(targetDate) {
    const todayStr = getKoreanDate(); // YYYY-MM-DD

    const today = new Date(todayStr);
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    // 타겟이 오늘 이전이면 계산 불가
    if (target <= today) return 0;

    let days = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

    // 오늘 경험치 아직 안 썼으면 오늘 포함
    const hasTodayRecord = latestExpRecords && (latestExpRecords[todayStr] || latestExpRecords[todayStr.slice(5)]);
    if (!hasTodayRecord) {
        days += 1;
    }

    return days;
}

// ✅ 티르 계산기 전용 스냅샷
let tirRemainExpSnapshot = null;

$(document).on("click", ".tirCalcBtn", function () {
    $("#tirCalcModal").show();

    // 현재 레벨
    $("#tirCurLevel").text($("#currentLevelDisplay").text());

    // 현재 경험치 (최근 기록 기준)
    const curExpText = $("#expTable tbody tr:first td:nth-child(3)").text();
    $("#tirCurExp").text(curExpText || "-");

    tirRemainExpSnapshot = remainExp;

    // 남은 경험치
    $("#tirRemainExp").text(
        tirRemainExpSnapshot ? tirRemainExpSnapshot.toLocaleString() : "-"
    );

    $("#tirTargetDate").val("");
    $("#tirResultBox").hide();
});

function calcTier(targetDate) {
    // ✅ 전역 remainExp 말고 스냅샷 사용
    if (!tirRemainExpSnapshot || tirRemainExpSnapshot <= 0) return null;

    const days = calcRemainingDays(targetDate);
    if (days <= 0) return null;

    return Math.ceil(tirRemainExpSnapshot / days);
}

$(document).on("change", "#tirTargetDate", function () {
    const targetDate = $(this).val();
    const $tirResultBox = $("#tirResultBox");
    if (!targetDate) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    // ❌ 오늘 이전이면 차단
    if (target <= today) {
        showAlert("오늘 이전 날짜는 선택할 수 없습니다.");
        $(this).val("");
        $tirResultBox.hide();
        return;
    }

    const daily = calcTier(targetDate);

    if (!daily) {
        $tirResultBox.hide();
        return;
    }

    $("#tirDailyExp").text(daily.toLocaleString());

    // 보기용 근사치
    let approx = ``;
    if (daily >= 100000000) {
        approx = `( 약 ${Math.floor(daily / 100000000)}억 )`;
    } else if (daily >= 10000) {
        approx = `( 약 ${Math.floor(daily / 10000)}만 )`;
    }

    $("#tirDailyExpApprox").text(approx);
    $tirResultBox.show();
});

// ✅ 닫기 버튼
$(document).on("click", ".closeBtn", function () {
    $(this).closest(".login-overlay").hide();
});

// ✅ 부캐 로그인/등록 처리
$(document).on("click", "#subLoginBtn", async function () {
    const nickname = $("#subNickname").val().trim();
    const password = $("#subPassword").val().trim();
    const $msg = $("#subMessage");

    if (!nickname || !password) {
        $msg.css("color", "red").text("닉네임과 비밀번호를 모두 입력하세요.");
        return;
    }
    if (!validateNickname(nickname)) return;
    if (!validatePassword(password)) return;

    const passwordRef = ref(db, `coffeeUsers/${nickname}/password`);
    const snapshot = await get(passwordRef);

    if (snapshot.exists()) {
        if (snapshot.val() === password) {
            $msg.css("color", "green").text("부캐 로그인 성공!");
            setActiveNickname(nickname, "coffee-subnickname");
            setTimeout(() => {
                $("#subLoginPopup").hide();
                showAlert(`부캐 "${nickname}" 등록 완료!`);
                addSubCharacterButton();
            }, 800);
        } else {
            $msg.css("color", "red").text("비밀번호가 틀렸습니다.");
        }
    } else {
        const counterRef = ref(db, `coffeeCounters/users`);
        const counterSnap = await get(counterRef);

        let newId = 1;
        if (counterSnap.exists()) {
            newId = counterSnap.val() + 1;
        }

        // 새 부캐 생성
        await set(ref(db, `coffeeUsers/${nickname}`), {
            id: newId,
            password,
            signupDate: getKoreanTimestamp(),
            lastLogin: getKoreanTimestamp(),
        });

        // 카운터 증가
        await set(counterRef, newId);
        await set(ref(db, `coffeeUsersId/${newId}`), nickname);

        setActiveNickname(nickname, "coffee-subnickname");
        $msg.css("color", "green").text("새 부캐 계정이 등록되었습니다!");
        setTimeout(() => {
            $("#subLoginPopup").hide();
            showAlert(`부캐 "${nickname}" 등록 완료!`);
            addSubCharacterButton();
        }, 800);
    }
});

// ✅ 부캐 전환 버튼 추가 함수
function addSubCharacterButton() {
    const subNick = getActiveSubNickname();
    if (!subNick) return; // 부캐 없으면 중단

    const $subCharacterBtn = $(".subCharacterBtn");

    // 버튼이 이미 존재하면 텍스트 교체
    $subCharacterBtn.show();
    $subCharacterBtn.text(subNick);

    // 클릭 시 부캐로 전환
    $subCharacterBtn.on("click", () => {
        const originNick = localStorage.getItem("coffee-nickname");
        const subNick = localStorage.getItem("coffee-subnickname");
        if (!subNick) return showAlert("등록된 부캐가 없습니다.");

        localStorage.setItem("coffee-nickname", subNick);
        localStorage.setItem("coffee-subnickname", originNick);
        setTimeout(() => location.reload(), 1000);
    });
}

// ✅ 설정 버튼 클릭 시 드롭다운 토글
$("#settingsBtn").on("click", function (e) {
    e.stopPropagation();
    $("#settingsDropdown").toggle();
});

// ✅ 다른 곳 클릭 시 드롭다운 닫기
$(document).on("click", function (e) {
    if (!$(e.target).closest(".settings-menu").length) {
        $("#settingsDropdown").hide();
    }
});

// ✅ 드롭다운 메뉴 안의 버튼 클릭 시 메뉴 닫기
$(document).on("click", "#settingsDropdown button", function () {
    $("#settingsDropdown").hide();
});

// ================================
// ✅ 경험치표 페이지네이션 기능
// ================================
let currentExpPage = 0;
const levelsPerPage = 10;

// 출석 1등 10회 달성 여부 캐싱
let isFirstRank10 = false;

let progressMode = "level"; // "level" | "goal"

function updateExpTablePagination(totalLevels) {
    const totalPages = Math.ceil(totalLevels / levelsPerPage);

    const $prev = $("#prevExpPage");
    const $next = $("#nextExpPage");

    // 🔹 첫 페이지이면 Prev 비활성화
    if (currentExpPage <= 0) {
        $prev.prop("disabled", true).css({opacity: 0.4, cursor: "not-allowed"});
    } else {
        $prev.prop("disabled", false).css({opacity: 1, cursor: "pointer"});
    }

    // 🔹 마지막 페이지이면 Next 비활성화
    if (currentExpPage >= totalPages - 1) {
        $next.prop("disabled", true).css({opacity: 0.4, cursor: "not-allowed"});
    } else {
        $next.prop("disabled", false).css({opacity: 1, cursor: "pointer"});
    }
}

// ✅ 테이블 페이지 렌더링 함수
function renderExpTablePage(userLevel) {
    const totalLevels = levelExp.length;
    const $tbody = $("#expChartTable tbody");
    $tbody.empty();

    const start = currentExpPage * levelsPerPage;
    const end = Math.min(start + levelsPerPage, totalLevels);

    for (let i = start; i < end; i++) {
        const need = levelExp[i];
        const isMyLevel = i === userLevel;
        const bg = isMyLevel ? `var(--primary-light)` : i % 2 === 0 ? `var(--bg-main)` : `var(--bg-sub)`;
        const color = isMyLevel ? `var(--primary)` : `var(--text-main)`;
        const fontWeight = isMyLevel ? "700" : "500";

        $("#expChartTable tbody").append(`
                <tr style="background:${bg}; color:${color}; font-weight:${fontWeight};">
                    <td style="padding:8px; border:1px solid var(--border-main);">
                        ${i} -> ${i + 1}
                    </td>
                    <td style="padding:8px; border:1px solid var(--border-main);">
                        ${need ? need.toLocaleString() : '-'}
                    </td>
                </tr>
            `);
    }

    updateExpTablePagination(totalLevels);
}

// ✅ 모달 열 때 현재 구간부터 표시
$(document).on("click", ".expTableBtn", function () {
    const userLevel = parseInt($("#currentLevelDisplay").text()) || 1;
    const totalPages = Math.ceil(levelExp.length / levelsPerPage);
    currentExpPage = Math.min(Math.floor(userLevel / levelsPerPage), totalPages - 1);
    $("#expTableModal").css("display", "flex");
    renderExpTablePage(userLevel);
});

// ✅ 이전 / 다음 버튼 기능
$("#prevExpPage").on("click", function () {
    const userLevel = parseInt($("#currentLevelDisplay").text()) || 1;
    if (currentExpPage > 0) {
        currentExpPage--;
        renderExpTablePage(userLevel);
    }
});

$("#nextExpPage").on("click", function () {
    const userLevel = parseInt($("#currentLevelDisplay").text()) || 1;
    const totalPages = Math.ceil(levelExp.length / levelsPerPage);
    if (currentExpPage < totalPages - 1) {
        currentExpPage++;
        renderExpTablePage(userLevel);
    }
});

// 🔹 모든 버튼의 빠른 연속 클릭(더블클릭) 방지
$(document).on("click", "button", function (e) {
    const $btn = $(this);

    // 이미 잠겨 있으면 실행 막기
    if ($btn.data("clicked")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    }

    // 0.8초간 클릭 잠금
    $btn.data("clicked", true);
    setTimeout(() => {
        $btn.removeData("clicked");
    }, 800);
});

// ============================
// ✅ (3) 행 클릭 시 옵션 모달 표시
// ============================
let selectedDate = null;
$(document).on("click", ".exp-row", function () {
    selectedDate = $(this).data("date");
    $("#optionModal").css("display", "flex");
});

// ✅ 옵션 모달 - 닫기
$(document).on("click", "#closeOptionBtn", function () {
    $("#optionModal").hide();
});

// ✅ 수정 버튼 클릭 시 쉼표 있는 값으로 표시
$(document).on("click", "#editExpBtn", async function () {
    const nickname = getActiveNickname();
    if (!nickname || !selectedDate) return;
    const recordRef = ref(db, `coffeeUsers/${nickname}/expRecords/${selectedDate}`);
    const snapshot = await get(recordRef);
    if (snapshot.exists()) {
        const record = snapshot.val();
        $("#editExpDate").val(selectedDate);
        $("#editLevelValue").val(record.level || 1);
        $("#editExpValue").val(record.exp.toLocaleString()); // ✅ 쉼표 포함 표시
        $("#optionModal").hide();
        $("#editModal").css("display", "flex");
    }
});

// ✅ 알림 모달 닫기 버튼
$(document).on("click", "#alertConfirmBtn", function () {
    closeAlert();
});

// ✅ 경험치 입력 시 자동으로 쉼표 추가 (입력할 때마다 포맷 적용)
$(document).on("input", "#todayExp, #editExpValue", function () {
    bindNumericCommaFormatter("#todayExp, #editExpValue", 1_000_000_000_000, "경험치는 최대 1조까지 입력할 수 있어요.");
});

let showLevelUpOnly = false;   // 현재 필터 상태
let allExpRows = [];           // 전체 기록 저장용 (날짜, level, exp, gained)

$("#toggleExpTableBtn").on("click", function () {
    showLevelUpOnly = !showLevelUpOnly; // 토글

    const $tbody = $("#expTable tbody");
    $tbody.empty();

    let rows = [];

    if (showLevelUpOnly) {
        rows.push(allExpRows[0]); // ✅ 첫 기록은 무조건 포함

        let prevLevel = allExpRows[0].level;

        for (let i = 1; i < allExpRows.length; i++) {
            const row = allExpRows[i];
            if (row.level !== prevLevel) {
                rows.push(row);
            }
            prevLevel = row.level;
        }

        $(this).text("전체보기");
    } else {
        rows = [...allExpRows];
        $(this).text("하이라이트");
    }

    // ✅ 여기서 rows를 최신 날짜 기준 내림차순 정렬
    rows.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 🔥 테이블 새로 렌더링
    for (const r of rows) {
        const gainedTd = showLevelUpOnly
            ? `<td> - </td>`
            : `<td>${r.gained}<br><span style="color:var(--text-danger)">${r.approx}</span></td>`;

        $tbody.append(`
                <tr class="exp-row" data-date="${r.date}">
                    <td>${r.formattedDate}</td>
                    <td>${r.level}</td>
                    <td>${r.exp.toLocaleString()}</td>
                    ${gainedTd}
                </tr>
            `);
    }
});

// ✅ 로딩 중 단축키(F5, Ctrl+R) 방지
function disableRefreshKeys(e) {
    if ((e.which || e.keyCode) == 116 || // F5
        (e.ctrlKey && (e.which || e.keyCode) == 82)) { // Ctrl + R
        e.preventDefault();
    }
}

// ✅ 당겨서 새로고침 차단
function disablePullToRefresh() {
    $('body').css('overscroll-behavior-y', 'contain');
}

// ✅ 당겨서 새로고침 다시 허용
function enablePullToRefresh() {
    $('body').css('overscroll-behavior-y', 'auto');
}

// ✅ 로딩 중 새로고침 방지 활성화
const preventRefresh = (e) => {
    e.preventDefault();
    e.returnValue = "";
};

$(window).on('keydown', disableRefreshKeys);
disablePullToRefresh();
window.addEventListener("beforeunload", preventRefresh);

async function hasTodayExpReward(nickname) {
    const today = getKoreanDate();
    const refIndex = ref(db, `coffeeWalletLogs/${nickname}/rewardIndex/expInput/${today}`);
    return (await get(refIndex)).exists();
}

let profileNum = 1;
let chartMode = localStorage.getItem('chartMode') || 'total'; // 이전 설정 유지 (없으면 기본 누적)
let latestExpRecords = null;      // ✅ 최근 기록 캐싱용
let remainExp; // ✅ 레벨업까지 남은 경험치 캐싱용

$(function () {
    const todayValue = "v11";
    const lastUpdate = localStorage.getItem("LU-update");

    if (lastUpdate !== todayValue) {
        showAlert("! New !\n크리스마스 테마 적용 🎄\n\n시간 관계상 전부는 못했어요 ㅎㅅaㅎ\n\n곧 지나갈 이벤트이니\n넓은 마음으로\n양해 부탁드려요..!");
        localStorage.setItem("LU-update", todayValue);
    }

    const $popup = $("#loginPopup");
    const $mainPage = $("#mainPage");
    const $loadingScreen = $("#loadingScreen");
    const $msg = $("#message");
    const $nicknameDisplay = $("#nicknameDisplay");
    const $currentLevelDisplay = $("#currentLevelDisplay");

    const savedNick = getActiveNickname();
    if (savedNick) {
        const userRef = ref(db, `coffeeUsers/${savedNick}`);
        get(userRef).then(async snapshot => {
            if (snapshot.exists()) {
                // ✅ 정상 계정이면 페이지 표시
                if (savedNick == getActiveNickname()) {
                    // await checkDailyAttendance(savedNick);
                    await updateRecentUsers(snapshot.val().id);
                    await set(ref(db, `coffeeUsers/${savedNick}/lastLogin`), getKoreanTimestamp());
                    await showLikeMessages(savedNick);
                }
                $mainPage.css("display", "flex");
                await loadUserData(savedNick);
                await loadTodayLevelUpUsers();
                await new Promise(requestAnimationFrame);
                $(window).off('keydown', disableRefreshKeys);
                window.removeEventListener("beforeunload", preventRefresh);
                enablePullToRefresh();
                $loadingScreen.hide();
            } else {
                // ❌ DB에 없는 닉네임일 경우 자동 제거
                console.warn("저장된 닉네임이 유효하지 않아 초기화합니다.");
                localStorage.removeItem("coffee-nickname");
                $popup.show();
                $(window).off('keydown', disableRefreshKeys);
                window.removeEventListener("beforeunload", preventRefresh);
                enablePullToRefresh();
                $loadingScreen.hide();
            }
        }).catch(err => {
            console.error("데이터 확인 중 오류 발생:", err);
            localStorage.removeItem("coffee-nickname");
            $popup.show();
            $(window).off('keydown', disableRefreshKeys);
            window.removeEventListener("beforeunload", preventRefresh);
            enablePullToRefresh();
            $loadingScreen.hide();
        });
    } else {
        // 로컬스토리지에 닉네임이 없으면 로그인 팝업 유지
        $popup.show();
        localStorage.removeItem("coffee-nickname");
        localStorage.removeItem("coffee-subnickname");
        $(window).off('keydown', disableRefreshKeys);
        window.removeEventListener("beforeunload", preventRefresh);
        enablePullToRefresh();
        $loadingScreen.hide();
    }

    // ✅ 로그인 처리
    $("#loginBtn").on("click", async function () {
        const nickname = $("#nickname").val().trim();
        const password = $("#password").val().trim();

        if (!nickname || !password) {
            $msg.text("닉네임과 비밀번호를 모두 입력하세요.");
            return;
        }

        if (!validateNickname(nickname)) return;

        if (!validatePassword(password)) return;

        const passwordRef = ref(db, `coffeeUsers/${nickname}/password`);
        const snapshot = await get(passwordRef);

        /*
        console.log(`snapshot : ${snapshot.val()}`);
        console.log(`password : ${password}`);
         */

        if (snapshot.exists()) {
            if (snapshot.val() === password) {
                $msg.css("color", "green").text("로그인 성공!");
                setActiveNickname(nickname);
                setTimeout(() => {
                    location.reload();
                }, 400);
            } else {
                $msg.css("color", "red")
                    .html("이미 존재하는 닉네임이거나<br>비밀번호가 틀렸습니다.");
            }
        } else {
            const counterRef = ref(db, `coffeeCounters/users`);
            const counterSnap = await get(counterRef);

            let newId = 1;
            if (counterSnap.exists()) {
                newId = counterSnap.val() + 1;
            }

            await set(ref(db, `coffeeUsers/${nickname}`), {
                id: newId,
                password,
                signupDate: getKoreanTimestamp(),   // 가입일 저장
                lastLogin: getKoreanTimestamp(),
            });

            // 카운터 증가
            await set(counterRef, newId);
            await set(ref(db, `coffeeUsersId/${newId}`), nickname);

            $msg.css("color", "green").text("새 계정이 등록되었습니다.");
            setActiveNickname(nickname);
            setTimeout(() => {
                location.reload();
            }, 400);
        }
    });

    // ✅ 경험치 입력 모달 열기
    $("#expButton").on("click", async function () {
        const today = getKoreanDate();
        $("#expDate").val(today);

        const nickname = getActiveNickname();
        if (nickname) {
            const userRef = ref(db, `coffeeUsers/${nickname}/level`);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                $("#todayLevel").val(snapshot.val()); // 🔹 기본값 설정
            }
        }

        $("#expModal").css("display", "flex");
    });

    // ✅ 경험치 저장 버튼
    $("#saveExpBtn").off("click").on("click", async function () {
        await saveExp();
        $("#todayExp").val("");
        $("#expModal").hide();
    });

    // ✅ 경험치 저장 함수 (쉼표 제거 후 저장)
    async function saveExp() {
        const nickname = getActiveNickname();
        if (!nickname) return showAlert("로그인 후 이용해주세요.");

        // 🔹 쉼표 제거 후 숫자 변환
        const exp = parseInt($("#todayExp").val().replace(/,/g, ""));
        const level = parseInt($("#todayLevel").val());
        const dateInput = $("#expDate").val();
        if (!validateDateNotFuture(dateInput)) return;
        const selectedDate = dateInput || getKoreanDate();

        if (isNaN(exp) || exp < 0) return showAlert("경험치를 올바르게 입력해주세요.");
        if (!level || level < 1 || level > MAX_LEVEL) return showAlert(`레벨은 1~ ${MAX_LEVEL} 사이여야 합니다.`);

        // ✅ 전체 기록 한 번만 가져오기
        const recordsRef = ref(db, `coffeeUsers/${nickname}/expRecords`);
        const allRecordsSnap = await get(recordsRef);
        const allRecords = allRecordsSnap.exists() ? allRecordsSnap.val() : {};

        // ✅ 이미 같은 날짜가 있으면 중복 차단
        if (allRecords[selectedDate]) {
            return showAlert("이미 해당 날짜에 경험치를 입력했습니다!");
        }

        // ✅ 바로 이전 날짜 찾기
        const dates = Object.keys(allRecords).sort();
        const prevDate = dates[dates.length - 1];

        if (prevDate && prevDate < selectedDate) {
            const prevRecord = allRecords[prevDate];
            const prevLevel = prevRecord.level;
            const prevExp = prevRecord.exp;

            // 🔸 같은 레벨인데 경험치가 낮으면 입력 금지
            if (level === prevLevel && exp < prevExp) {
                return showAlert(`이전 기록(${prevDate})보다 낮은 경험치는 입력할 수 없습니다.`);
            }
        }

        // 🎟️ 경험치 입력 보상 (하루 1회)
        const today = getKoreanDate();
        const rewarded = await hasTodayExpReward(nickname);
        const ts = getKoreanTimestamp();

        // ✅ 새 기록 저장 (쉼표 없는 정수 저장)
        await set(ref(db, `coffeeUsers/${nickname}/expRecords/${selectedDate}`), {
            level, exp, savedAt: ts,
        });

        let alertMessage = `레벨 ${level}\n경험치 ${exp.toLocaleString()} 저장 완료!`;

        if (!rewarded) {
            const success = await giveCoupon(nickname, 1, "경험치입력"); // 쿠폰 +1
            if (!success) return;

            await set(ref(db, `coffeeWalletLogs/${nickname}/rewardIndex/expInput/${today}`), ts);
            alertMessage += `\n\n🎫이 지급되었습니다!`
        }

        // 🔹 현재 표시 중인 레벨 가져오기
        const currentLevelVal = parseInt($("#currentLevelDisplay").text()) || 1;

        // 🔹 새로 입력한 레벨이 기존보다 높을 때만 갱신
        if (level > currentLevelVal) {
            await set(ref(db, `coffeeUsers/${nickname}/level`), level);
        }

        showAlert(alertMessage);
        $("#expModal").hide();
        $("#todayExp").val("");

        await loadUserData(nickname);
    }

    // ✅ 아카이브 버튼 추가 함수
    function addRankingButton() {
        $(".rankingBtn").show();
    }

    // ✅ 아카이브 버튼 제거 함수
    function removeRankingButton() {
        $(".rankingBtn").hide();
    }

    // ✅ 목표 경험치 자동 생성 함수
    function autoGenerateGoalsForDisplay(userData) {

        // 경험치 기록 없으면 목표 계산 불가
        if (!userData.expRecords) return [];

        // 이미 사용자가 저장한 목표가 있으면 그걸 그대로 사용
        if (userData.goalTargets && userData.goalTargets.length > 0) {
            return userData.goalTargets;
        }

        // 🔥 현재 경험치 계산 (마지막 기록 기준)
        const dates = Object.keys(userData.expRecords).sort();
        const lastDate = dates[dates.length - 1];
        const currentExp = userData.expRecords[lastDate].exp || 0;

        // 🔥 1억 단위 시작점 계산
        const startUnit = Math.ceil(currentExp / 100000000);
        const startValue = startUnit * 100000000;

        // 목표 배열 생성
        const goals = [];
        for (let i = 0; i < 5; i++) {
            goals.push(startValue + (i * 100000000));
        }

        return goals;
    }

    // ✅ 사용자 전체 데이터 불러오기
    async function loadUserData(nickname) {
        const userRef = ref(db, `coffeeUsers/${nickname}`);
        const snapshot = await get(userRef);

        $("#optionModal, #editModal").remove(); // 중복 방지용

        if (snapshot.exists()) {
            const userData = snapshot.val();
            userData.goalTargets = autoGenerateGoalsForDisplay(userData);

            if (userData.expRecords) {
                // 레벨업 로그 계산
                computeLevelUpLogs(userData.expRecords);

                // 오래된 기록(1년 초과)은 자동 삭제
                // 현재 한국 날짜를 기준으로 계산
                /*
                const now = new Date();
                const koreaNow = new Date(now.getTime());
                const oneYearAgo = new Date(koreaNow.getTime() - 365 * 24 * 60 * 60 * 1000);
                let deletedCount = 0;

                for (const date in userData.expRecords) {
                    const [y, m, d] = date.split("-").map(Number);
                    const recordDate = new Date(y, m - 1, d);
                    if (recordDate < oneYearAgo) {
                        await remove(ref(db, `coffeeUsers/${nickname}/expRecords/${date}`));
                        deletedCount++;
                    }
                }

                if (deletedCount > 0) {
                    showAlert(`1년 이상 지난 기록 ${deletedCount}건이 자동 삭제되었습니다.`);
                }
                */
            }

            // 🔹 레벨 없을 때 레벨 입력 모달 표시
            if (!userData.level) {
                $("#levelModal").css("display", "flex");
                return;
            } else {
                // 1) 프로필 이미지 설정
                profileNum = Number(userData.profileImg) || 1;
                const profile = getSafeProfileById(profileNum);

                // ✅ 동적 생성 대신, 미리 정의된 요소의 src와 text만 변경
                $("#profileDisplay").attr("src", profile.src);

                // 2) 착용 뱃지 설정
                const activeBadgeId = userData.activeBadge || "NONE";
                const badgeIcon = SHOP_DATA.badges[activeBadgeId]?.icon || "";
                $("#activeBadgeDisplay").text(badgeIcon);

                // 3) 닉네임 / 레벨 표시
                $nicknameDisplay.text(`${nickname}`);
                $currentLevelDisplay.text(`${userData.level}`);
            }

            // 🔹 관리자일 경우 관리자 페이지 버튼 표시
            if (userData.isAdmin) {
                const $adminBtn = $('.adminBtn');

                $adminBtn.show();
            }

            // 프로필 관련 조회
            // 🔹 출석 1등 10회 달성 여부 (랭킹 프로필 해금 조건)
            isFirstRank10 = !!userData.isFirst10;

            // 🔹 가입일 기준 경과 일수 계산
            if (userData.signupDate) {
                const raw = userData.signupDate; // "25.10.07-00:00:00"
                const normalized = raw
                    .replace("-", "T")
                    .replace(/^(\d{2})\./, "20$1-")
                    .replace(/\./g, "-")
                    .replace(/T.*/, "T00:00:00");

                const signup = new Date(normalized);
                const today = new Date();
                signup.setHours(0,0,0,0);
                today.setHours(0,0,0,0);

                signupDays = Math.max(
                    Math.floor((today - signup) / (1000 * 60 * 60 * 24)),
                    0
                ) + 1;
            }

            // 🔹 경험치 기록 수
            expRecordCount = userData.expRecords
                ? Object.keys(userData.expRecords).length
                : 0;

            // 🔹 단골 / 일반 해금 계산
            favoriteProgress = Math.min(expRecordCount, signupDays);
            favoriteUnlockLimit = Math.floor(2 + (favoriteProgress + UNLOCK_OFFSET) / UNLOCK_PER_RECORDS);
            normalUnlockLimit = Math.floor((signupDays + UNLOCK_OFFSET) / UNLOCK_PER_RECORDS2);

            // ✅ 로드 시 부캐 버튼 검사
            addSubCharacterButton();

            if (userData.memoryRoomPublic) {
                $(".memoryRoomBtn").show();
            }

            if (userData.expRecords) {
                const records = userData.expRecords;
                const sorted = Object.keys(records).sort();
                const $tbody = $("#expTable tbody");
                $tbody.empty();
                allExpRows = [];

                const pageSize = 10;
                const totalRecords = sorted.length;
                const totalPages = Math.ceil(totalRecords / pageSize);
                let currentPage = 1;

                let prevExp = null;
                let prevLevel = null;
                let prevDate = null;
                let diffs = []; // 🔸 획득 경험치 저장용

                sorted.forEach(date => {
                    const currentExp = records[date].exp || 0;
                    const currentLevel = records[date].level || userData.level;
                    let gained = "-";
                    let approx = "";

                    // 🔹 날짜 포맷 변경
                    const [yyyy, mm, dd] = date.split("-");
                    const formattedDate = `${yyyy.slice(2)}.${mm}.${dd}`;

                    if (prevExp !== null && prevLevel !== null) {
                        // 🔹 두 날짜 사이의 간격 계산
                        const prevD = new Date(prevDate);
                        const curD = new Date(date);
                        const diffDays = Math.floor((curD - prevD) / (1000 * 60 * 60 * 24));

                        let diff = 0;
                        if (currentLevel > prevLevel) {
                            diff += (levelExp[prevLevel] - prevExp);
                            for (let lv = prevLevel + 1; lv < currentLevel; lv++) {
                                diff += levelExp[lv];
                            }
                            diff += currentExp;
                        } else if (currentLevel === prevLevel && currentExp >= prevExp) {
                            diff = currentExp - prevExp;
                        }

                        if (diff > 0) {
                            gained = diff.toLocaleString();
                            const man = Math.floor(diff / 10000);
                            approx = man >= 1 ? `약 ${man}만` : '';
                        } else {
                            gained = "0";
                        }

                        diffs.push(diff);

                        // ✅ 중간 날짜(하루 이상 비었을 때) 0 경험치 추가
                        if (diffDays > 1) {
                            for (let i = 1; i < diffDays; i++) {
                                diffs.push(0);
                            }
                        }
                    }

                    $tbody.prepend(`
                                <tr class="exp-row" data-date="${date}">
                                    <td>${formattedDate}</td>
                                    <td>${currentLevel}</td>
                                    <td>${currentExp.toLocaleString()}</td>
                                    <td>${gained}<br><span style="color:var(--text-danger)">${approx}</span></td>
                                </tr>
                            `);

                    prevExp = currentExp;
                    prevLevel = currentLevel;
                    prevDate = date; // ✅ 이전 날짜 저장

                    allExpRows.push({
                        date,
                        formattedDate,
                        level: currentLevel,
                        exp: currentExp,
                        gained,
                        approx
                    });
                });

                // 🔸 평균 계산 및 전체 레벨업 예정일 표시 (레벨업 시 경험치 0으로 초기화 구조)
                if (Object.keys(records).length > 1 && userData.level) {
                    const today = new Date();

                    // ✅ 평균 경험치 계산 (유틸 사용)
                    const recordArray = Object.keys(records)
                        .sort()
                        .map(date => [date, records[date]]); // [날짜, {level, exp}] 형태로 변환

                    const avgGain = calcAvgExp(recordArray);

                    if (!avgGain || avgGain <= 0 || isNaN(avgGain)) {
                        $("#levelUpBox").html(`<p style="color:var(--text-sub);">최근 경험치 기록이 없습니다.</p>`);
                    } else {
                        // ✅ 최근 기록 및 현재 상태 계산
                        const sortedDates = Object.keys(records).sort();
                        const latestDate = sortedDates[sortedDates.length - 1];
                        const latestRecord = records[latestDate];
                        const currentLevel = userData.level;
                        const currentExp = latestRecord.exp || 0;

                        // ✅ 마지막 경험치 입력일 기준으로 계산하도록 수정
                        const latestDateObj = new Date(latestDate);
                        const koreaNow = new Date(latestDateObj.getTime());

                        // ✅ 평균값 출력
                        if (avgGain < 10000) {
                            $("#avgExp").html(`${Math.floor(avgGain).toLocaleString()}`);
                        } else {
                            const man = Math.floor(avgGain / 10000);
                            $("#avgExp").html(`${Math.floor(avgGain).toLocaleString()}<br>( 약 ${man}만 )`);
                        }

                        // ✅ 남은 경험치 계산 및 표시
                        if (userData.level < levelExp.length) {
                            progressMode = "level";
                            // 일반 레벨업 모드
                            const nextNeedExp = levelExp[userData.level]; // 다음 레벨까지 필요한 총 경험치
                            remainExp = Math.max(nextNeedExp - currentExp, 0);

                            // ✅ 남은 경험치 퍼센트 계산
                            const percent = ((remainExp / nextNeedExp) * 100).toFixed(1);
                            $(".status-percent").text(`( ${percent}% )`);

                            let approx = "";
                            if (remainExp >= 100000000) { // 1억 이상
                                const eok = Math.floor(remainExp / 100000000);
                                approx = `( 약 ${eok.toLocaleString()}억 )`;
                            } else if (remainExp >= 10000) { // 1만 이상
                                const man = Math.floor(remainExp / 10000);
                                approx = `( 약 ${man.toLocaleString()}만 )`;
                            }

                            $("#curExp").html(`${remainExp.toLocaleString()}<br>${approx}`);

                            updateExpBar(currentExp, nextNeedExp);
                            updateTotalProgress(records, currentLevel, currentExp);
                        } else if (userData.goalTargets?.length > 0) {
                            progressMode = "goal";
                            // 만렙 + 목표 경험치 모드
                            const goalTargets = userData.goalTargets.sort((a, b) => a - b);
                            const nextGoal = goalTargets.find(g => g > currentExp);

                            if (nextGoal) {
                                remainExp = Math.max(nextGoal - currentExp, 0);

                                let approx = "";
                                if (remainExp >= 100000000) {
                                    const eok = Math.floor(remainExp / 100000000);
                                    approx = `( 약 ${eok.toLocaleString()}억 )`;
                                } else if (remainExp >= 10000) {
                                    const man = Math.floor(remainExp / 10000);
                                    approx = `( 약 ${man.toLocaleString()}만 )`;
                                }

                                $("#curExp").html(`${remainExp.toLocaleString()}<br>${approx}`);
                            } else {
                                $("#curExp").html("달성완료");
                            }
                        }

                        const toDay = new Date();
                        toDay.setHours(0, 0, 0, 0); // 오늘 00:00:00 으로 고정

                        // ✅ 만렙이면 목표 기준 테이블, 아니면 레벨업 테이블
                        if (userData.level >= levelExp.length && userData.goalTargets?.length > 0 && avgGain > 0) {
                            $("#levelUpBox").empty();
                            const goalTargets = userData.goalTargets.sort((a, b) => a - b);

                            let goalTable = `
                                    <table style="width:100%; border-collapse:collapse; font-size:14px;">
                                        <thead>
                                            <tr style="background:var(--bg-sub); color:var(--primary);">
                                                <th style="padding:8px; border:1px solid var(--border-main);">목표</th>
                                                <th style="padding:8px; border:1px solid var(--border-main);">D-day</th>
                                                <th style="padding:8px; border:1px solid var(--border-main);">예상 도달일</th>
                                            </tr>
                                        </thead>
                                    <tbody>
                                `;

                            goalTargets
                                .filter(goal => goal > currentExp)
                                .forEach(goal => {
                                    const remainForGoal = Math.max(goal - currentExp, 0);
                                    const daysNeeded = Math.ceil(remainForGoal / avgGain);
                                    const estDate = new Date(koreaNow);
                                    estDate.setDate(koreaNow.getDate() + daysNeeded);
                                    const yyyy = estDate.getFullYear();
                                    const mm = String(estDate.getMonth() + 1).padStart(2, "0");
                                    const dd = String(estDate.getDate()).padStart(2, "0");
                                    estDate.setHours(0, 0, 0, 0);
                                    const dDay = Math.ceil((estDate - toDay) / (1000 * 60 * 60 * 24));

                                    let formattedGoal = goal < 10000
                                        ? goal.toLocaleString()
                                        : goal < 100000000
                                            ? `${Math.floor(goal / 10000)}만`
                                            : `${parseFloat((goal / 100000000).toFixed(1))}억`;

                                    goalTable += `
                                            <tr>
                                               <td style="padding:8px; border:1px solid var(--border-main);">${formattedGoal}</td>
                                               <td style="padding:8px; border:1px solid var(--border-main);">${dDay > 0 ? 'D-' + dDay : dDay === 0 ? 'D-day' : '-'}</td>
                                               <td style="padding:8px; border:1px solid var(--border-main);">${yyyy}-${mm}-${dd}</td>
                                            </tr>`;

                                });

                            goalTable += `</tbody></table>`;
                            $("#levelUpBox").append(goalTable);

                        } else {
                            // 🔹 일반 레벨업 테이블 (기존 구조 유지)
                            let tableHTML = `
                                    <table style="width:100%; border-collapse:collapse; font-size:14px;">
                                        <thead>
                                            <tr style="background:var(--bg-sub); color:var(--primary);">
                                                <th style="padding:8px; border:1px solid var(--border-main);">목표 레벨</th>
                                                <th style="padding:8px; border:1px solid var(--border-main);">D-day</th>
                                                <th style="padding:8px; border:1px solid var(--border-main);">예상 도달일</th>
                                            </tr>
                                        </thead>
                                    <tbody>
                                `;

                            let accumulatedExp = 0;
                            let curExp = currentExp;
                            const maxLevel = Math.min(currentLevel + 5, levelExp.length);

                            for (let lvl = currentLevel; lvl < maxLevel; lvl++) {
                                const needExp = levelExp[lvl];
                                if (!needExp) break;
                                accumulatedExp += Math.max(needExp - curExp, 0);
                                const daysNeeded = Math.ceil(accumulatedExp / avgGain);
                                const estDate = new Date(koreaNow);
                                estDate.setDate(koreaNow.getDate() + daysNeeded);
                                const yyyy = estDate.getFullYear();
                                const mm = String(estDate.getMonth() + 1).padStart(2, "0");
                                const dd = String(estDate.getDate()).padStart(2, "0");
                                estDate.setHours(0, 0, 0, 0);
                                const dDay = Math.ceil((estDate - toDay) / (1000 * 60 * 60 * 24));

                                if (dDay === 0) await showFireworkCelebration();
                                if (dDay === 0 || dDay === 1) {
                                    const targetDate = new Date();
                                    targetDate.setDate(targetDate.getDate() + dDay);
                                    const y = targetDate.getFullYear();
                                    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
                                    const d = String(targetDate.getDate()).padStart(2, '0');
                                    const targetStr = `${y}-${m}-${d}`;
                                    const nickname = $('#nicknameDisplay').text().trim();

                                    const dateRef = ref(db, `coffeeLevelUpToday/${targetStr}`);
                                    try {
                                        const snap = await get(dateRef);
                                        let list = snap.exists() ? snap.val() : [];
                                        if (!Array.isArray(list)) list = Object.values(list);
                                        if (!list.includes(nickname)) {
                                            list.push(nickname);
                                            await set(dateRef, list);
                                            console.log(`✅ D-day 목록 저장 완료: ${targetStr} / ${nickname}`);
                                        }
                                    } catch (err) {
                                        console.error("레벨업 D-day 저장 중 오류:", err);
                                    }
                                }

                                tableHTML += `
                                        <tr>
                                            <td style="padding:8px; border:1px solid var(--border-main);">${lvl + 1}레벨</td>
                                            <td style="padding:8px; border:1px solid var(--border-main);">${dDay > 0 ? 'D-' + dDay : dDay === 0 ? 'D-day' : '-'}</td>
                                            <td style="padding:8px; border:1px solid var(--border-main);">${yyyy}-${mm}-${dd}</td>
                                        </tr>
                                    `;
                                curExp = 0;
                            }
                            tableHTML += `</tbody></table>`;
                            $("#levelUpBox").html(tableHTML);
                        }
                    }
                } else {
                    $("#levelUpBox").html(`<p style="color:var(--text-sub);">계산할 데이터가 부족합니다...<br> 내일도 입력 부탁드려요~!</p>`);
                }

                // ============================
                // ✅ (1) 옵션 선택 모달 추가
                // ============================
                const optionModal = $(`
                            <div id="optionModal" class="login-overlay" style="display:none;">
                                <div class="login-modal">
                                    <h3>옵션을 선택해주세요</h3>
                                    <button id="editExpBtn">수정</button>
                                    <button id="deleteExpBtn">삭제</button>
                                    <button id="closeOptionBtn">닫기</button>
                                </div>
                            </div>
                        `);

                $("body").append(optionModal);

                // ============================
                // ✅ (2) 수정 모달 추가
                // ============================
                const editModal = $(`
                            <div id="editModal" class="login-overlay" style="display:none;">
                                <div class="login-modal" style="position:relative; width:360px;">
                                    <button id="closeEditModal" class="closeBtn">✕</button>
                                    <h2>경험치 수정</h2>
                                    <label style="display:block; text-align:left; color:var(--text-sub);">날짜</label>
                                    <input id="editExpDate" type="date" style="margin-bottom:10px;">
                                    <label style="display:block; text-align:left; color:var(--text-sub);">현재 레벨</label>
                                    <input id="editLevelValue" type="number" min="1" style="margin-bottom:10px;">
                                    <label style="display:block; text-align:left; color:var(--text-sub);">현재 경험치</label>
                                    <input id="editExpValue" type="text" inputmode="numeric" style="margin-bottom:10px;">
                                    <button id="updateExpBtn">저장</button>
                                </div>
                            </div>
                        `);
                $("body").append(editModal);

                latestExpRecords = userData.expRecords; // ✅ 최근 기록 캐싱

                // ✅ 버튼 초기 텍스트 설정
                if (chartMode === 'total') {
                    $("#toggleChartBtn").text("획득 경험치");
                } else if (chartMode === 'gain') {
                    $("#toggleChartBtn").text("숨기기");
                } else {
                    $("#toggleChartBtn").text("그래프");
                    $("#expChart").closest("div").hide();
                }

                renderExpChart(userData.expRecords); // ✅ 최근 10일 그래프 표시
            } else {
                $("#levelUpBox").html(`<p style="color:var(--text-sub);">상단의 입력 버튼을 눌러<br>오늘의 경험치를 기록해보세요..!</p>`);
            }

            // ✅ 아카이브 공개 토글 스위치 상태 반영
            const $toggle = $("#rankingToggle");
            if (userData.rankingPublic) {
                $toggle.addClass("on");
            } else {
                $toggle.removeClass("on");
            }

            // ✅ 클릭 시 상태 토글
            $toggle.off("click").on("click", async function () {
                const nickname = getActiveNickname();
                const isCurrentlyOn = $toggle.hasClass("on");
                const newStatus = !isCurrentlyOn;

                if (newStatus) {
                    // 🔹 공개로 전환하려 할 때
                    showConfirm(
                        "내 정보가 공개되며,\n다른 회원의 정보도 확인할 수 있습니다.",
                        async (ok) => {
                            if (ok) {
                                $toggle.addClass("on");
                                await set(ref(db, `coffeeUsers/${nickname}/rankingPublic`), true);
                                addRankingButton();
                            }
                        }
                    );
                } else {
                    // 🔹 비공개 전환 시
                    showConfirm(
                        "내 정보가 비공개되며,\n다른 회원의 정보도 확인할 수 없습니다.",
                        async (ok) => {
                            if (ok) {
                                $toggle.removeClass("on");
                                await set(ref(db, `coffeeUsers/${nickname}/rankingPublic`), false);
                                removeRankingButton();
                            }
                        }
                    );
                }
            });

            $(document).trigger("dataLoaded", [nickname]);
        } else {
            console.log("불러올 데이터가 없습니다.");
        }

        // ================================
        // ✅ 최근 10일 꺾은선 그래프 렌더링 (획득 ↔ 누적 토글 가능)
        // ================================
        function interpolateRange(expMap, allDates) {
            let lastKnownIndex = null; // 마지막으로 값이 있던 인덱스

            for (let i = 0; i < allDates.length; i++) {
                const d = allDates[i];

                if (expMap[d]) {
                    // 현재 날짜에 값이 있으면 lastKnownIndex 업데이트
                    lastKnownIndex = i;
                    continue;
                }

                // 값이 없는 날짜일 때 → 오른쪽에서 다음 known 탐색
                let nextKnownIndex = null;
                for (let j = i + 1; j < allDates.length; j++) {
                    if (expMap[allDates[j]]) {
                        nextKnownIndex = j;
                        break;
                    }
                }

                // 좌/우 모두 값이 있어야 보간 가능
                if (lastKnownIndex !== null && nextKnownIndex !== null) {
                    const startDate = allDates[lastKnownIndex];
                    const endDate = allDates[nextKnownIndex];

                    const startVal = expMap[startDate].total;
                    const endVal = expMap[endDate].total;

                    const totalGap = nextKnownIndex - lastKnownIndex;
                    const pos = i - lastKnownIndex;

                    const value = Math.floor(
                        startVal + (endVal - startVal) * (pos / totalGap)
                    );

                    expMap[d] = {total: value, gain: 0};
                }
            }
        }

        function renderExpChart(records) {
            const today = new Date();
            const thisYear = today.getFullYear();

            // 🔁 오늘 날짜를 YYYY-MM-DD 로 생성
            const todayYMD = `${thisYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            // 🔁 기존 데이터 호환: records 키가 YYYY-MM-DD 이거나 MM-DD 일 수 있음
            const hasTodayRecord = !!records[todayYMD] || !!records[todayYMD.slice(5)];

            const baseDate = hasTodayRecord
                ? new Date(thisYear, today.getMonth(), today.getDate())
                : new Date(thisYear, today.getMonth(), today.getDate() - 1);

            // 🔁 연도 정보를 포함한 expMap (키: YYYY-MM-DD)
            const expMap = {};
            const sortedDates = Object.keys(records).sort();
            sortedDates.forEach(date => {
                const {level, exp} = records[date];

                // 1) 해당 날짜 기준 누적 경험치 계산
                let total = 0;

                // LV1 → (LV-1) 까지 모두 더함
                for (let lv = 1; lv < level; lv++) {
                    total += levelExp[lv];
                }

                // 마지막 레벨에서 현재 exp 더하기
                total += exp;

                // 2) 증가량(gain) 계산
                expMap[date] = {
                    total,
                    gain: 0  // 뒤에서 다시 계산
                };
            });

            // allDates를 먼저 10일 기준으로 만들고
            const allDates10 = [];
            for (let i = 9; i >= 0; i--) {
                const d = new Date(baseDate);
                d.setDate(baseDate.getDate() - i);
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                allDates10.push(`${yyyy}-${mm}-${dd}`);
            }

            const graphStart = allDates10[0];  // 예: 2025-11-09

            // graphStart 이전 실제 기록 찾아라 (YYYY-MM-DD 문자열이면 연대순 정렬 OK)
            const expKeys = Object.keys(expMap).sort();
            const prevDates = expKeys.filter(d => d < graphStart);

            const prevLast = prevDates.length > 0
                ? prevDates[prevDates.length - 1]
                : graphStart;

            const firstDate = prevLast;
            const [fy, fm, fd] = firstDate.split('-').map(Number);
            const allDates = [];

            let cur = new Date(fy, fm - 1, fd);
            const end = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());

            while (cur <= end) {
                const yyyy = cur.getFullYear();
                const mm = String(cur.getMonth() + 1).padStart(2, '0');
                const dd = String(cur.getDate()).padStart(2, '0');
                allDates.push(`${yyyy}-${mm}-${dd}`);
                cur.setDate(cur.getDate() + 1);
            }

            // console.log(expMap);
            // console.log(allDates);
            interpolateRange(expMap, allDates);

            // 3) 증가량 gain 재계산
            const orderedKeys = Object.keys(expMap).sort((a, b) => {
                // 🔁 연도/월/일 모두 포함해서 정렬
                const [ay, am, ad] = a.split('-').map(Number);
                const [by, bm, bd] = b.split('-').map(Number);

                if (ay !== by) return ay - by;
                if (am !== bm) return am - bm;
                return ad - bd;
            });

            let prev = null;
            for (const d of orderedKeys) {
                if (prev === null) {
                    expMap[d].gain = 0;
                } else {
                    expMap[d].gain = Math.max(expMap[d].total - prev.total, 0);
                }
                prev = expMap[d];
            }

            // 🔹 그래프 데이터
            const lastDates = allDates.slice(-10);

            const labels = lastDates;
            const values = lastDates.map(d => {
                const rec = expMap[d];
                return rec ? (chartMode === 'total' ? rec.total : rec.gain) : 0;
            });
            // console.log(values);

            // 🔹 Chart.js
            const ctx = document.getElementById('expChart');
            if (!ctx) return;
            if (window.expChartInstance) window.expChartInstance.destroy();

            const labelName = chartMode === 'gain' ? '획득 경험치' : '누적 경험치';
            const color = chartMode === 'gain' ? `var(--primary)` : `var(--primary-dark)`;

            window.expChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels.map(d => d.split('-')[2]),
                    datasets: [{
                        label: labelName,
                        data: values,
                        borderColor: color,
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: color
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {display: false},
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    const value = ctx.raw;
                                    return `${formatKoreanNumber(value)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                color: color,
                                callback: v => {
                                    if (v >= 100000000) {
                                        // 🔹 1억 이상이면 억 단위로 표시 (소수점 한 자리)
                                        return (v / 100000000)
                                            .toFixed(1)
                                            .replace(/\.0$/, '') + '억';
                                    } else if (v >= 10000) {
                                        // 🔹 1만 이상이면 만 단위로 표시
                                        return (v / 10000)
                                            .toFixed(1)
                                            .replace(/\.0$/, '') + '만';
                                    } else {
                                        // 🔹 그 외는 일반 숫자
                                        return v.toLocaleString();
                                    }
                                }
                            },
                            grid: {color: `var(--border-sub)`}
                        },
                        x: {grid: {display: false}, ticks: {color: `var(--text-sub)`}}
                    }
                }
            });
        }

        // ✅ 누적 ↔ 획득 ↔ 숨김 전환 버튼
        $(document).on("click", "#toggleChartBtn", function () {
            if (!latestExpRecords) return;

            const $chartCanvas = $("#expChart");
            const $chartContainer = $chartCanvas.closest("div"); // 상위 div 같이 숨기기

            if (chartMode === "total") {
                chartMode = "gain";
                $(this).text("숨기기");
                localStorage.setItem("chartMode", chartMode);
                renderExpChart(latestExpRecords);
                $chartContainer.show();

            } else if (chartMode === "gain") {
                chartMode = "hide";
                $(this).text("그래프");
                localStorage.setItem("chartMode", chartMode);
                if (window.expChartInstance) window.expChartInstance.destroy();
                $chartContainer.hide();

            } else { // chartMode === "hide"
                chartMode = "total";
                $(this).text("획득 경험치");
                localStorage.setItem("chartMode", chartMode);
                $chartContainer.show();
                renderExpChart(latestExpRecords);
            }
        });

        // ✅ 경험치바 업데이트
        function updateExpBar(currentExp, nextNeedExp) {
            const percent = Math.min((currentExp / nextNeedExp) * 100, 100).toFixed(1);
            // ✅ 게이지 채우기
            $("#expBarFill").css("width", `${percent}%`);

            // ✅ 게이지 위 퍼센트 표시
            $("#expBarPercent").text(`${percent}%`);
        }

        function updateTotalProgress(records, currentLevel, currentExp) {
            if (!records) return;

            // 1) 경험치
            let totalNeed = 0;
            let accumulated = 0;
            for (let i = 1; i < levelExp.length; i++) {
                totalNeed += levelExp[i];
                if (i < currentLevel) accumulated += levelExp[i];      // LV1~(LV-1)까지 총합
            }

            accumulated += currentExp; // 현재 레벨 exp 포함

            // 2) 퍼센트 계산
            const percent = Math.min((accumulated / totalNeed) * 100, 100).toFixed(1);

            // 3) 보기 좋게 포맷
            let accumDisplay = "";
            if (accumulated >= 100000000) {
                accumDisplay = `(누적 : 약 ${Math.floor(accumulated / 100000000)}억)`;
            } else if (accumulated >= 10000) {
                accumDisplay = `(누적 : 약 ${Math.floor(accumulated / 10000)}만)`;
            } else {
                accumDisplay = `(누적 : ${accumulated.toLocaleString()})`;
            }

            // 4) 화면 업데이트
            $("#totalProgressPercent").text(`${percent}%`);
            $("#totalProgressAccum").text(` ${accumDisplay}`);
            $("#totalProgressBarFill").css("width", `${percent}%`);
        }

    }

    // ✅ 레벨 입력 모달 저장 버튼
    $(document).on("click", "#saveLevelConfirmBtn", async function () {
        const nickname = getActiveNickname();
        const levelVal = parseInt($("#levelInput").val());

        if (!nickname) return showAlert("로그인 후 이용해주세요.");
        if (!levelVal || levelVal < 1 || levelVal > MAX_LEVEL) return showAlert(`1~${MAX_LEVEL} 사이의 값을 입력하세요.`);

        await set(ref(db, `coffeeUsers/${nickname}/level`), levelVal);
        showAlert(`레벨 ${levelVal}이(가) 저장되었습니다!`);
        $("#levelModal").hide();

        // 입력 후 바로 다시 데이터 갱신
        await loadUserData(nickname);
    });

    // ✅ 삭제 버튼 클릭 시
    $(document).on("click", "#deleteExpBtn", async function () {
        const nickname = getActiveNickname();
        if (!nickname || !selectedDate) return;
        $("#optionModal").hide();
        showConfirm(`${selectedDate} 데이터를 삭제할까요?`, async (ok) => {
            if (ok) {
                // ✅ 선택한 기록 삭제
                await remove(ref(db, `coffeeUsers/${nickname}/expRecords/${selectedDate}`));

                // ✅ 남은 기록 중 가장 최근 날짜의 레벨을 다시 불러와서 회원 레벨 갱신
                const recordsRef = ref(db, `coffeeUsers/${nickname}/expRecords`);
                const snapshot = await get(recordsRef);

                if (snapshot.exists()) {
                    const records = snapshot.val();
                    const dates = Object.keys(records).sort(); // 날짜 오름차순 정렬
                    const lastDate = dates[dates.length - 1]; // 가장 최근 날짜
                    const latestLevel = records[lastDate].level;

                    // 🔹 회원 레벨을 최신 기록의 레벨로 갱신
                    await set(ref(db, `coffeeUsers/${nickname}/level`), latestLevel);
                } else {
                    // 🔹 모든 기록이 삭제된 경우, 레벨 초기화
                    await set(ref(db, `coffeeUsers/${nickname}/level`), 1);
                }

                showAlert("삭제되었습니다!");
                $("#optionModal").hide();
                await loadUserData(nickname);
            }
        });
    });

    // ✅ 수정 저장 버튼 (쉼표 제거 후 저장)
    $(document).on("click", "#updateExpBtn", async function () {
        const nickname = getActiveNickname();
        const newLevel = parseInt($("#editLevelValue").val());
        const newExp = parseInt($("#editExpValue").val().replace(/,/g, "")); // ✅ 쉼표 제거
        const newDate = $("#editExpDate").val();

        if (!nickname) return showAlert("로그인 후 이용해주세요.");
        if (!newDate || isNaN(newExp) || newLevel < 1 || newLevel > MAX_LEVEL) return showAlert("값이 올바르지 않습니다.");
        if (!validateDateNotFuture(newDate)) return;

        // 🔹 기존 선택된 날짜(selectedDate)는 loadUserData 내부에서 전역변수로 선언되어 있음
        if (newDate !== selectedDate) {
            // ✅ 날짜가 변경된 경우: 새로 저장 후 기존 삭제
            const oldRef = ref(db, `coffeeUsers/${nickname}/expRecords/${selectedDate}`);
            const newRef = ref(db, `coffeeUsers/${nickname}/expRecords/${newDate}`);

            await set(newRef, {level: newLevel, exp: newExp, savedAt: getKoreanTimestamp()});
            await remove(oldRef);
        } else {
            // ✅ 날짜가 그대로면 단순 수정
            const refPath = ref(db, `coffeeUsers/${nickname}/expRecords/${newDate}`);
            await set(refPath, {level: newLevel, exp: newExp, savedAt: getKoreanTimestamp()});
        }

        showAlert(`레벨 ${newLevel}\n경험치 ${newExp.toLocaleString()}(으)로 수정되었습니다!`);

        // 🔹 현재 표시 중인 레벨 가져오기
        const currentLevelVal = parseInt($("#currentLevelDisplay").text()) || 1;

        // 🔹 새로 입력한 레벨이 기존보다 높을 때만 갱신
        if (newLevel > currentLevelVal) {
            await set(ref(db, `coffeeUsers/${nickname}/level`), newLevel);
        }

        $("#editModal").hide();
        await loadUserData(nickname);
    });

    // ✅ 목표 설정 버튼 함수
    function addGoalButton() {
        if ($("#goalBtn").length > 0) return; // 중복 방지

        const goalBtn = $('<button id="goalBtn">목표 설정</button>');
        $("#settingsDropdown").prepend(goalBtn);

        // 클릭 시 모달 열기
        goalBtn.on("click", async () => {
            const nickname = getActiveNickname();
            if (!nickname) return showAlert("로그인 후 이용해주세요.");

            const goalRef = ref(db, `coffeeUsers/${nickname}/goalTargets`);
            const snapshot = await get(goalRef);
            const savedGoals = snapshot.exists() ? snapshot.val() : [];

            // 기존 모달 제거 후 새로 생성
            $("#goalModal").remove();

            const modal = $(`
                        <div id="goalModal" class="login-overlay">
                            <div class="login-modal" style="position:relative;">
                                <button id="closeGoalModal" class="closeBtn">✕</button>
                                <h2>목표 설정</h2>
                                <div id="goalInputs" style="margin-bottom:10px;"></div>
                                <button id="saveGoalBtn">저장</button>
                            </div>
                        </div>
                    `);

            $("body").append(modal);

            // 입력창 5개 생성 (쉼표 포함)
            const $goalInputs = $("#goalInputs");
            for (let i = 0; i < 5; i++) {
                const val = savedGoals[i] ? savedGoals[i].toLocaleString() : "";
                $goalInputs.append(`
                            <input type="text" class="goalInput" placeholder="목표 경험치 ${i + 1}" value="${val}"
                                   style="width:100%; padding:8px; margin-bottom:8px;
                                   font-size:16px; border:1px solid var(--text-sub); border-radius:6px;">
                        `);
            }

            // ✅ 실시간 쉼표 포맷 + 상한(1조) 체크
            $(document).off("input", ".goalInput").on("input", ".goalInput", function () {
                bindNumericCommaFormatter(".goalInput", 1_000_000_000_000, "목표 경험치는 최대 1조까지 입력할 수 있어요.");
            });

            // 닫기 버튼
            $(document).off("click", "#closeGoalModal").on("click", "#closeGoalModal", function () {
                $("#goalModal").remove();
            });

            // 저장 버튼 클릭
            $(document).off("click", "#saveGoalBtn").on("click", "#saveGoalBtn", async function () {
                const values = $(".goalInput").map((_, el) => {
                    const raw = $(el).val().replace(/,/g, ""); // 쉼표 제거
                    const num = parseInt(raw);
                    return isNaN(num) ? null : num;
                }).get();

                const filtered = values.filter(v => v !== null);
                if (!validateUniqueGoals(filtered)) return;
                if (filtered.length === 0) {
                    showAlert("목표를 하나 이상 입력해주세요.");
                    return;
                }

                // 오름차순 정렬
                const sorted = filtered.sort((a, b) => a - b);

                await set(ref(db, `coffeeUsers/${nickname}/goalTargets`), sorted);
                showAlert("목표 경험치가 저장되었습니다!");
                $("#goalModal").remove();

                await loadUserData(nickname);
            });
        });
    }

    // ✅ 만렙이면 목표 등록 버튼 활성화
    async function checkGoalButtonCondition(nickname) {
        const levelRef = ref(db, `coffeeUsers/${nickname}/level`);
        const snapshot = await get(levelRef);
        if (!snapshot.exists()) return;

        const currentLevel = snapshot.val() || 1;
        const maxLevel = levelExp.length; // levelExp 배열 길이 기준으로 계산

        if (currentLevel >= maxLevel) {
            addGoalButton();
        } else {
            $("#progressWrapper").css("display", "flex");
        }
    }

    // ✅ 로그인 또는 데이터 로드 시 호출
    $(document).on("dataLoaded", function (e, nickname) {
        checkGoalButtonCondition(nickname);
    });

    // ✅ 닉네임 변경 모달 열기
    $(document).on("click", ".changeNicknameBtn", async function () {
        const nickname = getActiveNickname();
        if (!nickname) return showAlert("로그인 후 이용해주세요.");

        // 기존 모달 제거 후 새로 생성
        $("#nicknameModal").remove();
        const modal = $(`
                    <div id="nicknameModal" class="login-overlay">
                        <div class="login-modal" style="position:relative;">
                            <button id="closeNicknameModal" class="closeBtn">✕</button>
                            <h2>닉네임 변경</h2>
                            <input id="newNicknameInput" type="text" value="${nickname}"
                                   style="width:100%; padding:10px; margin-bottom:10px; border:1px solid var(--border-sub); border-radius:6px; font-size:16px;">
                            <button id="saveNicknameBtn">저장</button>
                        </div>
                    </div>
                `);
        $("body").append(modal);

        // 닫기 버튼
        $(document).off("click", "#closeNicknameModal").on("click", "#closeNicknameModal", function () {
            $("#nicknameModal").remove();
        });

        // 저장 버튼
        $(document).off("click", "#saveNicknameBtn").on("click", "#saveNicknameBtn", async function () {
            const newNick = $("#newNicknameInput").val().trim();
            if (!newNick) return showAlert("새 닉네임을 입력해주세요.");
            if (!validateNickname(newNick)) return;
            if (newNick === nickname) return showAlert("기존 닉네임과 동일합니다.");

            const dbRef = ref(db, `coffeeUsers/${nickname}`);
            const snapshot = await get(dbRef);
            if (!snapshot.exists()) return showAlert("계정 정보를 불러올 수 없습니다.");
            const userData = snapshot.val();

            const newRef = ref(db, `coffeeUsers/${newNick}`);
            const checkSnap = await get(newRef);
            if (checkSnap.exists()) {
                showAlert("이미 존재하는 닉네임입니다.");
                return;
            }

            // ✅ 닉네임 변경 로그 저장
            const safeTimestamp = getKoreanTimestamp().replaceAll(/[.:]/g, '_');
            const randomSuffix = Math.floor(Math.random() * 100); // 0~99
            const logKey = `${safeTimestamp}_${randomSuffix}`;

            const logRef = ref(db, `coffeeUsersLogs/nickChanges/${logKey}`);
            const logText = `${nickname}가 ${newNick}로 변경되었습니다`;
            await set(logRef, logText);

            // ✅ coffeeUsers 이동
            await set(newRef, userData);
            await remove(dbRef);

            // ✅ coffeeUsersId도 업데이트
            const userId = userData.id;
            await set(ref(db, `coffeeUsersId/${userId}`), newNick);

            // ✅ coffeeMemory 데이터도 같이 이동
            const memoryRef = ref(db, `coffeeMemory/${nickname}`);
            const memorySnap = await get(memoryRef);
            if (memorySnap.exists()) {
                const memoryData = memorySnap.val();
                const newMemoryRef = ref(db, `coffeeMemory/${newNick}`);
                await set(newMemoryRef, memoryData);
                await remove(memoryRef);
            }

            setActiveNickname(newNick);
            showAlert("닉네임이 변경되었습니다!");
            $("#nicknameModal").remove();
            location.reload();
        });
    });

    // ✅ 비밀번호 변경 모달 열기
    $(document).on("click", ".changePasswordBtn", async function () {
        const nickname = getActiveNickname();
        if (!nickname) return showAlert("로그인 후 이용해주세요.");

        // 기존 모달 제거 후 새로 생성
        $("#passwordModal").remove();
        const modal = $(`
                    <div id="passwordModal" class="login-overlay">
                        <div class="login-modal" style="position:relative;">
                            <button id="closePasswordModal" class="closeBtn">✕</button>
                            <h2>비밀번호 변경</h2>
                            <input id="newPasswordInput" type="password" placeholder="새 비밀번호 입력 (4자 이상)"
                                   style="width:100%; padding:10px; margin-bottom:10px; border:1px solid var(--border-sub); border-radius:6px; font-size:16px;">
                            <button id="savePasswordBtn">저장</button>
                        </div>
                    </div>
                `);
        $("body").append(modal);

        // 닫기 버튼
        $(document).off("click", "#closePasswordModal").on("click", "#closePasswordModal", function () {
            $("#passwordModal").remove();
        });

        // 저장 버튼
        $(document).off("click", "#savePasswordBtn").on("click", "#savePasswordBtn", async function () {
            const newPassword = $("#newPasswordInput").val().trim();
            if (!newPassword) return showAlert("새 비밀번호를 입력해주세요.");
            if (!validatePassword(newPassword)) return;

            await set(ref(db, `coffeeUsers/${nickname}/password`), newPassword);
            showAlert("비밀번호가 변경되었습니다!");
            $("#passwordModal").remove();
        });
    });
});

let signupDays = 0; // 가입 후 경과 일수
let expRecordCount = 0; // 경험치 기록 개수 (expRecords 수)
let favoriteProgress = 0; // 단골 해금 진행도 = min(기록 수, 가입일)
let favoriteUnlockLimit = 0; // 단골 프로필 해금 가능 개수
let normalUnlockLimit = 0; // 일반 프로필 해금 가능 개수 (가입일 기준)
const UNLOCK_PER_RECORDS = 7; // 프로필 해금 비율 (예: 기록 n개당 1개 해금)
const UNLOCK_PER_RECORDS2 = UNLOCK_PER_RECORDS * 2; // 프로필 해금 비율 (예: 기록 n개당 1개 해금)
const UNLOCK_OFFSET = 1 // 유저 약속 보정

function renderProfileList(list, type, unlockLimit, progressValue) {
    const $container = $("#profileImageContainer");
    $container.empty();

    list.forEach((p, index) => {
        let isLocked = false;
        let lockMessage = "";
        const unlockIndex = index + 1;

        if (type === "favorite") { // 단골
            isLocked = unlockIndex > unlockLimit;
            const nextUnlock = (unlockIndex - 2) * UNLOCK_PER_RECORDS;
            const remain = Math.max(nextUnlock - progressValue - UNLOCK_OFFSET, 0);
            lockMessage =
                `${p.name}(은)는 아직 해금되지 않았어요!\n\n` +
                `현재 기록 : ${progressValue}개\n` +
                `${remain}개 더 입력하면 해금돼요!`;
        }

        if (type === "normal") {
            isLocked = unlockIndex > normalUnlockLimit;

            const nextUnlock = unlockIndex * UNLOCK_PER_RECORDS2;
            const remain = Math.max(nextUnlock - signupDays - UNLOCK_OFFSET, 0);

            lockMessage =
                `${p.name}(은)는 아직 해금되지 않았어요!\n\n` +
                `가입 ${signupDays}일차\n` +
                `${remain}일 더 지나면 해금돼요!`;
        }

        if (type === "rank") { // 랭킹
            isLocked = !isFirstRank10;
            lockMessage =
                `${p.name}(은)는 아직 해금되지 않았어요!\n\n` +
                `⭐ 출석 1등을 10회 이상 달성하면 해금됩니다!`;
        }

        const safe = getSafeProfileById(p.id);
        const img = $(`
            <div style="position:relative;">
                <img src="${safe.src}" alt="${safe.name}">
                ${isLocked ? `<div class="lock-overlay">🔒</div>` : ""}
            </div>
        `);

        img.find("img").css({
            width: "55px",
            height: "55px",
            borderRadius: "50%",
            objectFit: "cover",
            cursor: isLocked ? "not-allowed" : "pointer",
            border: Number(p.id) === Number(profileNum) ? `3px solid var(--primary)` : `2px solid var(--bg-sub)`,
            filter: isLocked ? "grayscale(100%) brightness(80%)" : "none"
        });

        if (!isLocked) {
            img.on("click", () => {
                $("#profileImageContainer img").css("border", `2px solid var(--border-sub)`);
                img.find("img").css("border", `3px solid var(--primary)`);
                const safe = getSafeProfileById(p.id);
                $("#currentProfileImg").attr("src", safe.src);
                $("#currentProfileName").text(safe.name);
                $("#applyProfileBtn").data("selected", p.id);
            });
        } else {
            img.on("click", () => showAlert(lockMessage));
        }

        $container.append(img);
    });
}

$(document).on("click", ".profile-tab", function () {
    $(".profile-tab").removeClass("active");
    $(this).addClass("active");

    const tab = $(this).data("tab");

    if (tab === "favorite") {
        renderProfileList(PROFILE_GROUPS.favorite, "favorite", favoriteUnlockLimit, favoriteProgress);
    }

    if (tab === "normal") {
        renderProfileList(PROFILE_GROUPS.normal, "normal", normalUnlockLimit, signupDays);
    }

    if (tab === "rank") {
        renderProfileList(PROFILE_GROUPS.rank, "rank", 0, 0);
    }
});

// ✅ 닉네임 앞의 프로필 클릭 시 모달 열기
$(document) .off("click", ".user-profile-wrap") .on("click", ".user-profile-wrap", async function () {
    // 현재 프로필 표시
    const current = getSafeProfileById(profileNum);

    $("#currentProfileImg").attr("src", current.src);
    $("#currentProfileName").text(current.name);

    const currentBadge = $("#activeBadgeDisplay").text();
    $("#modalBadgeDisplay").text(currentBadge);

    // 이미지 목록 채우기
    const $container = $("#profileImageContainer");
    $container.empty();

    $("#profileModal").css("display", "flex");
    $(".profile-tab[data-tab='favorite']").click(); // 기본: 단골
});

// ✅ 변경 버튼 클릭 시 Firebase 업데이트
$("#applyProfileBtn").on("click", async function () {
    const nickname = getActiveNickname();
    if (!nickname) return showAlert("로그인 후 이용해주세요.");

    const selected = $(this).data("selected");
    if (!selected) return showAlert("프로필을 선택해주세요.");

    try {
        await set(ref(db, `coffeeUsers/${nickname}/profileImg`), selected);
        showAlert("프로필이 변경되었습니다!");
        $("#profileModal").hide();

        // 즉시 반영
        profileNum = selected;
        const profile = getSafeProfileById(selected);
        $(".user-profile").attr("src", profile.src);
    } catch (err) {
        console.error("프로필 변경 오류:", err);
        showAlert("프로필 변경 중 오류가 발생했습니다.");
    }
});

// ✅ 오늘의 D-day 유저 목록 불러오기 → scrolling-text 표시
async function loadTodayLevelUpUsers() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const listRef = ref(db, `coffeeLevelUpToday/${todayStr}`);

    try {
        const snap = await get(listRef);
        if (!snap.exists()) {
            return;
        }

        let list = snap.val();
        // 배열이 아니고 객체면 값만 추출
        if (!Array.isArray(list)) list = Object.values(list);
        if (!list.length) {
            return;
        }

        // 닉네임 나열 문장 생성
        const nickText = list
            .filter(name => name && name.trim() !== "") // 빈 문자열 제거
            .map(name => `${name}님`)
            .join(", ");
        const message = `🎉 LEVEL UP 🎉 오늘은 ${nickText} 레벨업 D-day에요🦊 다들 축하해주세요~🌟`;

        $(".scrolling-text").text(message);
    } catch (err) {
        console.error("🔥 D-day 유저 목록 로드 중 오류:", err);
        $(".scrolling-text").text("D-day 정보를 불러오지 못했어요.");
    }
}

// 🎆 폭죽 애니메이션 + 축하 문구 함수
function showFireworkCelebration() {
    // 중복 방지
    if ($(".firework-container").length > 0) return;

    const nickname = getActiveNickname();
    const container = $('<div class="firework-container"></div>');
    const message = $(`<div class="firework-text">🎉 ${nickname}님 🎉<br>레벨업 춬하드려요~!</div>`);

    container.append(message);
    $("body").append(container);

    // ✅ 클릭 시 즉시 닫기
    container.on("click", function () {
        container.fadeOut(300, () => container.remove());
    });

    // 폭죽 30개 랜덤 생성
    for (let i = 0; i < 30; i++) {
        const fw = $('<div class="firework"></div>');
        const angle = Math.random() * 2 * Math.PI;
        const distance = 100 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const color = `hsl(${Math.random() * 360}, 80%, 60%)`;
        const delay = Math.random() * 1;

        fw.css({
            "--tx": tx,
            "--ty": ty,
            background: color,
            left: "50%",
            top: "50%",
            animationDelay: `${delay}s`
        });

        container.append(fw);
    }

    // 일정 시간 뒤 제거
    setTimeout(() => container.remove(), 15000);
}

// 🔄 경험치바 ↔ 전체 진행도 전환 기능
$("#switchProgressBtn").on("click", function () {
    const isExpMode = $("#expBarContainer").is(":visible");

    if (isExpMode) {
        // 👉 전체 진행도 모드
        $("#expBarContainer").hide();
        $("#totalProgressBarContainer").show();
    } else {
        // 👉 경험치바 모드
        $("#expBarContainer").show();
        $("#totalProgressBarContainer").hide();
    }
});

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 🔥 좋아요 애니메이션 뿌리기
async function showLikeMessages(nickname) {
    const likesRef = ref(db, `coffeeLikes/${nickname}`);
    const snap = await get(likesRef);

    if (!snap.exists()) return;

    const data = snap.val();
    const messages = [];

    for (const fromNick in data) {
        const count = data[fromNick];
        for (let i = 0; i < count; i++) {
            messages.push(
                `<span class="like-name">${fromNick}</span>님이 ❤️를 보냈습니다🦊`
            );
        }
    }

    // 🎲 배열 랜덤 섞기
    shuffle(messages);

    // 📌 간격 계산
    let group = Math.floor(messages.length / 10);
    let interval = 1500 - (group * 300);
    if (interval < 10) interval = 100;

    // 🔥 메시지들을 사방에 뿌리기
    messages.forEach((msg, idx) => {
        setTimeout(() => spawnFloatingMessage(msg), idx * interval);
    });

    // 🔥 데이터를 본 직후 좋아요 기록 삭제
    // 완전히 삭제하면 새로 쌓이는 좋아요만 남게 됨
    await remove(likesRef);
}

// 🔥 실제 메시지를 떠다니게 만드는 함수
function spawnFloatingMessage(text) {
    const $msg = $(`<div class="like-floating">${text}</div>`);

    // 화면 랜덤 위치
    const x = Math.random() * (window.innerWidth - 200);
    const y = Math.random() * (window.innerHeight - 100);

    $msg.css({
        left: `${x}px`,
        top: `${y}px`
    });

    $("body").append($msg);

    // 애니메이션 끝나면 제거
    setTimeout(() => {
        $msg.remove();
    }, 2600);
}

$('#todayExp').on('input', function () {
    const raw = $(this).val().replace(/[^0-9]/g, ""); // 숫자만
    const $formattedExp = $('.formattedExp');
    if (!raw) {
        $formattedExp.text('');
        return;
    }
    $formattedExp.text(formatKoreanNumber(raw));
});

async function checkDailyAttendance(nickname) {
    const today = getKoreanDate();
    const userRef = ref(db, `coffeeUsers/${nickname}`);
    const counterRef = ref(db, `coffeeCounters/dailyRank/${today}`);

    // 유저 정보
    const userSnap = await get(userRef);
    if (!userSnap.exists()) return;
    const user = userSnap.val();

    // 이미 오늘 출석했으면 종료
    const ts = user.lastAttendDate || ""; // "25.01.08-00:03:21"
    if (ts.split("-")[0].replace(/\./g, "-") === today.slice(2)) return;

    try {
        // [3] 랭킹 번호 먼저 확보 (Transaction 필수)
        const rankTx = await runTransaction(counterRef, (current) => (current || 0) + 1);
        if (!rankTx.committed) throw new Error("Rank_Fail");
        const newRank = rankTx.snapshot.val();

        // [4] 데이터 준비
        const now = new Date();
        const attendTime = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
        const timestamp = getKoreanTimestamp();

        // 🔥 [핵심 변경] 모든 경로의 업데이트를 하나의 객체로 통합
        const updates = {};

        // 내 정보 업데이트 경로
        updates[`coffeeUsers/${nickname}/dailyRank`] = newRank;
        updates[`coffeeUsers/${nickname}/lastAttendDate`] = timestamp;

        // 전체 랭킹 리스트 업데이트 경로
        updates[`coffeeDailyRank/${today}/${newRank}/${user.id}`] = attendTime;

        // ✅ [원자적 업데이트] 서버에서 두 정보를 동시에 처리 (하나라도 실패하면 둘 다 안 됨)
        await update(ref(db), updates);

        // [5] 출석 성공(update 완료) 이후에만 보상/기록 로직 진행
        if (newRank === 1) {
            const firstRankRef = ref(db, `coffeeStats/firstRankTotal/${user.id}`);
            await runTransaction(firstRankRef, (current) => (current || 0) + 1);

            const totalSnap = await get(firstRankRef);
            if (totalSnap.exists() && totalSnap.val() >= 10) {
                await set(ref(db, `coffeeUsers/${nickname}/isFirst10`), true);
            }
        }

        if (newRank <= 3) {
            const success = await giveCoupon(nickname, 1, "출석보상");
            if (success) {
                showAlert(`순위권 달성!\n축하 🎫이 지급되었습니다!`);
            }
        }

    } catch (err) {
        if (err.message === "Rank_Fail") {
            showAlert("출석 인원이 많아 처리가 지연되었습니다.\n어플을 종료하고 잠시 후 다시 시도해주세요!");
        } else {
            showAlert(`오류가 발생했습니다 화면을 캡쳐 한 후 관리자에게 문의주세요.\n\n${err}`);
        }
    }
}

const MAX_RECENT_USERS = 5;

// 최근 접속자 5명 관리 (FIFO)
async function updateRecentUsers(userId) {
    if (userId === undefined || userId === null) {
        console.error("❌ updateRecentUsers 실패: userId가 정의되지 않았습니다.");
        return;
    }

    const targetId = Number(userId);
    const recentRef = ref(db, `coffeeRecentUsers`);

    // 현재 시간 (시:분) 추출
    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0');

    try {
        await runTransaction(recentRef, (currentData) => {
            // 1. 데이터가 없으면 현재 유저 객체로 시작
            if (currentData === null) {
                return [{ id: targetId, time: timeStr }];
            }

            // 배열 형태 보장
            let list = Array.isArray(currentData) ? currentData : Object.values(currentData);

            // 2. 중복 ID 검사: 리스트에 이미 내 ID가 있으면 제거 (최신 접속 시간으로 갱신하기 위함)
            list = list.filter(user => user.id !== targetId);

            // 3. 새 접속 정보 객체 추가
            list.push({ id: targetId, time: timeStr });

            // 4. 5명이 넘으면 가장 오래된 데이터(첫 번째 요소) 제거
            if (list.length > MAX_RECENT_USERS) {
                list.shift();
            }

            return list;
        });
    } catch (error) {
        console.error("최근 접속자 명단 갱신 중 오류:", error);
    }
}