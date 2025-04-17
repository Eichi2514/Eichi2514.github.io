$(document).ready(function () {
    const $dayNames = $('.dayNames');
    const $days = $('.days');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0~11
    const todayDate = now.getDate();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay(); // 0 (Sun) ~ 6 (Sat)
    const totalDays = lastDay.getDate();

    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    $.each(dayNames, function (_, day) {
        $dayNames.append(`<div class="day-name">${day}</div>`);
    });

    // 시작 전 빈칸
    for (let i = 0; i < startDay; i++) {
        $days.append('<div></div>');
    }

    // 날짜 채우기
    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(year, month, i);
        const dayOfWeek = date.getDay(); // 0~6
        const isToday = i === todayDate;

        // 요일 클래스 지정
        let weekClass = '';
        let doubleReward = '';
        if (dayOfWeek === 0) {
            weekClass = 'sunday';
            doubleReward = 'x2';
        } else if (dayOfWeek === 6) {
            weekClass = 'saturday';
            doubleReward = 'x2';
        } else {
            weekClass = 'weekday';
        }

        const dayClass = `day ${weekClass}${isToday ? ' today' : ''}`;

        $days.append(`
            <div class="${dayClass}">
                <div class="double-reward">${doubleReward}</div>
                <img src="https://github.com/user-attachments/assets/ef864edf-f6ef-47f6-a824-538088dcb693" alt=""/>
                <div class="day-number">${i}</div>
            </div>
        `);
    }
});