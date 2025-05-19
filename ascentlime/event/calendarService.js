import {
    getDailyCheckData as repoGetDailyCheckData,
    setDailyCheckData,
    getMemberByKey,
    updateMemberCash
} from '../event/calendarRepository.js';

export async function handleDailyCheck(memberId, date) {
    const snapshot = await getDailyCheckData(memberId, date);
    if (!snapshot.exists()) {
        await setDailyCheckData(memberId, date);
        return true;
    }
    return false;
}

export async function getDailyCheckData(memberId, fullDate) {
    const snapshot = await repoGetDailyCheckData(memberId, fullDate);
    return snapshot;
}

export async function rewardCash(key, newCash) {
    const snapshot = await getMemberByKey(key);
    if (snapshot.exists()) {
        const memberKey = Object.keys(snapshot.val())[0];
        const data = snapshot.val()[memberKey];
        const updatedData = {
            ...data,
            cash: (data.cash || 0) + newCash,
        };
        await updateMemberCash(memberKey, updatedData);
    }
}