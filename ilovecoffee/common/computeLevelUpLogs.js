// 🔹 전역 레벨업 로그 저장 배열
let levelUpLogs = [];
const logsPerPage = 10;
let logPage = 1;

function computeLevelUpLogs(records) {
    const dates = Object.keys(records).sort();
    const levelFirstDate = {};

    // 레벨별 최초 날짜 기록
    dates.forEach(date => {
        const lv = records[date].level;
        if (!levelFirstDate[lv]) {
            levelFirstDate[lv] = date;
        }
    });

    const levels = Object.keys(levelFirstDate)
        .map(Number)
        .sort((a, b) => a - b);

    if (!levels.length) {
        levelUpLogs = [];
        logPage = 1;
        return;
    }

    // 실제 첫 기록 레벨
    const minLevel = levels[0];
    const maxLevel = levels[levels.length - 1];

    // 🔥 10단위 시작 레벨 구하기
    const firstStartLevel = minLevel - ((minLevel - 1) % 10);

    // 🔥 마지막은 최대 레벨에서 필요한 만큼 10단위로 묶기
    const lastEndLevel = maxLevel + (10 - ((maxLevel - 1) % 10) - 1);

    // 🔥 레벨 구간 꽉 채우기
    const fullLogs = [];
    for (let lv = firstStartLevel; lv <= lastEndLevel; lv++) {
        if (levelFirstDate[lv]) {
            fullLogs.push({
                level: lv,
                date: levelFirstDate[lv],
                missing: false
            });
        } else {
            fullLogs.push({
                level: lv,
                date: null,
                missing: true
            });
        }
    }

    levelUpLogs = fullLogs;

    // 🔥 항상 마지막 페이지로 이동
    const totalPages = Math.ceil(levelUpLogs.length / logsPerPage);
    logPage = totalPages || 1;
}

// 🔥 레벨업 로그 보기 버튼
$(document).on("click", ".levelUpLogBtn", function () {
    if (!levelUpLogs.length) {
        $("#levelUpLogList").html(`<p style="color:#999;">레벨업 기록이 없습니다.</p>`);
        $("#logPagination").hide();
        $("#levelUpLogModal").css("display", "flex");
        return;
    }

    renderLevelUpLogPage();
    $("#levelUpLogModal").css("display", "flex");
});

// 🔥 페이지별 렌더링
function renderLevelUpLogPage() {
    const $list = $("#levelUpLogList");
    $list.empty();

    const totalPages = Math.ceil(levelUpLogs.length / logsPerPage);
    if (logPage < 1) logPage = 1;
    if (logPage > totalPages) logPage = totalPages;

    const startIdx = (logPage - 1) * logsPerPage;
    const endIdx = startIdx + logsPerPage;
    const pageItems = levelUpLogs.slice(startIdx, endIdx);

    pageItems.forEach(item => {
        if (item.missing || !item.date) {
            // 🔸 기록 없는 레벨
            $list.append(`
                <div style="white-space: nowrap;">
                    <span style="display:inline-block; text-align: center; width:111px; padding-right: 10px;">
                        -
                    </span>
                    <b>LV${item.level}</b>
                </div>
            `);
        } else {
            // 🔸 기록 있는 레벨
            const [yyyy, mm, dd] = item.date.split("-");
            const yy = yyyy.slice(2);
            $list.append(`
                <div style="white-space: nowrap;">
                    <span style="display:inline-block; width:111px; padding-right: 10px;">
                        ${yy}년 ${mm}월 ${dd}일
                    </span>
                    <b>LV${item.level}</b>
                </div>
            `);
        }
    });

    renderLogPagination(totalPages);
}

// 🔥 이전 / 다음 버튼 상태
function renderLogPagination(totalPages) {
    const $prev = $(".logPrev");
    const $next = $(".logNext");

    $("#logPagination").show();

    if (logPage === 1) {
        $prev.css({ opacity: 0.4, cursor: "not-allowed" });
        $prev.prop("disabled", true);
    } else {
        $prev.css({ opacity: 1, cursor: "pointer" });
        $prev.prop("disabled", false);
    }

    if (logPage === totalPages) {
        $next.css({ opacity: 0.4, cursor: "not-allowed" });
        $next.prop("disabled", true);
    } else {
        $next.css({ opacity: 1, cursor: "pointer" });
        $next.prop("disabled", false);
    }
}

// 🔥 이전 / 다음 버튼 클릭
$(document).on("click", ".logPrev", function (e) {
    e.stopPropagation();
    if ($(this).prop("disabled")) return;
    logPage--;
    renderLevelUpLogPage();
});

$(document).on("click", ".logNext", function (e) {
    e.stopPropagation();
    if ($(this).prop("disabled")) return;
    logPage++;
    renderLevelUpLogPage();
});

// 🔥 모달 닫기
$(document).on("click", "#closeLevelUpLogModal", function () {
    $("#levelUpLogModal").hide();
});