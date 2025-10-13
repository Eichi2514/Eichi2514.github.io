// ✅ 날짜 관련 유틸 모듈

/** 시분초 제거 후 순수 날짜 반환 */
export function toDateOnly(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** 두 날짜 간 일수 차이 계산 */
export function dayDiff(a, b) {
    return Math.floor((toDateOnly(b) - toDateOnly(a)) / (1000 * 60 * 60 * 24));
}

/** 문자열(YYYY-MM-DD) → Date 객체 변환 */
export function parseDate(dateStr) {
    return new Date(dateStr);
}