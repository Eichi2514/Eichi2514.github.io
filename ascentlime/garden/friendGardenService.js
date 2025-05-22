import * as gardenService from './gardenService.js';
import * as gardenRepository from './gardenRepository.js';
import * as memberRepository from '../member/memberRepository.js';
import { plantItems, growthStages, fullyGrown } from './gardenConstants.js';

export async function loadPlantDate(safeId, plantItems) {
    let completionTime = 0;

    const plantSlots = $('.plant-section .plant-slot').toArray();

    const plantPromises = plantSlots.map(async (element, index) => {
        const snapshot = await gardenRepository.getGardenSlot(safeId, index + 1);
        if (snapshot.exists()) {
            const plantData = snapshot.val();
            const plantedAt = new Date(plantData.plantedAt);
            const growthTime = plantItems[plantData.plantId].growthTime * 1000;
            const newCompletionTime = plantedAt.getTime() + growthTime;

            if (completionTime < newCompletionTime) {
                completionTime = newCompletionTime;
            }

            updatePlant(element, index + 1, plantData, plantItems, safeId);
        }
    });

    await Promise.all(plantPromises);

    const memberSnapshots = await memberRepository.getAllMembers();

    const foundUsers = [];
    if (memberSnapshots.exists()) {
        memberSnapshots.forEach(childSnapshot => {
            const data = childSnapshot.val();
            if (data.id === safeId) {
                foundUsers.push({
                    profileImageId: data.profileImageId,
                    nickname: data.nickname,
                    id: data.id
                });
            }
        });
    }

    return { completionTime, foundUsers };
}

async function updatePlant(plantSlot, index, plantData, plantItems, safeId) {
    const plantedAt = new Date(plantData.plantedAt);
    const growthTime = plantItems[plantData.plantId].growthTime * 1000;

    const timeRemaining = await gardenService.calculateTime(plantedAt, growthTime);

    if (timeRemaining > 0) {
        const elapsedTime = new Date().getTime() - plantedAt.getTime();
        const growthStagesId = await gardenService.updateGrowthStage(elapsedTime);

        $(plantSlot).html(`
            <img class="plant-img item${index}" src="${growthStages[growthStagesId]}" alt="Plant Stage ${index}">
            <span class="plant-name none">${plantItems[plantData.plantId].name}</span>
            <button class="s-button none assist-button" data-id="${index}">도움</button>
        `);
    } else {
        updateFullyGrown(plantSlot, timeRemaining, plantData, index, safeId, plantItems);
    }
}

async function updateFullyGrown(plantSlot, timeRemaining, plantData, index, safeId, plantItems) {
    if (-86400000 < timeRemaining && timeRemaining <= 0) {

        try {
            const snapshot = await gardenRepository.getGardenSlot(safeId, index);
            if (snapshot.exists()) {
                const data = snapshot.val();
                const reward = data.reward;

                if (reward % 3 === 0) {
                    $(plantSlot).html(`
                        <img class="plant-img item${index}" src="${fullyGrown[plantData.plantId]}" alt="Plant Stage ${index}">
                        <span class="plant-name none">${plantItems[plantData.plantId].name}</span>
                        <button class="s-button none steal-button" data-id="${index}">서리</button>
                    `);
                } else {
                    $(plantSlot).html(`
                        <img class="plant-img item${index}" src="${fullyGrown[plantData.plantId]}" alt="Plant Stage ${index}">
                        <span class="plant-name none">${plantItems[plantData.plantId].name}</span>
                    `);
                }
            }
        } catch (error) {
            console.error("데이터 가져오기 실패", error);
        }
    } else if (timeRemaining <= -86400000) {
        $(plantSlot).html(`
            <img class="plant-img item${index}" src="${fullyGrown[0]}" alt="Plant Stage ${index}">
            <span class="plant-name none">${plantItems[plantData.plantId].name}</span>
        `);
    }
}