const $popupBg = $('.popup-bg');

function createPost() {
    $popupBg.removeClass('hidden').addClass('flex');
}

$('.close-button').click(function () {
    $popupBg.removeClass('flex').addClass('hidden');
});

$(document).ready(function () {
    Object.keys(localStorage)
        .filter(function (key) {
            return key.startsWith('PM-');
        })
        .map(function (key) {
            const match = key.match(/\d+/);
            const postId = match ? parseInt(match[0], 10) : NaN;

            const decompressedData = LZString.decompressFromUTF16(localStorage.getItem(`PM-${postId}`));
            const postData = decompressedData ? JSON.parse(decompressedData) : {};
            const title = `${postId}) ${postData?.title}` || `${postId}) 제목 없음`; // 안전하게 title 가져오기

            return { postId, title }; // 객체로 반환하여 나중에 정렬할 수 있게 함
        })
        .sort(function (a, b) {
            return b.postId - a.postId; // postId 기준으로 내림차순 정렬
        })
        .forEach(function (post) {
            const newPost = `
                <a href="../paymana/post?${post.postId}">
                    <img src="https://github.com/user-attachments/assets/e86ae66f-cd1b-407f-a195-d5c2e030ee01" alt="폴더">
                    <div>${post.title}</div>
                </a>
            `;
            $('.post-list').append(newPost);
        });
});



$('.popup-form').submit(async function (event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 막음

    const $titleInput = $('input[name="title"]');
    const title = $titleInput.val().trim();

    if (!title) {
        alert('제목을 입력해주세요.');
        return;
    }

    let postId = 1;

    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('PM-')) {
            const match = key.match(/\d+/);
            const num = match ? parseInt(match[0], 10) : NaN;
            if (!isNaN(num) && num >= postId) {
                postId = num + 1;
            }
        }
    });

    const compressedData = LZString.compressToUTF16(JSON.stringify({"title": title}));
    localStorage.setItem(`PM-${postId}`, compressedData);
    window.location.href = `../paymana/post?${postId}`;
});

function getLocalStorageSize() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);  // key 가져오기
        total += (localStorage.getItem(key).length * 2); // UTF-16 문자당 2바이트
    }
    console.log(`현재 로컬스토리지 사용량: ${total / 1024} / 5120KB`);

    if (total / 1024 >= 4900) {
        alert(`현재 사용량 : [ ${total / 1024} / 5000KB ]\n저장공간이 얼마 남지 않았습니다.\n사용하지 않는 파일은 삭제해주세요.`);
    }
}

getLocalStorageSize();