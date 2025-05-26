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

export function getGardenSlot(safeId, slotIndex) {
    const gardenRef = ref(database, `gardens/${safeId}/${slotIndex}`);
    return get(gardenRef);
}

export async function updateGardenSlotReward(safeId, slotIndex, reward) {
    const gardenRef = ref(database, `gardens/${safeId}/${slotIndex}`);
    return update(gardenRef, { reward });
}