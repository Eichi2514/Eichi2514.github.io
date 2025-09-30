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
                    if (!$t.hasClass("gita")) {   // ← 이미 기타면 덮어쓰지 않음
                        mark($t, "작업대", "workbench");
                        count++;
                    }
                }
            }
        }
    }

    function validateWorkbenches() {
        $(".tile.workbench").get().reverse().forEach(function (el) {
            const $t = $(el);
            if ($t.hasClass("gita")) return; // ← 기타는 건드리지 않음;
            const [r, c] = $t.data("rc").split(",").map(Number);

            const $down = getTile(r + 1, c);
            const $right = getTile(r, c + 1);

            const downOk  = (r + 1 < ROWS) && $down.length &&
                (!$down.data("occupied") || $down.data("protected"));
            const rightOk = (c + 1 < COLS) && $right.length &&
                (!$right.data("occupied") || $right.data("protected"));

            let chosen = null;

            if (downOk && rightOk) {
                // 우선순위: r<c → 아래, r>c → 오른쪽, r==c → 아래
                if (r < c) chosen = $down;
                else if (r > c) chosen = $right;
                else chosen = $down;
            } else if (downOk) {
                chosen = $down;
            } else if (rightOk) {
                chosen = $right;
            }

            if (chosen) {
                // 보호칸 확정
                if (!chosen.data("protected")) {
                    chosen.data("protected", true).addClass("protected");
                }
            } else {
                // 보호칸 못 만들면 작업대 제거
                $t.attr("class", "tile").data({occupied: false, protected: false});
                $t.next("text").text("").hide();
            }
        });

        // ✅ 앵커(픽업/캐셔/쇼케) 보호칸 강제 복구
        enforceAnchorProtection();
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
    let totalWorkbenches = 144;    // 시작 시 전체 작업대 수

    function resetProgress() {
        removedCount = 0;
        totalWorkbenches = 144;

        updateProgress(0);
    }

    function removeWorkbench(r, c) {
        const $t = getTile(r, c)
        if (!$t.length || $t.hasClass("gita")) return; // ← 기타는 제거 대상 아님
        if (!$t.length || !$t.hasClass("workbench")) return;

        // 1) 작업대 제거
        $t.attr("class", "tile").data({occupied: false, protected: false});
        $t.next("text").text("").hide();
        // console.log(`🗑️ 작업대 제거: (${r},${c})`);

        // 진행률 증가
        removedCount++;
        if (totalWorkbenches > 0) {
            const percent = Math.min(100, Math.round((removedCount / totalWorkbenches) * 100));
            console.log(`제거된 작업대 수: ${removedCount}, 전체 작업대 수: ${totalWorkbenches - removedCount}`);
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

        function step() {
            if (free >= needTotal) {
                if (done) done();
                return;
            }

            let best = null;

            // 1️⃣ 보호칸-작업대 규칙 (15,14부터 역순 탐색)
            for (let r = ROWS - 1; r >= 0 && !best; r--) {
                for (let c = COLS - 1; c >= 0 && !best; c--) {
                    const $t = getTile(r, c);
                    if (!$t.hasClass("protected")) continue;

                    const $left = getTile(r, c - 1);
                    const $up   = getTile(r - 1, c);

                    const leftIsWB = $left.length && $left.hasClass("workbench");
                    const upIsWB   = $up.length && $up.hasClass("workbench");

                    if (leftIsWB && upIsWB) continue;

                    if (leftIsWB ^ upIsWB) {
                        const target = leftIsWB ? {r, c: c - 1} : {r: r - 1, c};
                        best = {...target, gain: 2};
                    }
                }
            }

            // 2️⃣ 없으면 기존 simulateRemove 로직 (역순 탐색)
            if (!best) {
                for (let r = ROWS - 1; r >= 0; r--) {
                    for (let c = COLS - 1; c >= 0; c--) {
                        const $t = getTile(r, c);
                        if (!$t.hasClass("workbench")) continue;

                        const gain = simulateRemove(r, c);
                        if (gain > 0) {
                            const newFree = free + gain;
                            if (newFree <= needTotal && (!best || gain > best.gain)) {
                                best = {r, c, gain};
                            }
                        }
                    }
                }
            }

            if (!best) {
                if (done) done();
                return;
            }

            removeWorkbench(best.r, best.c);
            free += best.gain;

            setTimeout(step, 0);
        }

        step();
    }

    // ===================== 기타 타일 토글 =====================
    function updateGitaCount(delta) {
        const $gita = $("#gita");
        let value = parseInt($gita.text(), 10) || 0;
        value = Math.max(0, value + delta); // 음수 방지
        $gita.text(value);
    }

    $(document).on("click", ".tile", function () {
        const $t = $(this);

        if ($t.hasClass("gita")) {
            // 1) 클릭한 게 기타면 → 빈칸으로
            $t.attr("class", "tile")
                .data({occupied: false, protected: false});
            $t.next("text").text("").hide();
            updateGitaCount(-1);
        } else {
            // 2) 클릭한 게 기타가 아니면 → 기타로
            $t.attr("class", "tile gita")
                .data({occupied: true, gita: true});
            $t.next("text").text("기타").show();
            updateGitaCount(1);
        }
    });

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

    function placeGita(count) {
        let placed = $(".tile.gita").length; // 이미 클릭으로 배치된 기타칸 수
        for (let c = COLS - 1; c >= 0 && placed < count; c--) {
            for (let r = ROWS - 1; r >= 0 && placed < count; r--) {
                const $t = getTile(r, c);
                if (!$t.data("occupied") && !$t.data("protected")) {
                    $t.attr("class", "tile gita")
                        .data({occupied: true, gita: true});
                    $t.next("text").text("기타").show();
                    placed++;
                }
            }
        }
        $("#gita").text(placed); // 최종 카운트 반영
    }

    function placeMachines(done) {
        const romer = parseInt($("#romer").text(), 10) || 0;
        const kumer = parseInt($("#kumer").text(), 10) || 0;
        const showke = parseInt($("#showke").text(), 10) || 0;

        // ✅ 쇼케 먼저
        placeShowke(showke);

        // 그다음 로머, 쿠머
        placeFree("로머", "romer", romer);
        placeFree("쿠머", "kumer", kumer);
        if (done) done();
    }

    /**
     * 쇼케 배치
     * 규칙: 좌우 또는 상하가 모두 빈칸(empty) 또는 보호칸(protected)이어야 배치 가능
     * 전략: 전체를 작업대로 채운 상태에서 필요한 수량만큼만 작업대를 제거하고 쇼케를 놓는다
     */
    function placeShowke(count) {
        let placed = 0;

        // 작업대 후보들을 순회
        $(".tile.workbench").each(function () {
            if (placed >= count) return; // 다 채웠으면 종료

            const $t = $(this);
            const [r, c] = $t.data("rc").split(",").map(Number);

            const $up = getTile(r - 1, c);
            const $down = getTile(r + 1, c);
            const $left = getTile(r, c - 1);
            const $right = getTile(r, c + 1);

            // 헬퍼: 빈칸 or 보호칸 여부
            function isFreeOrProtected($nei) {
                if (!$nei.length) return false;
                return (!$nei.data("occupied") && !$nei.data("protected")) || $nei.data("protected");
            }

            const horizontalOk = isFreeOrProtected($left) && isFreeOrProtected($right);
            const verticalOk = isFreeOrProtected($up) && isFreeOrProtected($down);

            if (horizontalOk || verticalOk) {
                // ✅ 최소 제거: 작업대 지우고 쇼케 배치
                removeWorkbench(r, c);             // 작업대 제거 (보호칸 처리 포함)
                mark($t, "쇼케", "showke");        // 쇼케 표시
                placed++;

                // ✅ 보호칸 지정
                if (horizontalOk) {
                    protectTileRC(r, c - 1);
                    protectTileRC(r, c + 1);
                }
                if (verticalOk) {
                    protectTileRC(r - 1, c);
                    protectTileRC(r + 1, c);
                }
            }
        });

        if (placed < count) {
            console.warn(`⚠️ 쇼케 ${count}개 중 ${placed}개만 배치됨 (규칙 맞는 자리가 부족함)`);
        }
    }

    function refineWorkbenches() {
        // 규칙에 따라 작업대를 다시 최대치로 배치
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
                    // 이미 앵커/기타/기계 있는 자리에는 안 놓음
                    if (!$t.hasClass("gita") &&
                        !$t.hasClass("romer") &&
                        !$t.hasClass("kumer") &&
                        !$t.hasClass("pickup") &&
                        !$t.hasClass("cashier") &&
                        !$t.hasClass("judy") &&
                        !$t.hasClass("showke") &&
                        !$t.hasClass("trash") &&
                        !$t.data("occupied") &&
                        !$t.data("protected")) {
                        mark($t, "작업대", "workbench");
                    }
                }
            }
        }

        // 규칙 검증
        validateWorkbenches();

        // 🔹 추가 보정 단계: 아래나 오른쪽이 빈칸/보호칸이면 작업대 강제 배치
        for (let c = COLS - 1; c > 0; c--) {
            for (let r = ROWS - 1; r > 0; r--) {
                const $t = getTile(r, c);
                if ($t.length &&
                    !$t.hasClass("gita") &&
                    !$t.hasClass("romer") &&
                    !$t.hasClass("kumer") &&
                    !$t.hasClass("pickup") &&
                    !$t.hasClass("cashier") &&
                    !$t.hasClass("judy") &&
                    !$t.hasClass("showke") &&
                    !$t.hasClass("trash") &&
                    !$t.data("occupied") &&
                    !$t.data("protected")) {

                    const $down = getTile(r + 1, c);
                    const $right = getTile(r, c + 1);

                    function isFreeOrProtected($nei) {
                        return $nei.length && (!$nei.data("occupied") || $nei.data("protected"));
                    }

                    if (isFreeOrProtected($down) || isFreeOrProtected($right)) {
                        mark($t, "작업대", "workbench");
                    }
                }
            }
        }

        // 최종 개수 업데이트
        $("#workbenchCount").text($(".tile.workbench").length);
    }

    // ===================== 보드 조작 =====================
    function resetBoard() {
        $(".tile").each(function () {

            const $t = $(this);
            if ($t.hasClass("gita")) return;

            $(this).attr("class", "tile")
                .data({occupied: false, protected: false});
            $(this).next("text").text("").hide();
        });

        $("#workbenchCount").text(0);
        $("#coord-box").text("좌표 : -");
    }

    // 배치 시작
    $(".start-btn").on("click", function () {
        const $btn = $(this);
        if ($btn.text() === "배치 시작") {
            console.clear();
            showLoading();

            setTimeout(() => {
                placeWorkbenches();
                placeFixed();
                validateWorkbenches();

                const romer = parseInt($("#romer").text(), 10) || 0;
                const kumer = parseInt($("#kumer").text(), 10) || 0;
                const showke = parseInt($("#showke").text(), 10) || 0;
                const gita  = parseInt($("#gita").text(), 10) || 0;

                const totalNeed = romer + kumer + showke + gita;
                resetProgress();

                ensureFreeTiles(totalNeed, () => {
                    placeMachines(() => {
                        placeGita(gita);
                        refineWorkbenches();
                        hideLoading();
                        $btn.text("되돌리기");

                        // 초기화 버튼 추가 (없을 때만)
                        if ($("#reset-btn").length === 0) {
                            $btn.after(
                                `<button id="reset-btn" class="reset-btn">초기화</button>`
                            );

                            // 초기화 버튼 클릭 이벤트
                            $("#reset-btn").on("click", function () {
                                location.reload(); // 화면 새로고침
                            });
                        }
                    });
                });
            }, 500); // 살짝 딜레이 줘서 로딩 표시 보장
        } else {
            // 되돌리기 버튼 눌렀을 때
            resetBoard();
            $btn.text("배치 시작");

            // 초기화 버튼 제거
            $("#reset-btn").remove();
        }
    });

    // ===================== 도움말 모달 =====================
    $(function () {
        const $modal = $("#help-modal");
        const $close = $(".modal-close")

        // 1) 처음 방문 시 localStorage 확인
        if (!localStorage.getItem("help1")) {
            // 아직 본 적이 없으면 모달 자동 표시
            $modal.fadeIn(200).css("display", "flex");
            // 본 적 있다고 기록
            localStorage.setItem("help1", "true");
        }

        $("#help").on("click", function () {
            $modal.fadeIn(200).css("display", "flex");
        });

        $close.on("click", function () {
            $modal.fadeOut(200);
        });

        // 배경 클릭 시 닫기
        $modal.on("click", function (e) {
            if (e.target === this) {
                $modal.fadeOut(200);
            }
        });
    });

    // 좌표 표시
    const $coordBox = $("#coord-box");
    $(document).on("mouseenter", ".tile", function () {
        const rc = $(this).data("rc");
        $coordBox.text(`좌표 : ${rc}`);
    }).on("mouseleave", ".tile", function () {
        $coordBox.text("좌표 : -");
    });

    // 앵커 카운트
    $(".btn-inc").on("click", function () {
        const targetId = $(this).data("target");
        const $display = $("#" + targetId);
        let value = parseInt($display.text(), 10) || 0;
        $display.text(value + 1);
    });

    $(".btn-dec").on("click", function () {
        const targetId = $(this).data("target");
        const $display = $("#" + targetId);
        let value = parseInt($display.text(), 10) || 0;

        if (targetId === "gita") {
            // 🔹 현재 화면에 실제로 배치된 기타칸 수
            const placed = $(".tile.gita").length;

            // placed가 0 이상일 때만 제한 검증
            if (placed > 0 && value - 1 < placed) {
                alert(`현재 화면에 기타 가구가 ${placed}개 배치되어 있어서 ${placed}보다 작게 설정할 수 없습니다.`);
                return;
            }
        }

        if (value > 0) $display.text(value - 1);
    });
});