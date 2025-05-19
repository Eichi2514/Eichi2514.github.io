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

export async function getMemberByKey(key) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));
    return await get(queryRef);
}

export async function updateMemberCash(memberKey, updatedData) {
    return await update(ref(database, `members/${memberKey}`), updatedData);
}