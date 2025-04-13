// Firebase 관련 라이브러리 임포트
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    query,
    orderByChild,
    equalTo,
    startAt,
    limitToFirst
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase 설정
const firebaseConfig = {
    apiKey: ".env/apiKey",
    authDomain: ".env/authDomain",
    databaseURL: "https://test-948ba-default-rtdb.firebaseio.com",
    projectId: ".env/projectId",
    storageBucket: ".env/storageBucket",
    messagingSenderId: ".env/messagingSenderId",
    appId: ".env/appId",
    measurementId: ".env/measurementId"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const logsRef = ref(database, 'logs');
const membersRef = ref(database, 'members');

const nickname = localStorage.getItem('nickname') || sessionStorage.getItem('nickname');
const urlParams = new URLSearchParams(window.location.search);
let page = parseInt(urlParams.get('page')) || 1; // 기본값은 1 페이지

let lastPage = 1;  // 전역 lastPage 변수

// 페이지네이션 및 데이터 표시를 위한 쿼리
function getLogsQuery(startIndex) {
    return query(logsRef, orderByChild("id"), startAt(startIndex), limitToFirst(10));
}

// Firebase에서 전체 로그 개수 계산 후 페이지네이션 업데이트
get(logsRef).then((snapshot) => {
    const data = snapshot.val(); // 데이터를 객체로 가져옴
    if (data) {
        const totalLogsCount = Object.keys(data).length; // 자식 노드 개수 계산

        // 마지막 페이지 계산
        lastPage = Math.ceil(totalLogsCount / 10.0);

        // page 값 조정 (1보다 작은 경우 1로, lastPage보다 큰 경우 lastPage로 설정)
        if (page < 1) page = 1;
        else if (page > lastPage) page = lastPage;

        // 페이지네이션 업데이트
        updatePagination();

        // 페이지에 맞는 로그 데이터를 가져오기
        loadData();
    }
}).catch((error) => {
    console.error("전체 로그 개수 가져오기 오류: ", error); // 한글로 출력
});

window.userName = async function (key) {
    const queryRef = query(membersRef, orderByChild("key"), equalTo(key));
    try {
        const snapshot = await get(queryRef);
        if (!snapshot.exists()) {
            console.log('해당 아이디를 찾을 수 없습니다.');
            return null;
        }

        const memberData = snapshot.val();

        const memberKey = Object.keys(memberData)[0];
        return memberData[memberKey].nickname;
    } catch (error) {
        console.error("로그인 아이디 확인 중 오류 발생:", error);
        return null;
    }
};

// Firebase에서 데이터를 한 번만 가져오기
function loadData() {
    get(getLogsQuery((page - 1) * 10 + 1)).then(async (snapshot) => {
        if (snapshot.exists()) {
            const logs = snapshot.val(); // Firebase에서 가져온 데이터
            const scoreboardBody = document.getElementById('scoreboardBody');
            const name = await userName(nickname);

            // 기존 데이터를 비우기
            scoreboardBody.innerHTML = '';

            // logs 데이터 순회하며 테이블에 추가
            for (const key of Object.keys(logs)) {
                const log = logs[key];

                let className = '';
                if (name !== log.name) {
                    className = 'text-gray-500'; // 닉네임과 다르면 회색으로 표시
                }

                let floorName = log.floor;
                let roomName = log.room + '번방';
                if (log.room === 0) {
                    floorName--;
                    roomName = '보스방'; // 0번방은 보스방으로 설정
                }

                // 새로운 테이블 행 생성
                const row = document.createElement('tr');
                row.innerHTML = `
                        <td class="${className}" style="text-align: center; padding: 0;">${log.name}</td>
                        <td class="${className}" style="text-align: center; padding: 0 1vh;">:</td>
                        <td class="${className}" style="text-align: center; padding: 0 0.5vh;">${floorName}층</td>
                        <td class="${className}" style="text-align: center; padding: 0;">${roomName}</td>
                        <td class="scoreboard_clearTime ${className}" style="text-align: center; padding: 0;">[${log.clearTime}s]</td>
                    `;

                // 테이블에 행 추가
                scoreboardBody.appendChild(row);
            }
        } else {
            console.log("데이터가 없습니다.");
        }
    }).catch((error) => {
        console.error("데이터 가져오기 오류: ", error);
    });
}

// 페이지네이션 동적 링크 계산
function updatePagination() {
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = `
        <a class="pagination_left absolute" href="../ascentlime/scoreboard.html?page=${page > 1 ? page - 1 : 1}" style="${page === 1 ? 'display: none;' : ''}">
            <i class="fa-solid fa-caret-left" style="font-size: 10vh;"></i>
        </a>
        <a class="pagination_right absolute" href="../ascentlime/scoreboard.html?page=${page < lastPage ? page + 1 : lastPage}" style="${page === lastPage ? 'display: none;' : ''}">
            <i class="fa-solid fa-caret-right" style="font-size: 10vh;"></i>
        </a>
        <button class="scoreboard_exit_bt absolute" onclick="window.location.href = '../ascentlime.html';">나가기</button>
        <div class="pagination flex justify-center absolute">
            <!-- '처음' 버튼 -->
            <a href="../ascentlime/scoreboard.html?page=1" style="${page === 1 ? 'display: none;' : ''}">처음)</a>
            <button style="${page === 1 ? 'display: none;' : ''}">&nbsp;</button>
            <!-- 이전 페이지 버튼들 -->
            <a href="../ascentlime/scoreboard.html?page=${Math.max(page - 4, 1)}" style="${page <= 4 ? 'display: none;' : ''}">${Math.max(page - 4, 1)}</a>
            <a href="../ascentlime/scoreboard.html?page=${Math.max(page - 3, 1)}" style="${page <= 3 ? 'display: none;' : ''}">${Math.max(page - 3, 1)}</a>
            <a href="../ascentlime/scoreboard.html?page=${Math.max(page - 2, 1)}" style="${page <= 2 ? 'display: none;' : ''}">${Math.max(page - 2, 1)}</a>
            <a href="../ascentlime/scoreboard.html?page=${Math.max(page - 1, 1)}" style="${page === 1 ? 'display: none;' : ''}">${Math.max(page - 1, 1)}</a>
            <!-- 현재 페이지 -->
            <a class="text-red-500" href="../ascentlime/scoreboard.html?page=${page}">${page}</a>
            <!-- 다음 페이지 버튼들 -->
            <a href="../ascentlime/scoreboard.html?page=${Math.min(page + 1, lastPage)}" style="${page >= lastPage ? 'display: none;' : ''}">${Math.min(page + 1, lastPage)}</a>
            <a href="../ascentlime/scoreboard.html?page=${Math.min(page + 2, lastPage)}" style="${page + 1 >= lastPage ? 'display: none;' : ''}">${Math.min(page + 2, lastPage)}</a>
            <a href="../ascentlime/scoreboard.html?page=${Math.min(page + 3, lastPage)}" style="${page + 2 >= lastPage ? 'display: none;' : ''}">${Math.min(page + 3, lastPage)}</a>
            <a href="../ascentlime/scoreboard.html?page=${Math.min(page + 4, lastPage)}" style="${page + 3 >= lastPage ? 'display: none;' : ''}">${Math.min(page + 4, lastPage)}</a>
            <!-- '마지막' 버튼 -->
            <button style="${page === lastPage ? 'display: none;' : ''}">&nbsp;</button>
            <a href="../ascentlime/scoreboard.html?page=${lastPage}" style="${page === lastPage ? 'display: none;' : ''}">(마지막</a>
        </div>
    `;
}