// 파일 경로 : worklog/main/main.js
// ========= 유틸 =========
import { extractSortedCategories, renderCategoryFilter, bindModalEvents } from '../common/modalUtils.js';

// ====== 상태 & 캐시 ======
let chart = null;
let currentDate = todayStr();

const $chartCanvas = $('#chart');
const $tbody = $('#data-table-body');
const $datePicker = $('#date-picker');
const $currentDateLabel = $('#current-date-label');
const $summaryText = $('#summary-text');

// ====== 유틸 ======
function todayStr() {
    const d = new Date();
    return d.toISOString().split('T')[0];
}

const formatDateKorean = (s) => {
    const [y, m, d] = s.split('-').map(Number);
    return `${pad2(m)}월 ${pad2(d)}일`;
};

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
    $currentDateLabel.text(formatDateKorean(currentDate));
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
    $('#edit-date').val(entry.date);

    // ✅ desc에서 카테고리/제목 분리
    let category = '';
    let title = entry.desc || '';
    const idx = title.indexOf(')');
    if (idx >= 0) {
        category = title.slice(0, idx).trim();
        title = title.slice(idx + 1).trim();
    }

    $('#edit-category').val(category);
    $('#edit-title').val(title);
    $('#edit-memo').val(entry.memo || '');
    $('#edit-start').val(entry.start);
    $('#edit-end').val(entry.end || '');
    $('#edit-backdrop').css('display', 'flex');
}

function closeEdit() {
    $('#edit-backdrop').hide();
}

let selectedCats = []; // ✅ 선택된 카테고리 상태
// ====== 표 렌더 & 차트 ======
function render() {
    const viewData = [...getData(currentDate)];

    // ✅ 카테고리 필터 적용
    const filtered = selectedCats.length === 0
        ? viewData
        : viewData.filter(e => {
            const desc = e.desc || '';
            const idx = desc.indexOf(')');
            const cat = idx >= 0 ? desc.slice(0, idx).trim() : '기타';
            return selectedCats.includes(cat);
        });

    filtered.sort((a, b) => (a.start || '').localeCompare(b.start || ''));

    $tbody.empty();
    if (filtered.length === 0) {
        $tbody.append(`<tr><td colspan="5" class="py-8 text-gray-400 text-center">일정 없음</td></tr>`);
    } else {
        $.each(filtered, function (_, entry) {
            const timeCell = entry.end ? `${formatHHMM(entry.start)} ~ ${formatHHMM(entry.end)}`
                : `${formatHHMM(entry.start)} <span class="text-xs text-gray-400">(진행중)</span>`;

            let category = '';
            let title = entry.desc || '';
            const idx = title.indexOf(')');
            if (idx >= 0) {
                category = title.slice(0, idx).trim();
                title = title.slice(idx + 1).trim();
            }

            let dur;
            if (entry.end) {
                dur = entry.duration ? minutesToHM(entry.duration) : '0분';
            } else {
                const now = new Date();
                const nowMin = now.getHours() * 60 + now.getMinutes();
                const startMin = parseHHMM(entry.start);
                const diff = Math.max(0, nowMin - startMin);
                dur = `(${minutesToHM(diff)} 경과)`;
            }

            const $tr = $('<tr/>').append(
                $('<td/>').addClass('time cell-nowrap').html(timeCell),
                $('<td/>').addClass('text-left cell-nowrap').text(category || '-'),
                $('<td/>').addClass('text-left font-semibold cell-nowrap').text(title || '-'),
                $('<td/>').addClass('type cell-nowrap').html(dur),
                $('<td/>').addClass('actions cell-nowrap').append(
                    $('<div/>').addClass('btn-group-nowrap')
                        .append(
                            $('<button/>', {class: 'btn btn-ghost', text: '수정'}).on('click', function (e) {
                                e.stopPropagation();
                                onEdit(entry.id);
                            }),
                            !entry.end ? $('<button/>', {
                                class: 'btn btn-outline',
                                text: '종료'
                            }).on('click', function (e) {
                                e.stopPropagation();
                                onEnd(entry.id);
                            }) : null,
                            $('<button/>', {class: 'btn btn-danger', text: '삭제'}).on('click', function (e) {
                                e.stopPropagation();
                                onDelete(entry.id);
                            })
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

    // ✅ 요약 & 차트도 필터된 데이터로 표시
    renderSummary(filtered);
    draw24hPie(filtered);

    const allCategories = extractSortedCategories(viewData);
    renderCategoryFilter('#category-filter', allCategories, selectedCats, (newCats) => {
        selectedCats = newCats;
        render(); // 변경 시 다시 렌더
    });
}

// ====== 시간 포맷 함수 ======
function minutesToHM(mins) {
    const m = Math.max(0, mins | 0);
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return (h ? `${h}시간 ` : '') + `${pad2(mm)}분`;
}

// ====== 요약 부분 수정 ======
function renderSummary(viewData) {
    let total = 0;
    $.each(viewData, function (_, e) {
        total += e.duration || 0;
    });
    $summaryText.html(`${minutesToHM(total)}`);
}

// 카테고리에서 제목만 추출
function cleanDesc(desc) {
    if (!desc) return '';
    const idx = desc.indexOf(')');
    return idx >= 0 ? desc.slice(idx + 1).trim() : desc;
}

// ====== 원형 그래프 ======
function draw24hPie(entries) {
    if (chart) chart.destroy();

    const ctxEl = $chartCanvas[0];

    // ✅ 카테고리별 고유 색상 매핑
    const categoryColors = {};
    const baseColors = [
        '#5a4398', // 메인 보라 (기준)
        '#7b5ae8', // 선명한 퍼플
        '#a855f7', // 보라핑크
        '#c084fc', // 연보라핑크
        '#d946ef', // 핫핑크 보라
        '#9333ea', // 진한 퍼플
        '#6d28d9', // 짙은 보라블루
        '#8b5cf6', // 보라+블루
        '#9b84f1', // 라벤더
        '#c6a6ff'  // 밝은 라벤더
    ];

    // 🔹 entries에 등장하는 순서대로 색상 부여
    let colorIndex = 0;
    entries.forEach(e => {
        const cat = e.desc?.includes(')') ? e.desc.split(')')[0].trim() : '기타';
        if (!categoryColors[cat]) {
            categoryColors[cat] = baseColors[colorIndex % baseColors.length];
            colorIndex++;
        }
    });

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

                // ✅ 배경원
                ctx.fillStyle = '#f3f4f6';
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, R, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();

                // ✅ 종료된 일정만 채우기
                const finished = entries.filter(e => e.end && e.duration > 0);
                $.each(finished, function (_, e) {
                    const sMin = parseHHMM(e.start), eMin = parseHHMM(e.end);
                    const sAng = -Math.PI / 2 + (sMin / 1440) * Math.PI * 2;
                    const eAng = -Math.PI / 2 + (eMin / 1440) * Math.PI * 2;
                    const cat = e.desc?.includes(')') ? e.desc.split(')')[0].trim() : '기타';
                    const color = categoryColors[cat] || '#999999';
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.arc(cx, cy, R, sAng, eAng, false);
                    ctx.closePath();
                    ctx.fill();

                    // ✅ 각 호(arc) 사이에 테두리 추가
                    ctx.strokeStyle = '#ffffff';   // 테두리 색
                    ctx.lineWidth = 0.2;           // 두께
                    ctx.stroke();
                });

                // ✅ 눈금
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

                // ✅ 섹터 라벨
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
                    const label = truncateForArc(cleanDesc(e.desc), approxChars);
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
    // ✅ 현재 시각 HHMM 자동 입력
    const now = new Date();
    const endRaw = pad2(now.getHours()) + pad2(now.getMinutes());

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
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
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
    $currentDateLabel.text(formatDateKorean(currentDate));

    // ✅ 초기 카테고리 목록 구성
    const todayData = getData(currentDate);
    const allCategories = extractSortedCategories(todayData);

    renderCategoryFilter('#category-filter', allCategories, selectedCats, (newCats) => {
        selectedCats = newCats;
        render(); // ✅ 필터 변경 시 다시 렌더
    });

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

    // 하루 전체 삭제
    $('#btn-clear-day').on('click', function () {
        if (!window.confirm(`${currentDate}의 모든 일정을 삭제하시겠습니까?`)) return;
        setData(currentDate, []);   // ✅ 해당 날짜 배열을 빈 값으로 저장
        render();
    });

    // 현재 시각 HHMM 문자열
    function nowHHMM() {
        const d = new Date();
        return pad2(d.getHours()) + pad2(d.getMinutes());
    }

    // 신규 일정 시작
    $('#schedule-form').on('submit', function (e) {
        e.preventDefault();

        const category = $('#entry-category').val().trim();
        const title = $('#entry-title').val().trim();
        const memo = $('#entry-memo').val().trim();

        if (!category || !title) return window.alert('카테고리와 제목을 모두 입력하세요.');

        // ✅ desc는 "카테고리)제목" 형태로 저장
        const desc = `${category}) ${title}`;

        // ✅ 시작 시간 자동 세팅
        const startRaw = nowHHMM();

        const arr = getData(currentDate);
        if (hasOngoing(arr)) return window.alert('이미 진행 중인 일정이 있습니다. 먼저 종료하세요.');

        const s = parseHHMM(startRaw);
        const overlaps = arr.some(it => {
            if (!it.end) return false;
            const aS = parseHHMM(it.start), aE = parseHHMM(it.end);
            return (aS <= s && s < aE);
        });
        if (overlaps) return window.alert('해당 시간대에 이미 일정이 있습니다.');

        const entry = {id: Date.now(), date: currentDate, desc, memo, start: startRaw, end: null, duration: null};
        arr.push(entry);
        setData(currentDate, arr);
        this.reset();
        render();
    });

    // 수정 저장
    $('#edit-form').on('submit', function (e) {
        e.preventDefault();
        const id = Number($('#edit-id').val());
        const newDate = $('#edit-date').val();   // 🔹 새 날짜
        const category = $('#edit-category').val().trim();
        const title = $('#edit-title').val().trim();
        if (!category || !title) return window.alert('카테고리와 제목을 모두 입력하세요.');
        const desc = `${category})${title}`;
        const memo = $('#edit-memo').val().trim();
        const start = $('#edit-start').val().trim();
        const end = $('#edit-end').val().trim();
        if (!/^\d{4}$/.test(start)) return window.alert('시작 시간은 4자리 숫자(HHMM)로 입력해 주세요.');
        if (end && !/^\d{4}$/.test(end)) return window.alert('종료 시간은 4자리 숫자(HHMM)로 입력해 주세요.');

        const oldArr = getData(currentDate);
        const entry = oldArr.find(x => x.id === id);
        if (!entry) return;

        // 시간 검증
        if (end) {
            const s = parseHHMM(start), en = parseHHMM(end);
            if (en <= s) return window.alert('종료 시간은 시작 시간보다 늦어야 합니다.');
            if (overlapsAny(oldArr, s, en, id)) return window.alert('다른 일정과 시간이 겹칩니다.');
            entry.end = end;
            entry.duration = en - s;
        } else {
            if (hasOngoing(oldArr, id)) return window.alert('이미 진행 중인 일정이 있습니다.');
            entry.end = null;
            entry.duration = null;
        }
        entry.desc = desc;
        entry.memo = memo;
        entry.start = start;

        // 🔹 날짜가 변경되었는지 체크
        if (entry.date !== newDate) {
            // 1) 기존 배열에서 제거
            const newOldArr = oldArr.filter(x => x.id !== id);
            setData(entry.date, newOldArr);

            // 2) 새 배열에 추가
            entry.date = newDate;
            const newArr = getData(newDate);
            newArr.push(entry);
            setData(newDate, newArr);

            // 3) 현재 날짜가 바뀐 일정의 날짜라면 화면 이동
            if (newDate !== currentDate) {
                setCurrentDate(newDate);
            } else {
                render();
            }
        } else {
            setData(currentDate, oldArr);
            render();
        }

        closeEdit();
    });

    // 편의 버튼들
    $('#btn-edit-cancel').on('click', closeEdit);

    function scheduleRenderEveryMinute() {
        render(); // 처음 즉시 실행

        // 다음 분 정각까지 남은 ms 계산
        const now = new Date();
        const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

        setTimeout(function tick() {
            render();
            setTimeout(tick, 60000); // 이후는 정확히 1분 간격
        }, delay);
    }

    scheduleRenderEveryMinute();

    // ====== 자동완성 (카테고리 + 제목) ======
    const $catInput = $('#entry-category');
    const $titleInput = $('#entry-title');
    const $catSuggestions = $('#category-suggestions');
    const $titleSuggestions = $('#title-suggestions');

    // ✅ 저장된 데이터에서 카테고리 목록 수집
    function getAllCategories() {
        const map = getMap();
        const categories = new Set();

        Object.values(map).forEach(arr => {
            arr.forEach(e => {
                if (e.desc && e.desc.includes(')')) {
                    const idx = e.desc.indexOf(')');
                    const cat = e.desc.slice(0, idx).trim();
                    if (cat) categories.add(cat);
                }
            });
        });

        return Array.from(categories);
    }

    // 🔹 카테고리 입력 시 자동완성 표시
    $catInput.on('focus input', function () {
        const val = $(this).val().trim();
        const allCats = getAllCategories();
        if (allCats.length === 0) {
            $catSuggestions.hide();
            return;
        }

        const filtered = val
            ? allCats.filter(c => c.includes(val))
            : allCats; // 입력 없으면 전체 표시

        if (filtered.length === 0) return $catSuggestions.hide();

        $catSuggestions.empty();
        filtered.forEach(cat => {
            $('<div/>')
                .addClass('px-2 py-1 cursor-pointer hover:bg-gray-100')
                .text(cat)
                .on('click', function () {
                    $catInput.val(cat);
                    $catSuggestions.hide();
                })
                .appendTo($catSuggestions);
        });
        $catSuggestions.show();
    });

    // 🔹 제목 자동완성: 최근 7일 내 포함 검색
    function getRecentTitles(keyword) {
        const titles = new Set();
        const today = toDate(todayStr());
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
            const arr = getData(dateStr);
            arr.forEach(e => {
                const desc = e.desc || '';
                const title = cleanDesc(desc); // 괄호 이후 부분
                if (title && (!keyword || title.includes(keyword))) {
                    titles.add(title);
                }
            });
        }
        return Array.from(titles);
    }

    $titleInput.on('input', function () {
        const val = $(this).val().trim();
        if (!val) return $titleSuggestions.hide();

        const matches = getRecentTitles(val);
        if (matches.length === 0) return $titleSuggestions.hide();

        $titleSuggestions.empty();
        matches.forEach(title => {
            $('<div/>')
                .addClass('px-2 py-1 cursor-pointer hover:bg-gray-100')
                .text(title)
                .on('click', function () {
                    $titleInput.val(title);
                    $titleSuggestions.hide();
                })
                .appendTo($titleSuggestions);
        });
        $titleSuggestions.show();
    });

    // 🔹 입력창 밖 클릭 시 닫기
    $(document).on('click', function (e) {
        if (!$(e.target).closest('#entry-category, #category-suggestions').length)
            $catSuggestions.hide();
        if (!$(e.target).closest('#entry-title, #title-suggestions').length)
            $titleSuggestions.hide();
    });

    // ========= 모달 관련 =========
    bindModalEvents('#btn-filter', ['#btn-filter-close', '#btn-filter-apply'], '#filter-modal');
});