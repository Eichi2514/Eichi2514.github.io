import {
    database,
    membersRef,
    ref,
    get,
    set,
    update,
    remove,
    query,
    orderByChild,
    equalTo
} from '../firebase.js';

export async function getMemberByKey(key) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));
    return get(queryRef);;
}

export async function updateMemberCash(memberKey, updatedData) {
    return await update(ref(database, `members/${memberKey}`), updatedData);
}

export function getAllMembers() {
    return get(membersRef);
}