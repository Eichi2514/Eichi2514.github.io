export async function displayTime($element, hours, minutes, seconds) {
    $element.text(`${hours}:${minutes}:${seconds}`);
}

export async function calculateTime(plantedAt, growthTime) {
    const now = new Date();
    const completionTime = plantedAt.getTime() + growthTime;
    const timeRemaining = completionTime - now.getTime();

    return timeRemaining;
}

export async function updateGrowthStage(elapsedTime) {
    const elapsedSeconds = Math.floor(elapsedTime / 1000);
    const growthStagesDurations = [300, 600, 1800, 3600, 10800, 21600, 43200, 86400, 259200];
    return growthStagesDurations.findIndex(time => elapsedSeconds < time) !== -1
        ? growthStagesDurations.findIndex(time => elapsedSeconds < time)
        : growthStagesDurations.length;
}