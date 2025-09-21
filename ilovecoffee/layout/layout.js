// 파일명 : layout.js

$(function () {
    // ===================== 화면/보드 초기화 =====================
    function checkOrientation() {
        if ($(window).width() < $(window).height()) {
            $("#landscape").show();
            $("#page").hide();
        } else {
            $("#landscape").hide();
            $("#page").show();
        }
    }

    checkOrientation();
    $(window).on("resize", checkOrientation);

    const ROWS = 16, COLS = 15, W = 42, H = 21, PAD = 24;
    const $svg = $("#board");

    // SVG viewBox 계산
    const minX = (0 - (ROWS - 1)) * (W / 2), maxX = (COLS - 1) * (W / 2);
    const minY = 0, maxY = (ROWS - 1 + (COLS - 1)) * (H / 2);
    const boardW = (maxX - minX) + W, boardH = (maxY - minY) + H;
    const centerX = (minX + maxX) / 2, centerY = (minY + maxY) / 2;
    const fullW = boardW + PAD * 2, fullH = boardH + PAD * 2;
    const offsetX = centerX - boardW / 2 - PAD, offsetY = centerY - boardH / 2 - PAD;
    $svg.attr("viewBox", `${offsetX} ${offsetY} ${fullW} ${fullH}`);

    // 타일 좌표 → 화면 좌표
    function toScreen(r, c) {
        return {cx: (c - r) * (W / 2), cy: (c + r) * (H / 2)};
    }

    // 다이아몬드 모양 polygon 좌표
    function diamondPoints(cx, cy) {
        return `${cx},${cy - H / 2} ${cx + W / 2},${cy} ${cx},${cy + H / 2} ${cx - W / 2},${cy}`;
    }

    $("#loading-overlay").hide();

    // ===================== 보드 생성 =====================
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const {cx, cy} = toScreen(r, c);
            const $poly = $(document.createElementNS("http://www.w3.org/2000/svg", "polygon"))
                .attr("points", diamondPoints(cx, cy))
                .attr("data-rc", `${r},${c}`)
                .addClass("tile")
                .data({rc: `${r},${c}`, occupied: false, protected: false})
                .attr("title", `(${r},${c})`);
            const $text = $(document.createElementNS("http://www.w3.org/2000/svg", "text"))
                .attr({x: cx, y: cy + 1}).addClass("label").hide();
            $svg.append($poly).append($text);
        }
    }

    // ===================== 유틸 함수 =====================
    function getTile(r, c) {
        return $(`.tile[data-rc='${r},${c}']`);
    }

    function mark($tile, name, cls) {
        if (!$tile.length) return;
        $tile.data("occupied", true)
            .attr("class", "tile " + cls)
            .next("text").text(name).show();
    }

    // ===================== 보호칸 처리 =====================
    function protectTileRC(r, c) {
        const $t = getTile(r, c);
        if ($t.length && !$t.data("occupied")) {
            $t.data("protected", true).addClass("protected");
            $t.next("text").text("").hide();
        }
    }

    function addProtectL(r, c) {
        const down = getTile(r + 1, c);
        down.attr("class", "tile protected")
            .data({occupied: false, protected: true});
        down.next("text").text("").hide();
    }

    function addProtectR(r, c) {
        const right = getTile(r, c + 1);
        right.attr("class", "tile protected")
            .data({occupied: false, protected: true});
        right.next("text").text("").hide();
    }

    function protectTileForce(r, c) {
        const $t = getTile(r, c);
        if ($t.length) {
            $t.attr("class", "tile protected")
                .data({occupied: false, protected: true});
            $t.next("text").text("").hide();
        }
    }

    function addProtectCross(r, c) {
        const up = getTile(r - 1, c),
            down = getTile(r + 1, c);

        if (up.length && down.length) {
            protectTileForce(r - 1, c);
            protectTileForce(r + 1, c);
        } else {
            protectTileForce(r, c - 1);
            protectTileForce(r, c + 1);
        }
    }

    function isAnchor($t) {
        return $t.length && ($t.hasClass("pickup") || $t.hasClass("cashier") || $t.hasClass("showke"));
    }

    function isAnchorRequired(r, c) {
        // (r,c) 위치가 앵커에 의해 반드시 보호돼야 하는 칸인지 판정
        const neighbors = [
            {ar: r - 1, ac: c},
            {ar: r + 1, ac: c},
            {ar: r, ac: c - 1},
            {ar: r, ac: c + 1},
        ];
        for (const {ar, ac} of neighbors) {
            const $a = getTile(ar, ac);
            if (!isAnchor($a)) continue;

            const upExists = getTile(ar - 1, ac).length > 0;
            const downExists = getTile(ar + 1, ac).length > 0;

            if (upExists && downExists) {
                if ((r === ar - 1 && c === ac) || (r === ar + 1 && c === ac)) return true;
            } else {
                if ((r === ar && c === ac - 1) || (r === ar && c === ac + 1)) return true;
            }
        }
        return false;
    }

    function enforceAnchorProtection() {
        $(".tile.pickup, .tile.cashier, .tile.showke").each(function () {
            const [r, c] = $(this).data("rc").split(",").map(Number);
            const $up = getTile(r - 1, c);
            const $down = getTile(r + 1, c);

            if ($up.length && $down.length) {
                protectTileRC(r - 1, c);
                protectTileRC(r + 1, c);
            } else {
                protectTileRC(r, c - 1);
                protectTileRC(r, c + 1);
            }
        });
    }

    // ===================== 고정 배치 =====================
    function placeFixed() {
        if ($("#judy").is(":checked")) {
            mark(getTile(13, 12), "쥬디", "judy");
            addProtectL(13, 12);
        }
        mark(getTile(14, 13), "캐셔", "cashier");
        addProtectCross(14, 13);
        mark(getTile(14, 14), "픽업", "pickup");
        addProtectCross(14, 14);
        mark(getTile(15, 11), "휴지통", "trash");
        mark(getTile(14, 11), "휴지통", "trash");
        addProtectR(15, 11);
        addProtectR(14, 11);
    }

    // ===================== 배치 가능 판정 =====================
    function canPlace(r, c) {
        const $self = getTile(r, c);
        if ($self.data("occupied") || $self.data("protected")) return false;

        const left = getTile(r, c - 1);
        const up = getTile(r - 1, c);
        const leftDown = getTile(r + 1, c - 1);
        const upRight = getTile(r - 1, c + 1);

        const isWorkbench = $t => $t.length && $t.hasClass("workbench");
        const hasLeft = isWorkbench(left);
        const hasUp = isWorkbench(up);
        const hasLeftDown = isWorkbench(leftDown);
        const hasUpRight = isWorkbench(upRight);

        if (!hasLeft && !hasUp) return true;
        else if (hasLeft && !hasUp && !hasLeftDown) return true;
        else if (hasUp && !hasLeft && !hasUpRight) return true;
        else if (hasLeft && hasUp && !hasLeftDown && !hasUpRight) return true;
        return false;
    }

    // ===================== 작업대 배치/검증 =====================
    function placeWorkbenches() {
        let count = 0;
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r < ROWS; r++) {
                let place = false;
                if (c % 3 === 0) {
                    if (r % 3 === 1 || r % 3 === 2) place = true;
                } else if (c % 3 === 1) {
                    if (r % 3 === 2 || r % 3 === 0) place = true;
                } else if (c % 3 === 2) {
                    if (r % 3 === 0 || r % 3 === 1) place = true;
                }
                if (place) {
                    const $t = getTile(r, c);
                    mark($t, "작업대", "workbench");
                    count++;
                }
            }
        }
        $("#workbenchCount").val(count);
    }

    function validateWorkbenches() {
        $(".tile.workbench").get().reverse().forEach(function (el) {
            const $t = $(el);
            const [r, c] = $t.data("rc").split(",").map(Number);

            const $down = getTile(r + 1, c);
            const $right = getTile(r, c + 1);

            const downOk = $down.length && (!$down.data("occupied") || $down.data("protected"));
            const rightOk = $right.length && (!$right.data("occupied") || $right.data("protected"));

            if (!(downOk || rightOk)) {
                $t.attr("class", "tile").data({occupied: false, protected: false});
                $t.next("text").text("").hide();
            } else {
                if (downOk && $down.length && !$down.data("occupied")) {
                    $down.data("protected", true).addClass("protected");
                } else if (rightOk && $right.length && !$right.data("occupied")) {
                    $right.data("protected", true).addClass("protected");
                }
            }
        });

        // ✅ 앵커(픽업/캐셔/쇼케) 보호칸 강제 복구
        enforceAnchorProtection();

        $("#workbenchCount").val($(".tile.workbench").length);
    }

    // ===================== 빈칸 카운트 =====================
    function countFreeTiles() {
        let free = 0;
        $(".tile").each(function () {
            const [r, c] = $(this).data("rc").split(",").map(Number);
            if (canPlace(r, c)) free++;
        });
        return free;
    }

    // ===================== 실제 작업대 제거(보호칸 규칙 포함) =====================
    let removedCount = 0;        // 제거된 작업대 개수
    let totalWorkbenches = 0;    // 시작 시 전체 작업대 수

    function resetProgress(needTotal) {
        removedCount = 0;

        const free = countFreeTiles();
        totalWorkbenches = Math.max(0, needTotal - free); // ✅ 부족한 칸만큼만 제거 목표

        updateProgress(0);
    }

    function removeWorkbench(r, c) {
        const $t = getTile(r, c);
        if (!$t.length || !$t.hasClass("workbench")) return;

        // 1) 작업대 제거
        $t.attr("class", "tile").data({occupied: false, protected: false});
        $t.next("text").text("").hide();
        // console.log(`🗑️ 작업대 제거: (${r},${c})`);

        // 진행률 증가
        removedCount++;
        if (totalWorkbenches > 0) {
            const percent = Math.min(100, Math.round((removedCount / totalWorkbenches) * 100));
            console.log(`removedCount : ${removedCount}, totalWorkbenches : ${totalWorkbenches}`);
            updateProgress(percent);
        }

        // (이하 보호칸 해제 로직 그대로 유지)
        function isSpecial($tile) {
            if (!$tile.length) return false;
            return $tile.hasClass("workbench")
                || $tile.hasClass("showke")
                || $tile.hasClass("trash")
                || $tile.hasClass("pickup")
                || $tile.hasClass("cashier")
                || $tile.hasClass("judy");
        }

        const $down = getTile(r + 1, c);
        if ($down.length && $down.data("protected")) {
            const $self = getTile(r, c);
            const $left = getTile(r + 1, c - 1);
            if (!isAnchorRequired(r + 1, c) && !isSpecial($self) && !isSpecial($left)) {
                $down.attr("class", "tile").data({occupied: false, protected: false});
                $down.next("text").text("").hide();
                // console.log(`   ⤵️ 보호칸 해제: (${r + 1},${c})`);
            }
        }

        const $right = getTile(r, c + 1);
        if ($right.length && $right.data("protected")) {
            const $self = getTile(r, c);
            const $up = getTile(r - 1, c + 1);
            if (!isAnchorRequired(r, c + 1) && !isSpecial($self) && !isSpecial($up)) {
                $right.attr("class", "tile").data({occupied: false, protected: false});
                $right.next("text").text("").hide();
                // console.log(`   ⮕ 보호칸 해제: (${r},${c + 1})`);
            }
        }

        enforceAnchorProtection();
    }

    // ===================== 시뮬레이션 기반 ensureFreeTiles =====================
    function showLoading() {
        $("#loading-overlay").show();
        $(".progress-fill").css("width", "0%");
    }

    function hideLoading() {
        $("#loading-overlay").hide();
    }

    function updateProgress(percent) {
        $(".progress-fill").css("width", percent + "%");
    }

    function cloneBoard() {
        const clone = [];
        for (let r = 0; r < ROWS; r++) {
            clone[r] = [];
            for (let c = 0; c < COLS; c++) {
                const $t = getTile(r, c);
                clone[r][c] = {
                    occupied: $t.data("occupied"),
                    protected: $t.data("protected"),
                    type: $t.attr("class").split(" ").pop()
                };
            }
        }
        return clone;
    }

    function removeWorkbenchSim(r, c, board) {
        if (!board[r] || !board[r][c]) return;
        if (board[r][c].type !== "workbench") return;
        board[r][c] = {occupied: false, protected: false, type: "tile"};
        // 보호칸 해제 로직 단순화 (특수칸 제외)
        if (board[r + 1] && board[r + 1][c]?.protected) {
            board[r + 1][c] = {occupied: false, protected: false, type: "tile"};
        }
        if (board[r]?.[c + 1]?.protected) {
            board[r][c + 1] = {occupied: false, protected: false, type: "tile"};
        }
    }

    function countFreeTilesSim(board) {
        let free = 0;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = board[r][c];
                if (!cell.occupied && !cell.protected) free++;
            }
        }
        return free;
    }

    function simulateRemove(r, c) {
        const board = cloneBoard();
        const before = countFreeTilesSim(board);
        removeWorkbenchSim(r, c, board);
        const after = countFreeTilesSim(board);
        return after - before;
    }

    function ensureFreeTiles(needTotal, done) {
        let free = countFreeTiles();
        const totalWorkbenches = $(".tile.workbench").length;

        function step() {
            if (free >= needTotal) {
                if (done) done();
                return;
            }

            let best = null;
            $(".tile.workbench").each(function () {
                const [r, c] = $(this).data("rc").split(",").map(Number);
                const gain = simulateRemove(r, c);
                if (gain > 0 && (!best || gain > best.gain)) {
                    best = {r, c, gain};
                }
            });

            if (!best) {
                if (done) done();
                return;
            }

            removeWorkbench(best.r, best.c);
            free = countFreeTiles();

            // 다음 작업을 비동기로 실행 → UI 갱신 보장
            setTimeout(step, 0);
        }

        step();
    }

    // ===================== 기계 배치 =====================
    function placeFree(name, cls, count) {
        let placed = 0;
        for (let c = COLS - 1; c >= 0 && placed < count; c--) {
            for (let r = ROWS - 1; r >= 0 && placed < count; r--) {
                if (canPlace(r, c)) {
                    const $t = getTile(r, c);
                    mark($t, name, cls);
                    placed++;
                }
            }
        }
    }

    function placeMachines(done) {
        const romer = parseInt($("#romer").val(), 10) || 0;
        const kumer = parseInt($("#kumer").val(), 10) || 0;
        const total = romer + kumer;

        placeFree("로머", "romer", romer);
        placeFree("쿠머", "kumer", kumer);
        if (done) done();
    }

    function placeShowke(count) {
        let placed = 0;
        for (let c = 6; c < COLS && placed < count; c++) {
            if (canPlace(15, c)) {
                const $t = getTile(15, c);
                mark($t, "쇼케", "showke");
                addProtectCross(15, c);
                placed++;
            }
        }
    }

    function refineWorkbenches() {
        placeMachines();
        const showke = parseInt($("#showke").val(), 10) || 0;
        placeShowke(showke);
        $("#workbenchCount").val($(".tile.workbench").length);
    }

    // ===================== 보드 조작 =====================
    function resetBoard() {
        $(".tile").each(function () {
            $(this).attr("class", "tile")
                .data({occupied: false, protected: false});
            $(this).next("text").text("").hide();
        });
        $("#gita").val(0);
        $("#workbenchCount").val(0);
        $("#coord-box").text("좌표 : -");
    }

    $(".start-btn").on("click", function () {
        const $btn = $(this);
        if ($btn.text() === "배치 시작") {
            console.clear();
            showLoading();

            setTimeout(() => {
                placeWorkbenches();
                placeFixed();
                validateWorkbenches();

                const romer = parseInt($("#romer").val(), 10) || 0;
                const kumer = parseInt($("#kumer").val(), 10) || 0;
                const total = romer + kumer;
                resetProgress(total - 5);

                ensureFreeTiles(total, () => {
                    placeMachines(() => {
                        refineWorkbenches();
                        hideLoading();
                        $btn.text("초기화");
                    });
                });
            }, 500); // 살짝 딜레이 줘서 로딩 표시 보장
        } else {
            resetBoard();
            $btn.text("배치 시작");
        }
    });

    // 좌표 표시
    const $coordBox = $("#coord-box");
    $(document).on("mouseenter", ".tile", function () {
        const rc = $(this).data("rc");
        $coordBox.text(`좌표 : ${rc}`);
    }).on("mouseleave", ".tile", function () {
        $coordBox.text("좌표 : -");
    });
});