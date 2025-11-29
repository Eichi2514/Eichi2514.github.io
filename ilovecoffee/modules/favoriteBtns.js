import {BUTTONS} from "../common/buttonInfo.js";

let favoriteOrder = JSON.parse(localStorage.getItem("favorites") || "[]");

$(document).on("click", ".favoriteSettingBtn", function () {
    favoriteOrder = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favoriteOrder || favoriteOrder.length === 0) {
        favoriteOrder = ["postsBtn", "baristaBtn", "memoryBtn"];
    }

    renderFavoriteSelect();
    $("#favoriteModal").show();
});

$(document).on("change", ".favCheck", function () {
    const key = $(this).closest(".fav-item").data("key");

    if (this.checked) {
        // 이미 있으면 제거 후 다시 push (중복 방지)
        favoriteOrder = favoriteOrder.filter(k => k !== key);
        favoriteOrder.push(key);  // 클릭 순서대로
    } else {
        // 체크 해제된 경우 제거
        favoriteOrder = favoriteOrder.filter(k => k !== key);
    }
});

function renderFavoriteSelect() {
    let favList = JSON.parse(localStorage.getItem("favorites"));

    if (!favList || favList.length === 0) {
        favList = ["postsBtn", "baristaBtn", "memoryBtn"];
    }

    $("#favoriteSelectArea").empty();

    $("#favoriteSelectArea").append(`
        <label id="favSelectAllWrapper"
               style="padding:10px; border:1px solid #e0dff2; border-radius:12px;
               background:#fff; display:flex; justify-content:space-between;
               align-items:center; margin-bottom:10px;">
            <span style="font-size:15px; font-weight:600; color:#5a4398;">
                전체 선택
            </span>
            <input type="checkbox" id="favSelectAll" style="transform:scale(1.3); width:17px;">
        </label>
    `);

    BUTTONS.forEach(btn => {
        const isSelected = favList.includes(btn.key);

        $("#favoriteSelectArea").append(`
            <label class="fav-item" data-key="${btn.key}"
                   style="
                       padding:10px;
                       border:1px solid #e0dff2;
                       border-radius:12px;
                       background:#fff;
                       display:flex;
                       justify-content:space-between;
                       align-items:center;
                       gap:10px;">
                   
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${btn.img}"
                         style="width:40px; height:40px; border-radius:10px; object-fit:cover;">
                    <span style="font-size:15px; font-weight:600; color:#5a4398;">
                        ${btn.name}
                    </span>
                </div>

                <input type="checkbox" class="favCheck"
                       style="transform:scale(1.3); width:17px;"
                       ${isSelected ? "checked" : ""}>
            </label>
        `);
    });

    // 전체 선택 토글 상태 설정
    const allCount = $("#favoriteSelectArea .favCheck").length;
    const checkedCount = $("#favoriteSelectArea .favCheck:checked").length;

    $("#favSelectAll").prop("checked", allCount === checkedCount);
}

$(document).on("change", "#favSelectAll", function () {
    const checked = $(this).prop("checked");

    // 전체 토글
    $("#favoriteSelectArea .favCheck").prop("checked", checked);

    // favoriteOrder도 업데이트
    if (checked) {
        favoriteOrder = BUTTONS.map(b => b.key); // 전체 선택
    } else {
        favoriteOrder = []; // 전체 해제
    }
});

// 저장 기능
$("#saveFavoriteBtn").on("click", function () {
    localStorage.setItem("favorites", JSON.stringify(favoriteOrder));

    renderQuickButtons();
    renderSettingsButtons();
    $("#favoriteModal").hide();
});

function renderQuickButtons() {
    let favList = JSON.parse(localStorage.getItem("favorites"));

    if (!favList || favList.length === 0) {
        favList = ["postsBtn", "baristaBtn", "memoryBtn"];
    }

    $(".quickBtn-bar").empty();

    favList.forEach(key => {
        const btn = BUTTONS.find(b => b.key === key);
        if (!btn) return;

        $(".quickBtn-bar").append(`
            <div class="quickBtn ${btn.key}">
                <img src="${btn.img}" class="quickBtnImg">
                <span>${btn.name}</span>
            </div>
        `);
    });
}

function renderSettingsButtons() {
    let favList = JSON.parse(localStorage.getItem("favorites"));

    if (!favList || favList.length === 0) {
        favList = ["postsBtn", "baristaBtn", "memoryBtn"];
    }
    const restBtns = BUTTONS.filter(btn => !favList.includes(btn.key));

    $("#settingsDropdown .dynamic-setting").remove();

    const target = $("#settingsDropdown .favoriteSettingBtn");

    // 역순 추가
    [...restBtns].reverse().forEach(btn => {
        target.after(`
            <button class="dynamic-setting ${btn.key}">${btn.name}</button>
        `);
    });
}

$(document).ready(function () {
    renderQuickButtons();
    renderSettingsButtons();
});