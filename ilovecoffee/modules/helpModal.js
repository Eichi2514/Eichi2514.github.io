/* modules/helpModal.js */
import {goToPage} from "../common/utils.js";

// ✅ 도움말 페이지네이션 로직
let currentHelpPage = 1;

// ✅ 페이지 개수 자동 계산
function getTotalHelpPages() {
    return $(".help-page").length;
}

// ✅ 점 네비게이션 생성 함수
function renderHelpDots(total) {
    const $dots = $("#helpDots");
    $dots.empty();
    for (let i = 1; i <= total; i++) {
        $dots.append(`<span data-page="${i}"></span>`);
    }
}

// ✅ 페이지 전환 함수
function showHelpPage(page) {
    const totalHelpPages = getTotalHelpPages();

    $(".help-page").hide();
    $(`.page${page}`).show();

    // 이전/다음 버튼 표시 제어
    $("#prevHelpPage").css("visibility", page === 1 ? "hidden" : "visible");
    $("#nextHelpPage").css("visibility", page === totalHelpPages ? "hidden" : "visible");

    // 점 네비게이션 업데이트
    $("#helpDots span").removeClass("active");
    $(`#helpDots span[data-page='${page}']`).addClass("active");
}

// ✅ 다음 버튼
$(document).on("click", "#nextHelpPage", function () {
    const total = getTotalHelpPages();
    if (currentHelpPage < total) {
        currentHelpPage++;
        showHelpPage(currentHelpPage);
    }
});

// ✅ 이전 버튼
$(document).on("click", "#prevHelpPage", function () {
    if (currentHelpPage > 1) {
        currentHelpPage--;
        showHelpPage(currentHelpPage);
    }
});

// ✅ 도움말 열 때 초기화
$(document).on("click", "#helpBtn", function () {
    currentHelpPage = 1;
    const total = getTotalHelpPages();
    renderHelpDots(total);
    showHelpPage(currentHelpPage);
    $("#helpModal").css("display", "flex");
});

// ✅ 닫기 버튼
$(document).on("click", "#closeHelpModal", function () {
    $("#helpModal").hide();

    // ✅ 처음 접속 시 도움말 자동 표시 (한 번만)
    if (!localStorage.getItem("helpModalShown")) {
        localStorage.setItem("helpModalShown", "true");
    }
});

// ✅ 점 클릭 시 해당 페이지로 이동
$(document).on("click", "#helpDots span", function () {
    const target = $(this).data("page");
    currentHelpPage = target;
    showHelpPage(currentHelpPage);
});

// ✅ 처음 접속 시 도움말 자동 표시 (한 번만)
$(window).on("load", function () {
    if (!localStorage.getItem("helpModalShown")) {
        currentHelpPage = 1;
        const total = getTotalHelpPages();
        renderHelpDots(total);
        showHelpPage(currentHelpPage);
        $("#helpModal").css("display", "flex");
    }
});

// ✅ 닫기 버튼
$(document).on("click", ".closeBtn", function () {
    $(this).closest(".login-overlay").hide();
});

// 뒤로가기
$("#backBtn").on("click", () => goToPage());