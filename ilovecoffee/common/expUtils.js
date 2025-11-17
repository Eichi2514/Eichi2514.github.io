// ==============================
// ✅ 경험치 및 레벨 계산 유틸 (common/expUtils.js)
// ==============================

import {levelExp} from "./levelExp.js";
import {dayDiff} from "./dateUtils.js";

/** ✅ 두 기록 간 경험치 차이 계산 */
export function calcDiffExp(prev, cur) {
    if (!prev || !cur) return 0;
    let diff = 0;

    if (cur.level > prev.level) {
        diff += (levelExp[prev.level] - prev.exp);
        for (let lv = prev.level + 1; lv < cur.level; lv++) {
            diff += levelExp[lv];
        }
        diff += cur.exp;
    } else if (cur.level === prev.level && cur.exp >= prev.exp) {
        diff = cur.exp - prev.exp;
    }

    return Math.max(diff, 0);
}

/** ✅ 평균 경험치 계산 (최근 10일 내 기록 기준) */
export function calcAvgExp(records, user = null) {
    if (!records || records.length < 2) return 0;

    console.log(`📊${user != null ? user : ''} 기록 :`, JSON.parse(JSON.stringify(records)));
    records.sort((a, b) => new Date(a[0]) - new Date(b[0]));
    const today = new Date();

    // 최근 10일 데이터만 추출
    const recent = records.filter(([date]) => {
        const diff = Math.floor((today - new Date(date)) / (1000 * 60 * 60 * 24));
        return diff <= 10;
    });

    console.log(`🗓️ 최근 11일 내 데이터 (${recent.length}개):`, recent.map(r => r[0]));
    if (recent.length < 2) return 0;

    const firstDate = new Date(recent[0][0]);
    const lastDate = new Date(recent[recent.length - 1][0]);
    const totalDays = Math.max(dayDiff(firstDate, lastDate), 1);

    console.log(`📆 첫 기록: ${recent[0][0]}, 마지막 기록: ${recent[recent.length - 1][0]}, 총일수: ${totalDays}`);
    let totalGain = 0;
    for (let i = 1; i < recent.length; i++) {
        const prev = recent[i - 1][1];
        const curr = recent[i][1];
        const diff = calcDiffExp(prev, curr);
        totalGain += diff;
        console.log(`🧮 ${recent[i - 1][0]} → ${recent[i][0]}: 획득경험치( ${diff.toLocaleString()} )`);
    }
    const avg = totalGain > 0 ? Math.floor(totalGain / totalDays) : 0;
    console.log(`✅ 총 증가량: ${totalGain.toLocaleString()}, 총일수: ${totalDays}, 평균: ${avg.toLocaleString()}`);
    return avg;
}

/** ✅ D-day 계산 (만렙 포함) */
export function calcDDay(user, avgExp) {
    const level = user.level || 1;
    const curExp = user.exp || 0;
    const lastDateStr = user.lastDate || null;
    const maxLevel = levelExp.length;
    const need = levelExp[level] || 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (avgExp <= 0) return {value: 99999, text: "-"};

    const baseDate = lastDateStr ? new Date(lastDateStr) : new Date();
    baseDate.setHours(0, 0, 0, 0);

    const targetDate = new Date(baseDate);

    if (level < maxLevel) {
        // 일반 구간
        const remain = Math.max(need - curExp, 0);
        const days = Math.ceil(remain / avgExp);

        targetDate.setDate(baseDate.getDate() + days);
    } else if (user.goalTargets && user.goalTargets.length > 0) {
        // 만렙 구간
        const higherGoals = user.goalTargets.filter(g => g > curExp).sort((a, b) => a - b);
        if (higherGoals.length > 0) {
            const nextGoal = higherGoals[0];
            const remainGoalExp = nextGoal - curExp;
            const goalDays = Math.ceil(remainGoalExp / avgExp);

            targetDate.setDate(baseDate.getDate() + goalDays);
        }
    }

    const diffDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    const diffDaysValue = diffDays >= 0 ? diffDays : 9999;
    return {value: diffDaysValue, text: `${diffDays > 0 ? 'D-' + diffDays : diffDays === 0 ? 'D-day' : '-'}`};
}