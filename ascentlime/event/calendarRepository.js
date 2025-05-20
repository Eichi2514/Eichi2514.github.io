import {
    database,
    membersRef,
    ref,
    get,
    set,
    query,
    orderByChild,
    equalTo,
    update
} from '../firebase.js';

export async function getDailyCheckData(memberId, date) {
    const dailyCheckRef = ref(database, `dailyCheck/${memberId}/${date}`);
    return await get(dailyCheckRef);
}

export async function setDailyCheckData(memberId, date) {
    const dailyCheckRef = ref(database, `dailyCheck/${memberId}/${date}`);
    return await set(dailyCheckRef, true);
}