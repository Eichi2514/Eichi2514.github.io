// 파일 경로 : worklog/summary/summary.js
// ========= 유틸 =========
const pad2 = n => String(n).padStart(2, '0');
const formatDateKorean = (s) => {
    const [y, m, d] = s.split('-').map(Number);
    return `${pad2(m)}월 ${pad2(d)}일`;
};
const toDate = s => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
};
const addDays = (s, k) => {
    const d = toDate(s);
    d.setDate(d.getDate() + k);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const minutesToHM = m => {
    m = Math.max(0, m | 0);
    const h = Math.floor(m / 60), mm = m % 60;
    return (h ? `${h}시간 ` : '') + `${pad2(mm)}분`;
};
const parseHHMM = h => {
    if (!h || h.length < 4) return null;
    const hh = +h.slice(0, 2), mm = +h.slice(2);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh * 60 + mm;
};
const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
const dayOfWeek = s => weekdays[toDate(s).getDay()];

// ========= 스토리지 (압축) =========
const STORAGE_KEY = 'scheduleByDate';
const LZ_PREFIX = '__LZUTF16__';

function saveCompressed(key, obj) {
    const json = JSON.stringify(obj);
    const compressed = LZString.compressToUTF16(json);
    localStorage.setItem(key, LZ_PREFIX + compressed);
}

function loadAnyAndMigrateToCompressed(key) {
    const v = localStorage.getItem(key);
    if (v == null) return {obj: null, migrated: false};
    if (v.startsWith(LZ_PREFIX)) {
        try {
            const json = LZString.decompressFromUTF16(v.slice(LZ_PREFIX.length));
            return {obj: json ? JSON.parse(json) : null, migrated: false};
        } catch {
            return {obj: null, migrated: false};
        }
    }
    // 비압축 JSON → 압축 재저장
    try {
        const obj = JSON.parse(v);
        saveCompressed(key, obj);
        return {obj, migrated: true};
    } catch {
    }
    // 프리픽스 없는 압축 → 압축 재저장
    try {
        const json = LZString.decompressFromUTF16(v);
        if (json) {
            const obj = JSON.parse(json);
            saveCompressed(key, obj);
            return {obj, migrated: true};
        }
    } catch {
    }
    return {obj: null, migrated: false};
}

// 한번만 읽어 캐시
let scheduleMap = {};

function refreshScheduleCache() {
    const {obj} = loadAnyAndMigrateToCompressed(STORAGE_KEY);
    scheduleMap = obj || {};
}

// 게이지 색상 계산 함수
function getWorkColor(minutes) {
    const maxMin = 8 * 60; // 8시간 기준
    const ratio = Math.min(minutes / maxMin, 1); // 0~1
    // 연한 파랑 (#b0c4f6) → 진한 남색 (#1e3a8a)
    const start = {r: 176, g: 196, b: 246}; // #b0c4f6
    const end = {r: 30, g: 58, b: 138}; // #1e3a8a
    const r = Math.round(start.r + (end.r - start.r) * ratio);
    const g = Math.round(start.g + (end.g - start.g) * ratio);
    const b = Math.round(start.b + (end.b - start.b) * ratio);
    return `rgb(${r},${g},${b})`;
}

// ========= 데이터 로드 =========
function getEntriesForDate(dateStr) {
    // 1) 메인 포맷
    if (Array.isArray(scheduleMap[dateStr])) return scheduleMap[dateStr];

    // 2) 레거시 개별 키 (혹시 남아있다면)
    const [y, m, d] = dateStr.split('-');
    const candidates = [
        `worklog:${dateStr}`,
        `entries:${dateStr}`,
        `worklog:${y}-${Number(m)}-${Number(d)}`,
        `entries:${y}-${Number(m)}-${Number(d)}`
    ];
    for (const k of candidates) {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        try {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) return arr;
        } catch {
        }
    }
    return [];
}

function aggregateForDate(dateStr) {
    const entries = getEntriesForDate(dateStr);
    let total = 0;
    const taskMap = {}; // 제목별 합산용

    for (const e of entries) {
        if (!e || !e.end) continue;
        let dur = (typeof e.duration === 'number') ? e.duration : null;
        if (dur == null) {
            const s = parseHHMM(e.start), t = parseHHMM(e.end);
            if (s == null || t == null) continue;
            dur = Math.max(0, t - s);
        }
        total += dur;

        // 제목별 누적
        const title = e.desc || '(제목없음)';
        taskMap[title] = (taskMap[title] || 0) + dur;
    }

    // taskMap → 배열 변환 + 내림차순 정렬
    const tasks = Object.entries(taskMap)
        .map(([title, minutes]) => ({title, minutes}))
        .sort((a, b) => b.minutes - a.minutes);

    return {total, tasks};
}

function aggregateRange(from, to) {
    const rows = [];
    let sumTotal = 0;
    const taskMap = {}; // ✅ 기간 전체 작업별 합산 + 날짜별 기록

    for (let d = from, i = 0; ; d = addDays(d, 1), i++) {
        const agg = aggregateForDate(d);
        rows.push({date: d, ...agg});
        sumTotal += agg.total;

        // 기간 전체 task 합산 + 날짜별 기록
        if (agg.tasks) {
            for (const t of agg.tasks) {
                if (!taskMap[t.title]) taskMap[t.title] = {minutes: 0, dates: []};
                taskMap[t.title].minutes += t.minutes;
                taskMap[t.title].dates.push({date: d, minutes: t.minutes});
            }
        }

        if (d === to) break;
        if (i > 3700) break;
    }

    // taskMap → 정렬된 배열
    const tasks = Object.entries(taskMap)
        .map(([title, data]) => ({title, minutes: data.minutes, dates: data.dates}))
        .sort((a, b) => b.minutes - a.minutes);

    return {rows, sumTotal, tasks};
}

// ========= 렌더 =========
function renderGrid(from, to) {
    const {rows, sumTotal, tasks} = aggregateRange(from, to);
    const $grid = $('#result-grid').empty();

    const DAY_MIN = 4 * 60;
    let hasAnyDuration = false;

    // ✅ 첫날 요일 구해서 앞에 빈칸 넣기
    const firstDay = toDate(from).getDay();
    // 0=일요일, 1=월요일... → 월요일부터 시작하려면 보정
    const offset = (firstDay === 0 ? 6 : firstDay - 1);
    for (let i = 0; i < offset; i++) {
        $grid.append(`<div class="empty-tile"></div>`);
    }

    rows.forEach(r => {
        let totalMin = Math.max(0, r.total | 0);
        if (totalMin > 0) hasAnyDuration = true;

        // 게이지 길이는 4시간(DAY_MIN)까지만 스케일링
        let gaugeMin = totalMin;
        if (gaugeMin > DAY_MIN) {
            gaugeMin = DAY_MIN;
        }

        const tPct = Math.round((gaugeMin / DAY_MIN) * 100);
        let nPct = 100 - tPct;
        if (nPct < 0) nPct = 0;

        // ✅ 주말 체크
        const weekday = toDate(r.date).getDay(); // 0=일, 6=토
        const weekendClass = (weekday === 0 || weekday === 6) ? " weekend" : "";
        const color = getWorkColor(totalMin);

        // ✅ 일정이 있으면 삭제 버튼 포함, 없으면 제외
        const deleteBtnHtml = (r.total > 0)
            ? `<button class="day-delete" title="하루 삭제">×</button>`
            : '';

        // ✅ 작업내용 HTML 추가
        const taskListHtml = (r.tasks && r.tasks.length > 0)
            ? `
          <div class="mt-1 text-xs space-y-0.5">
            ${r.tasks.map(t => {
                const displayTitle = t.title.includes(')')
                    ? t.title.split(')').slice(1).join(')').trim()
                    : t.title;
                return `
                    <div class="flex justify-between gap-2">
                        <span class="truncate max-w-[100px]" title="${t.title}">${displayTitle}</span>
                        <span class="shrink-0">${minutesToHM(t.minutes)}</span>
                    </div>
                `;
            }).join('')}
          </div>
        ` : '';

        const $tile = $(`
            <div class="day-tile${weekendClass}">
                ${deleteBtnHtml}
                <div class="day-date${weekendClass}">${formatDateKorean(r.date)} (${dayOfWeek(r.date)})</div>
                <div class="flex flex-col gap-1 text-[12px]">
                <div class="flex items-center justify-between">
                    <span>시간</span>                    
                    ${r.total ? `<span class="badge">${minutesToHM(r.total)}</span>` : ''}
                </div>
            </div>
            <div class="day-bar" aria-hidden="true">
                <div class="bar-seg bar-total" style="width:${tPct}%; background-color:${color}"></div>
                <div class="bar-seg bar-empty" style="width:${nPct}%"></div>
            </div>            
                ${taskListHtml}
        </div>
    `);

        // ✅ 삭제 버튼 이벤트
        $tile.find('.day-delete').on('click', (e) => {
            e.stopPropagation(); // 날짜 클릭 이벤트 막기
            if (!window.confirm(`${formatDateKorean(r.date)}의 모든 일정을 삭제하시겠습니까?`)) return;

            // 스토리지에서 해당 날짜 제거
            refreshScheduleCache();
            delete scheduleMap[r.date];
            saveCompressed(STORAGE_KEY, scheduleMap);

            // 다시 렌더링
            renderGrid(from, to);
        });

        // ✅ 날짜 클릭 시 작업일지로 이동
        $tile.on('click', () => {
            window.location.href = `../main/main.html?date=${r.date}`;
        });

        $grid.append($tile);
    });

    // “집계할 데이터 없음”은 총 소요가 0일 때만 표시
    $('#empty').toggleClass('hidden', hasAnyDuration);
    $('#sum-total').text(minutesToHM(sumTotal));

    // 목록용 HTML
    let tasksHtml = '';
    if (tasks.length > 0) {
        tasksHtml = `
            <div id="sum-tasks" class="mt-2 text-sm">
                ${tasks.map((t, idx) => `
                    <div class="flex justify-between items-center gap-2 min-w-0 task-item cursor-pointer" 
                         data-task-idx="${idx}">
                        <div class="min-w-0 flex-1">
                            <span 
                            class="block truncate overflow-hidden whitespace-nowrap text-ellipsis w-full max-w-[120px]" 
                            title="${t.title}">
                                ${t.title}
                            </span>
                        </div>
                        <span class="shrink-0">${minutesToHM(t.minutes)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    const $sumTaske = $('#sum-tasks')
    $sumTaske.find('#sum-tasks').remove(); // 이전거 제거
    $sumTaske.append(tasksHtml);

    // ✅ 클릭 이벤트: task 상세 보기 → 모달 띄우기
    $('#sum-tasks .task-item').on('click', function () {
        const idx = $(this).data('task-idx');
        const task = tasks[idx];
        if (!task) return;

        // 모달 HTML
        const modalHtml = `
            <div id="task-modal-overlay" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-lg p-4 relative" style="min-width:320px;">                    
                    <button id="task-modal-close" class="absolute text-3xl top-2 right-2 text-gray-500 hover:text-black">&times;</button>                    
                    <div class="font-semibold text-xl mb-2 mr-8">${task.title} 작업일</div>  
                    <div class="max-h-60 overflow-y-auto text-lg pr-1">
                        ${task.dates.map(d => `
                            <a href="../main/main.html?date=${d.date}" class="modal-date-item flex justify-between py-1 border-b last:border-0 rounded transition-colors">
                                <span>${d.date}</span>
                                <span>${minutesToHM(d.minutes)}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // 기존 모달 제거 후 새로 추가
        $('#task-modal-overlay').remove();
        $('body').append(modalHtml);

        // 닫기 이벤트 (배경이나 × 버튼 클릭 시 닫기)
        $('#task-modal-close, #task-modal-overlay').on('click', function (e) {
            if (e.target.id === 'task-modal-overlay' || e.target.id === 'task-modal-close') {
                $('#task-modal-overlay').remove();
            }
        });
    });
}

let currentMonthOffset = 0; // 오늘 기준 offset (0=이번 달, -1=이전 달, +1=다음 달 ...)

// ========= 초기화 =========
function setMonth(offsetChange) {
    const d = new Date();
    currentMonthOffset += offsetChange; // 버튼 클릭 시마다 +1, -1 누적

    const target = new Date(d.getFullYear(), d.getMonth() + currentMonthOffset, 1);

    // 해당 달 1일
    const first = new Date(target.getFullYear(), target.getMonth(), 1);
    const firstStr = `${first.getFullYear()}-${pad2(first.getMonth() + 1)}-${pad2(first.getDate())}`;

    // 해당 달 마지막 날
    const last = new Date(target.getFullYear(), target.getMonth() + 1, 0);
    const lastStr = `${last.getFullYear()}-${pad2(last.getMonth() + 1)}-${pad2(last.getDate())}`;

    $('#date-from').val(firstStr);
    $('#date-to').val(lastStr);
}

$(function () {
    refreshScheduleCache();     // 압축 데이터 1회 로드/마이그레이션
    setMonth(0);
    renderGrid($('#date-from').val(), $('#date-to').val());

    $('#btn-this-month').on('click', function () {
        currentMonthOffset = 0;  // 오늘 기준으로 리셋
        setMonth(0); // 이번 달
        renderGrid($('#date-from').val(), $('#date-to').val());
    });

    $('#btn-prev-month').on('click', function () {
        setMonth(-1); // 이전 달
        renderGrid($('#date-from').val(), $('#date-to').val());
    });

    $('#btn-next-month').on('click', function () {
        setMonth(1); // 다음 달
        renderGrid($('#date-from').val(), $('#date-to').val());
    });

    $('#btn-search').on('click', function () {
        const from = $('#date-from').val();
        const to = $('#date-to').val();
        if (!from || !to) return alert('날짜를 선택해주세요.');
        if (toDate(from) > toDate(to)) return alert('종료 날짜가 시작보다 빠를 수 없습니다.');
        refreshScheduleCache();   // 혹시 메인 페이지에서 데이터가 갱신됐을 수 있으니 리로드
        renderGrid(from, to);
    });
});