// 파일 경로 : worklog/summary/summary.js
// ========= 유틸 =========
const pad2 = n => String(n).padStart(2, '0');
const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
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
    const hh = Math.floor(m / 60), mm = m % 60;
    return hh ? `${pad2(hh)}시간 ${pad2(mm)}분` : (mm ? `${pad2(mm)}분` : '-');
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
    let work = 0, other = 0;
    for (const e of entries) {
        if (!e || !e.end) continue;                    // 진행중 제외
        let dur = (typeof e.duration === 'number') ? e.duration : null;
        if (dur == null) {
            const s = parseHHMM(e.start), t = parseHHMM(e.end);
            if (s == null || t == null) continue;
            dur = Math.max(0, t - s);
        }
        if (e.type === 'work') work += dur; else other += dur;
    }
    return {work, other};
}

function aggregateRange(from, to) {
    const rows = [];
    let sumWork = 0, sumOther = 0;
    for (let d = from, i = 0; ; d = addDays(d, 1), i++) {
        const agg = aggregateForDate(d);
        rows.push({date: d, ...agg});
        sumWork += agg.work;
        sumOther += agg.other;
        if (d === to) break;
        if (i > 3700) break; // 안전장치
    }
    return {rows, sumWork, sumOther};
}

// ========= 렌더 =========
function renderGrid(from, to) {
    const {rows, sumWork, sumOther} = aggregateRange(from, to);
    const $grid = $('#result-grid').empty();

    const DAY_MIN = 4 * 60;
    let hasAnyDuration = false;

    rows.forEach(r => {
        let wMin = Math.max(0, r.work | 0);
        let oMin = Math.max(0, r.other | 0);
        if (wMin + oMin > 0) hasAnyDuration = true;

        // 하루 초과시 24시간에 맞춰 스케일링
        if (wMin + oMin > DAY_MIN) {
            const scale = DAY_MIN / (wMin + oMin);
            wMin = Math.round(wMin * scale);
            oMin = Math.round(oMin * scale);
        }
        const wPct = Math.round((wMin / DAY_MIN) * 100);
        const oPct = Math.round((oMin / DAY_MIN) * 100);
        let nPct = 100 - wPct - oPct;
        if (nPct < 0) nPct = 0;

        const $tile = $(`
        <div class="day-tile">
          <div class="day-date">${r.date} (${dayOfWeek(r.date)})</div>
          <div class="flex flex-col gap-1 text-[12px]">
            <div class="flex items-center justify-between">
              <span>작업 ${wPct}%</span>
              <span class="badge badge-work">${minutesToHM(r.work)}</span>
            </div>
          </div>
          <div class="day-bar" aria-hidden="true">
            <div class="bar-seg bar-work"  style="width:${wPct}%"></div>
            <div class="bar-seg bar-other" style="width:${oPct}%"></div>
            <div class="bar-seg bar-empty" style="width:${nPct}%"></div>
          </div>
        </div>
      `);

        // ✅ 날짜 클릭 시 작업일지로 이동
        $tile.on('click', () => {
            window.location.href = `../main/main.html?date=${r.date}`;
        });

        $grid.append($tile);
    });

    // “집계할 데이터 없음”은 총 소요가 0일 때만 표시
    $('#empty').toggleClass('hidden', hasAnyDuration);
    $('#sum-work').text(minutesToHM(sumWork));
    $('#sum-other').text(minutesToHM(sumOther));
}

// ========= 초기화 =========
function setThisMonth() {
    const d = new Date();

    // 이번 달 1일
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const firstStr = `${first.getFullYear()}-${pad2(first.getMonth() + 1)}-${pad2(first.getDate())}`;

    // 이번 달 마지막 날
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const lastStr = `${last.getFullYear()}-${pad2(last.getMonth() + 1)}-${pad2(last.getDate())}`;

    $('#date-from').val(firstStr);
    $('#date-to').val(lastStr);
}

$(function () {
    refreshScheduleCache();     // 압축 데이터 1회 로드/마이그레이션
    setThisMonth();
    renderGrid($('#date-from').val(), $('#date-to').val());

    $('#btn-today').on('click', function () {
        setThisMonth();
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