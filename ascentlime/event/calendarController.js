import * as calendarService from '../event/calendarService.js';

// { handleDailyCheck, getDailyCheckData, rewardCash }

const key = localStorage.getItem('nickname') || sessionStorage.getItem('nickname');
if (!key) {
    alert('로그인이 필요한 서비스 입니다');
    window.location.href = '/ascentlime.html';
}

$(document).ready(async function () {
    $('.loading-spinner').show();

    const memberId = await loginKeyCheckById();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    const firstDateOfMonth = new Date(year, month, 1);
    const lastDateOfMonth = new Date(year, month + 1, 0);
    const startWeekDay = firstDateOfMonth.getDay();
    const totalDaysInMonth = lastDateOfMonth.getDate();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    weekDays.forEach(dayLabel => {
        $('.dayNames').append(`<div class="day-name">${dayLabel}</div>`);
    });

    let daysHTML = '';
    for (let i = 0; i < startWeekDay; i++) {
        daysHTML += '<div></div>';
    }

    for (let dateNum = 1; dateNum <= totalDaysInMonth; dateNum++) {
        const dateObj = new Date(year, month, dateNum);
        const dayOfWeek = dateObj.getDay();
        const isToday = dateNum === today;
        const paddedDate = dateNum.toString().padStart(2, '0');
        const paddedMonth = (month + 1).toString().padStart(2, '0');
        const fullDate = `${year}-${paddedMonth}-${paddedDate}`;

        const snapshot = await calendarService.getDailyCheckData(memberId, fullDate);

        let checkMark = '';
        if (snapshot.exists() || isToday) {
            checkMark = '✔';
        }

        let weekClass = dayOfWeek === 0 ? 'sunday' : dayOfWeek === 6 ? 'saturday' : 'weekday';
        let rewardLabel = (dayOfWeek === 0 || dayOfWeek === 6) ? 'x2' : '';

        const dayClass = `day ${weekClass}${isToday ? ' today' : ''}`;

        daysHTML += `
            <div class="${dayClass}">
                <div class="day-number">${paddedDate}</div>
                <img src="https://github.com/user-attachments/assets/ef864edf-f6ef-47f6-a824-538088dcb693" alt="캐시"/>
                <div class="check-mark">${checkMark}</div>
                <div class="double-reward">${rewardLabel}</div>
            </div>
        `;
    }

    $('.days').append(daysHTML);

    const todayStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${today.toString().padStart(2, '0')}`;
    const didCheck = await calendarService.handleDailyCheck(memberId, todayStr);
    if (didCheck) showDailyCheckResult();

    $('.loading-spinner').hide();
});

export function showDailyCheckResult() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const newCash = (dayOfWeek === 0 || dayOfWeek === 6) ? 200 : 100;

    $('.calendar').append(`
        <div class="fireworks-wrapper">
            <div class="fireworks-container">
                ${[...Array(12)].map((_, i) => {
                    const x = Math.floor(Math.random() * 600) - 300;
                    const y = Math.floor(Math.random() * 600) - 300;
                    return `<div class="particle p${i + 1}" style="--x: ${x}px; --y: ${y}px;"></div>`;
                }).join('')}
            </div>
            <button class="fireworks-close close-button">✖</button>
            <div class="reward-message">출석 보상 ${newCash}원을 획득했습니다!</div>
        </div>
    `);

    calendarService.rewardCash(key, newCash);
}

$(document).on('click', '.close-button', function () {
    $('.fireworks-wrapper').remove();
});