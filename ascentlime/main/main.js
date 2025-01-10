function updateTop3Table() {
    // 기존 로그 읽기
    let logs = JSON.parse(localStorage.getItem('log')) || [];

    const chiLog = {
        name: 'chi',
        floor: 22,
        room: 0,
        clearTime: 705
    };

    // 'name'이 'chi'인 객체가 logs에 있는지 확인
    const index = logs.findIndex(log => log.name === 'chi');

    if (index !== -1) {
        // 'chi'가 이미 존재하는 경우, 기존 기록과 chiLog를 비교하여 업데이트
        const existingLog = logs[index];

        if (chiLog.floor > existingLog.floor ||
            (chiLog.floor === existingLog.floor && chiLog.room > existingLog.room) ||
            (chiLog.floor === existingLog.floor && chiLog.room === existingLog.room && chiLog.clearTime < existingLog.clearTime)) {
            // 조건에 맞으면 기존 데이터를 chiLog로 교체
            logs[index] = chiLog;
        }
    } else {
        // 'chi'가 없으면 chiLog를 추가
        logs.push(chiLog);
    }


    // 정렬
    logs.sort((a, b) => {
        if (b.floor !== a.floor) return b.floor - a.floor; // 층 내림차순
        if (b.room !== a.room) return b.room - a.room;    // 방 번호 내림차순
        return a.clearTime - b.clearTime;                 // 클리어 시간 오름차순
    });

    // 상위 3개 추출
    const top3 = logs.slice(0, 3);

    // 테이블 요소 선택
    const tableBody = document.querySelector(".TOP3_table tbody");

    // 기존 데이터 제거
    while (tableBody.rows.length > 1) {
        tableBody.deleteRow(1);
    }

    // 상위 3개 데이터 추가
    top3.forEach((log) => {
        const row = tableBody.insertRow();
        row.innerHTML = `        
        <tr>                    
            <td style="text-align: center; padding: 0;">
                ${log.floor}층
            </td>
            <td style="text-align: center; padding: 0;">
                ${log.room === 0 ? '보스방' : log.room + '번방'}
            </td>
            <td style="text-align: center; padding: 0;">
                ${log.clearTime}초
            </td>
        </tr>                    
    `;
    });

    localStorage.setItem('log', JSON.stringify(top3));
}

updateTop3Table();

function randomString() {
    const randomString = Math.random().toString(36).substring(2, 9); // 7자리 랜덤 문자열
    return randomString;
}

const nicknames = ['chi', 'Eichi', '에이치', '이치', '치', '빨간이치', 'G에이치'];

$(document).ready(function () {
    $('.login_out_bt').on('click', function () {
        localStorage.removeItem('nickname');
        $(".login").addClass("hidden");
        $(".logout").removeClass("hidden");
    });

    $('.pw').on('click', function () {
        // id 입력값 가져오기
        const nickname = $('.id').val();

        // 값이 비어있는지 확인
        if (nickname.trim() === '') {
            alert('닉네임을 입력해주세요!');
            return;
        } else {
            for (let i = 0; i < nicknames.length; i++){
                if (nickname.trim() === nicknames[i]) {
                    alert('사용할 수 없는 닉네임 입니다.');
                    return;
                }
            }
        }

        // 닉네임 글자수 제한
        if (nickname.length > 7) {
            alert('닉네임은 7글자 이하로 입력해주세요!');
            return;
        }

        localStorage.setItem('nickname', nickname);

        // 로컬스토리지 있는지 확인 후 저장
        // name, floor, room, hp, power, speed, weaponId, clearTime
        if (!localStorage.getItem(nickname)) {
            localStorage.setItem(nickname, JSON.stringify({
                name: nickname,
                floor: 1,
                room: 0,
                hp: 100,
                power: 0,
                speed: 50,
                weaponId: 1,
                clearTime: 0
            }));
            localStorage.setItem(nickname + 'weaponFind1', true);
            alert('처음 오셨군요 화면에 보이는 슬라임에 마우스를 올려보세요!');
        }

        // 닉네임 입력창 교체
        $(".logout").addClass("hidden");
        $(".login").removeClass("hidden");
        $(".member_name1").text(nickname + "님")
    });

    function login_chack() {
        if (localStorage.getItem('nickname')) {
            $(".logout").addClass("hidden");
            $(".login").removeClass("hidden");
            $(".member_name1").text(localStorage.getItem('nickname') + "님")
        } else {
            $(".login").addClass("hidden");
            $(".logout").removeClass("hidden");
        }
    }

    login_chack();
});