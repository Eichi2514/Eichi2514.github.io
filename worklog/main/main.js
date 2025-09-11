// ====== 상태 & 캐시 ======
let chart = null;
let currentDate = todayStr();

const $chartCanvas = $('#chart');
const $tbody = $('#data-table-body');
const $datePicker = $('#date-picker');
const $currentDateLabel = $('#current-date-label');
const $summaryText = $('#summary-text');
const $memoToast = $('#memo-toast');

// ====== 유틸 ======
function todayStr() {
    const d = new Date();
    return d.toISOString().split('T')[0];
}

function toDate(s) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function pad2(n) {
    return String(n).padStart(2, '0');
}

function parseHHMM(h) {
    const hh = parseInt(h.slice(0, 2), 10), mm = parseInt(h.slice(2), 10);
    return hh * 60 + mm;
}

function formatHHMM(h) {
    return h.slice(0, 2) + ':' + h.slice(2);
}

function labelForType(t) {
    return t === 'work' ? '<span class="pill pill-work">작업</span>' : '<span class="pill pill-other">기타</span>';
}

function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;'
    }[m]));
}

function normalizeMemo(s) {
    return (s || '').replace(/\r?\n/g, '\n').replace(/^\s+/, '').replace(/\s+$/, '').replace(/\n[ \t]+/g, '\n');
}

// 저장할 때
function saveCompressed(key, obj) {
    const json = JSON.stringify(obj);
    const compressed = LZString.compressToUTF16(json);
    localStorage.setItem(key, "__LZUTF16__" + compressed); // ← 프리픽스
}

// 불러올 때
const LZ_PREFIX = "__LZUTF16__";

function loadAnyAndMigrateToCompressed(key) {
    const v = localStorage.getItem(key);
    if (v == null) return {obj: null, migrated: false, fmt: "missing"};

    // 1) 새 포맷: 프리픽스 있는 압축
    if (v.startsWith(LZ_PREFIX)) {
        try {
            const json = LZString.decompressFromUTF16(v.slice(LZ_PREFIX.length));
            return {obj: json ? JSON.parse(json) : null, migrated: false, fmt: "compressed"};
        } catch {
            return {obj: null, migrated: false, fmt: "compressed_bad"};
        }
    }

    // 2) 비압축 JSON → 즉시 압축으로 재저장
    try {
        const obj = JSON.parse(v);
        saveCompressed(key, obj); // ★ 재저장(마이그레이션)
        return {obj, migrated: true, fmt: "json"};
    } catch {
        // 3) 프리픽스 없는 압축 → 즉시 압축+프리픽스로 재저장
        try {
            const json = LZString.decompressFromUTF16(v);
            if (json) {
                const obj = JSON.parse(json);
                saveCompressed(key, obj); // ★ 재저장(마이그레이션)
                return {obj, migrated: true, fmt: "compressed_legacy"};
            }
        } catch {
        }
    }

    return {obj: null, migrated: false, fmt: "unknown"};
}

// ====== 저장소 ======
const STORAGE_KEY = 'scheduleByDate';

function getMap() {
    // ① 어떤 상태든 읽고, 비압축/무프리픽스면 즉시 압축으로 재저장
    const {obj} = loadAnyAndMigrateToCompressed(STORAGE_KEY);
    if (obj && typeof obj === 'object') return obj;

    // ② 구버전('scheduleData' 배열) → 맵으로 변환 후 압축 저장
    const legacyArr = JSON.parse(localStorage.getItem('scheduleData') || '[]');
    if (Array.isArray(legacyArr) && legacyArr.length) {
        const map = {};
        legacyArr.forEach(e => {
            (map[e.date] ||= []).push(e);
        });
        saveCompressed(STORAGE_KEY, map);
        localStorage.removeItem('scheduleData');
        return map;
    }

    // ③ 아무것도 없으면 빈 맵을 압축 포맷으로 생성
    const empty = {};
    saveCompressed(STORAGE_KEY, empty);
    return empty;
}

function setMap(map) {
    saveCompressed(STORAGE_KEY, map);
}

function getData(date) {
    const map = getMap();
    return map[date] || [];
}

function setData(date, arr) {
    const map = getMap();
    map[date] = arr;
    setMap(map);
}

// ====== 날짜 제어 ======
function getDateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('date');
}

function updateUrlDate(dateStr) {
    const params = new URLSearchParams(window.location.search);
    params.set('date', dateStr);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    history.replaceState({}, '', newUrl);
}

function setCurrentDate(dateStr) {
    if (!dateStr) return;
    currentDate = dateStr;
    $datePicker.val(currentDate);
    $currentDateLabel.text(currentDate);
    updateUrlDate(currentDate); // ✅ URL 반영
    render();
}

function changeDate(delta) {
    const d = toDate(currentDate);
    d.setDate(d.getDate() + delta);
    const nextDate = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    setCurrentDate(nextDate);
}

// ====== 겹침 검사 ======
function overlapsAny(arr, s, e, ignoreId) {
    return arr.some(it => {
        if (ignoreId && it.id === ignoreId) return false;
        if (!it.end) return false; // 진행중은 비교에서 제외
        const aS = parseHHMM(it.start), aE = parseHHMM(it.end);
        return Math.max(aS, s) < Math.min(aE, e); // 열린구간 교차
    });
}

function hasOngoing(arr, ignoreId) {
    return arr.some(it => !it.end && (!ignoreId || it.id !== ignoreId));
}

// ====== 수정 모달 ======
function openEdit(entry) {
    $('#edit-id').val(entry.id);
    $('#edit-desc').val(entry.desc);
    $('#edit-memo').val(entry.memo || '');
    $('#edit-start').val(entry.start);
    $('#edit-end').val(entry.end || '');
    $('#edit-type').val(entry.type === 'work' ? 'work' : 'other');
    $('#edit-backdrop').css('display', 'flex');
}

function closeEdit() {
    $('#edit-backdrop').hide();
}

// ====== 표 렌더 & 차트 ======
function render() {
    const rawData = [...getData(currentDate)];
    const viewData = rawData.filter(e => e.type !== 'break'); // 휴식 무시
    viewData.sort((a, b) => (a.start || '').localeCompare(b.start || ''));

    $tbody.empty();
    if (viewData.length === 0) {
        $tbody.append(`<tr><td colspan="5" class="py-8 text-gray-400 text-center">일정 없음</td></tr>`);
    } else {
        $.each(viewData, function (_, entry) {
            const timeCell = entry.end ? `${formatHHMM(entry.start)} ~ ${formatHHMM(entry.end)}`
                : `${formatHHMM(entry.start)} <span class="text-xs text-gray-400">(진행중)</span>`;
            const typeLabel = labelForType(entry.type);
            const titleHtml = `<div class="ellipsis title-clip">${escapeHtml(entry.desc)}</div>`;
            const dur = entry.duration ? minutesToHM(entry.duration) : (entry.end ? '0분' : '진행중');
            const $tr = $('<tr/>').addClass('data-row').append(
                $('<td/>').addClass('time cell-nowrap').html(timeCell),
                $('<td/>').addClass('text-left font-semibold cell-nowrap').html(titleHtml),
                $('<td/>').addClass('type cell-nowrap').html(typeLabel),
                $('<td/>').addClass('type cell-nowrap').html(dur),
                $('<td/>').addClass('actions cell-nowrap').append(
                    $('<div/>').addClass('btn-group-nowrap')
                        .append(
                            $('<button/>', {class: 'btn btn-ghost', text: '수정'}).on('click', function (e) {
                                e.stopPropagation();
                                onEdit(entry.id);
                            }),
                            $('<button/>', {class: 'btn btn-danger', text: '삭제'}).on('click', function (e) {
                                e.stopPropagation();
                                onDelete(entry.id);
                            }),
                            !entry.end ? $('<button/>', {
                                class: 'btn btn-outline',
                                text: '종료'
                            }).on('click', function (e) {
                                e.stopPropagation();
                                onEnd(entry.id);
                            }) : null
                        )
                )
            );

            const memo = entry.memo;
            const $tr2 = $('<tr/>').addClass('data-row').append(
                $('<td/>')
                    .attr('colspan', 5)
                    .addClass('text-left px-5')
                    .css({
                        'max-width': '50vw',
                        'white-space': 'pre-wrap',
                        'word-break': 'keep-all',
                        'overflow-wrap': 'break-word'
                    })
                    .text(memo)
            );
            $tbody.append($tr);
            if (memo !== '') {
                $tbody.append($tr2);
            }
        });
    }

    renderSummary(viewData)
    draw24hPie(viewData);
}

// ====== 시간 포맷 함수 ======
function minutesToHM(mins) {
    const m = Math.max(0, mins | 0);
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return (h ? `${h}시간 ` : '') + `${mm}분`;
}

// ====== 요약 부분 수정 ======
function renderSummary(viewData) {
    let totalWork = 0, totalOther = 0;
    $.each(viewData, function (_, e) {
        const d = e.duration || 0;
        if (e.type === 'work') totalWork += d; else totalOther += d;
    });
    const recorded = totalWork + totalOther;
    $summaryText.html(`
        작업 : ${minutesToHM(totalWork)}
    `);
}

// ====== 원형 그래프 ======
function draw24hPie(entries) {
    if (chart) chart.destroy();

    const ctxEl = $chartCanvas[0];
    chart = new Chart(ctxEl, {
        type: 'pie',
        data: {labels: [], datasets: [{data: [1], backgroundColor: ['rgba(0,0,0,0)'], borderWidth: 0}]},
        options: {
            rotation: -Math.PI / 2,
            circumference: Math.PI * 2,
            plugins: {legend: {display: false}, tooltip: {enabled: false}},
            animation: false,
            maintainAspectRatio: false
        },
        plugins: [{
            id: 'interval-sectors', afterDraw(c) {
                const ctx = c.ctx, area = c.chartArea;
                const cx = (area.left + area.right) / 2, cy = (area.top + area.bottom) / 2;
                const R = Math.min(area.width, area.height) / 2;
                ctx.save();
                // 배경원
                ctx.fillStyle = '#f3f4f6';
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, R, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
                // 종료된 일정만 채우기
                const finished = entries.filter(e => e.end && e.duration > 0);
                const colorOf = t => t === 'work' ? 'rgba(90,67,152,0.95)' : 'rgba(107,114,128,0.95)';
                $.each(finished, function (_, e) {
                    const sMin = parseHHMM(e.start), eMin = parseHHMM(e.end);
                    const sAng = -Math.PI / 2 + (sMin / 1440) * Math.PI * 2;
                    const eAng = -Math.PI / 2 + (eMin / 1440) * Math.PI * 2;
                    ctx.fillStyle = colorOf(e.type);
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.arc(cx, cy, R, sAng, eAng, false);
                    ctx.closePath();
                    ctx.fill();
                });
                // 눈금
                ctx.strokeStyle = '#d1d5db';
                ctx.lineWidth = 1;
                const tickOuter = R, tickInner = R * 0.96;
                for (let h = 0; h < 24; h++) {
                    const ang = -Math.PI / 2 + (h / 24) * Math.PI * 2;
                    const isMajor = (h % 3 === 0);
                    const ti = isMajor ? R * 0.93 : tickInner;
                    ctx.beginPath();
                    ctx.moveTo(cx + Math.cos(ang) * tickOuter, cy + Math.sin(ang) * tickOuter);
                    ctx.lineTo(cx + Math.cos(ang) * ti, cy + Math.sin(ang) * ti);
                    ctx.stroke();
                    if (isMajor) {
                        const tx = cx + Math.cos(ang) * R * 0.86, ty = cy + Math.sin(ang) * R * 0.86 + 4;
                        ctx.fillStyle = '#6b7280';
                        ctx.font = '12px Segoe UI, system-ui, -apple-system, sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText(String(h).padStart(2, '0'), tx, ty);
                    }
                }
                // 섹터 라벨
                ctx.fillStyle = '#ffffff';
                $.each(finished, function (_, e) {
                    const sMin = parseHHMM(e.start), eMin = parseHHMM(e.end);
                    let sAng = -Math.PI / 2 + (sMin / 1440) * Math.PI * 2;
                    let eAng = -Math.PI / 2 + (eMin / 1440) * Math.PI * 2;
                    if (eAng < sAng) eAng += Math.PI * 2;
                    const mid = (sAng + eAng) / 2;
                    const span = eAng - sAng;
                    if (span < (15 / 1440) * Math.PI * 2) return;
                    const rx = cx + Math.cos(mid) * R * 0.68, ry = cy + Math.sin(mid) * R * 0.68;
                    const approxChars = Math.max(4, Math.floor(span / (Math.PI * 2) * 24));
                    const label = truncateForArc(e.desc, approxChars);
                    const padX = 6, padY = 4;
                    ctx.font = '12px Segoe UI, system-ui, -apple-system, sans-serif';

                    // 텍스트 실제 높이(미지원 브라우저 대비 기본값 12)
                    const m = ctx.measureText(label);
                    const textW = m.width;
                    const textH = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) || 12;

                    // 박스를 (rx, ry) 기준 정중앙 배치
                    const boxW = textW + padX * 2;
                    const boxH = textH + padY * 2;
                    const boxX = rx - boxW / 2;
                    const boxY = ry - boxH / 2;

                    ctx.fillStyle = 'rgba(0,0,0,0.35)';
                    roundRect(ctx, boxX, boxY, boxW, boxH, 6);
                    ctx.fill();

                    // 텍스트도 정확히 중앙 정렬
                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(label, rx, ry);

                });
                ctx.restore();
                // 클릭판정 메타
                c._sectors = finished.map(e => ({
                    entry: e,
                    start: -Math.PI / 2 + (parseHHMM(e.start) / 1440) * Math.PI * 2,
                    end: -Math.PI / 2 + (parseHHMM(e.end) / 1440) * Math.PI * 2
                }));
                c._hit = {cx, cy, R};
            }
        }]
    });

    $chartCanvas.off('click').on('click', function (evt) {
        const rect = this.getBoundingClientRect();
        const x = evt.clientX - rect.left, y = evt.clientY - rect.top;
        const meta = chart._hit || {};
        if (!meta.cx) return;
        const dx = x - meta.cx, dy = y - meta.cy, r = Math.hypot(dx, dy);
        if (r > meta.R) return;
        let ang = Math.atan2(dy, dx);
        if (ang < -Math.PI / 2) ang += Math.PI * 2;
        const hit = (chart._sectors || []).find(seg => {
            let s = seg.start, e = seg.end;
            if (e < s) e += Math.PI * 2;
            let a = ang;
            if (a < s) a += Math.PI * 2;
            return s <= a && a <= e;
        });
    });
}

function truncateForArc(text, approxChars) {
    const t = (text || '').trim();
    return (t.length <= approxChars) ? t : t.slice(0, Math.max(0, approxChars - 1)) + '…';
}

function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
}

// ====== 액션 ======
function onEnd(id) {
    const endRaw = window.prompt('종료 시간(HHMM)을 입력하세요. 예: 1130');
    if (!endRaw) return;
    if (!/^\d{4}$/.test(endRaw)) return window.alert('종료 시간은 4자리 숫자(HHMM)로 입력해 주세요.');
    const arr = getData(currentDate);
    const entry = arr.find(e => e.id === id);
    if (!entry) return;
    const s = parseHHMM(entry.start), en = parseHHMM(endRaw);
    if (en <= s) return window.alert('종료 시간은 시작 시간보다 늦어야 합니다.');
    if (overlapsAny(arr, s, en, id)) return window.alert('다른 일정과 시간이 겹칩니다.');
    entry.end = endRaw;
    entry.duration = en - s;
    setData(currentDate, arr);
    render();
}

function onEdit(id) {
    const arr = getData(currentDate);
    const e = arr.find(x => x.id === id);
    if (e) openEdit(e);
}

function onDelete(id) {
    if (!window.confirm('정말 삭제할까요?')) return;
    const arr = getData(currentDate).filter(e => e.id !== id);
    setData(currentDate, arr);
    render();
}

// ====== 이벤트 바인딩 ======
$(function () {
    // 초기화: URL → 없으면 오늘 날짜
    const urlDate = getDateFromUrl();
    if (urlDate) {
        currentDate = urlDate;
    } else {
        currentDate = todayStr();
        updateUrlDate(currentDate); // ✅ 기본값도 URL 반영
    }

    $datePicker.val(currentDate);
    $currentDateLabel.text(currentDate);

    // 날짜 변경
    $('.date-bar .btn.btn-ghost[data-delta]').on('click', function () {
        changeDate(parseInt($(this).data('delta'), 10));
    });
    $datePicker.on('change', function () {
        setCurrentDate($(this).val());
    });
    $('#btn-today').on('click', function () {
        setCurrentDate(todayStr());
    });

    // 신규 일정 시작
    $('#schedule-form').on('submit', function (e) {
        e.preventDefault();
        const desc = $('#entry-desc').val().trim();
        const memo = $('#entry-memo').val().trim();
        const startRaw = $('#start-time').val().trim();
        const type = $('#entry-type').val();
        if (!/^\d{4}$/.test(startRaw)) return window.alert('시작 시간은 4자리 숫자(HHMM)로 입력해 주세요.');

        const arr = getData(currentDate);
        if (hasOngoing(arr)) return window.alert('이미 진행 중인 일정이 있습니다. 먼저 종료하세요.');

        const s = parseHHMM(startRaw);
        const overlaps = arr.some(it => {
            if (!it.end) return false;
            const aS = parseHHMM(it.start), aE = parseHHMM(it.end);
            return (aS <= s && s < aE);
        });
        if (overlaps) return window.alert('해당 시간대에 이미 일정이 있습니다.');

        const entry = {id: Date.now(), date: currentDate, desc, memo, type, start: startRaw, end: null, duration: null};
        arr.push(entry);
        setData(currentDate, arr);
        this.reset();
        render();
    });

    // 수정 저장
    $('#edit-form').on('submit', function (e) {
        e.preventDefault();
        const id = Number($('#edit-id').val());
        const desc = $('#edit-desc').val().trim();
        const memo = $('#edit-memo').val().trim();
        const start = $('#edit-start').val().trim();
        const end = $('#edit-end').val().trim();
        const type = $('#edit-type').val();
        if (!/^\d{4}$/.test(start)) return window.alert('시작 시간은 4자리 숫자(HHMM)로 입력해 주세요.');
        if (end && !/^\d{4}$/.test(end)) return window.alert('종료 시간은 4자리 숫자(HHMM)로 입력해 주세요.');

        const arr = getData(currentDate);
        const entry = arr.find(x => x.id === id);
        if (!entry) return;

        if (end) {
            const s = parseHHMM(start), en = parseHHMM(end);
            if (en <= s) return window.alert('종료 시간은 시작 시간보다 늦어야 합니다.');
            if (overlapsAny(arr, s, en, id)) return window.alert('다른 일정과 시간이 겹칩니다.');
            entry.end = end;
            entry.duration = en - s;
        } else {
            if (hasOngoing(arr, id)) return window.alert('이미 진행 중인 일정이 있습니다.');
            entry.end = null;
            entry.duration = null;
        }
        entry.desc = desc;
        entry.memo = memo;
        entry.start = start;
        entry.type = (type === 'work' ? 'work' : 'other');
        setData(currentDate, arr);
        closeEdit();
        render();
    });

    // 편의 버튼들
    $('#btn-edit-cancel').on('click', closeEdit);

    // 렌더 시작
    render();
});