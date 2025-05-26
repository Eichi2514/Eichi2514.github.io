import * as calendarRepository from '../event/calendarRepository.js';
import * as memberRepository from '../member/memberRepository.js';

export async function handleDailyCheck(memberId, date) {
    const snapshot = await calendarRepository.getDailyCheckData(memberId, date);
    if (!snapshot.exists()) {
        await calendarRepository.setDailyCheckData(memberId, date);
        return true;
    }
    return false;
}

export async function getDailyCheckData(memberId, fullDate) {
    const snapshot = await calendarRepository.getDailyCheckData(memberId, fullDate);
    return snapshot;
}

export async function rewardCash(key, newCash) {
    const snapshot = await memberRepository.getMemberByKey(key);
    if (snapshot.exists()) {
        const memberKey = Object.keys(snapshot.val())[0];
        const data = snapshot.val()[memberKey];
        const updatedData = {
            ...data,
            cash: (data.cash || 0) + newCash,
        };
        await memberRepository.updateMemberCash(memberKey, updatedData);
    }
}