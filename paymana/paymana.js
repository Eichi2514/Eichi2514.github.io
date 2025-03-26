const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');

const formattedDate = `${yyyy}-${mm}`;

const $popupBg = $('.popup-bg');
const $popup1Bg = $('.popup1-bg');
const $popup2Bg = $('.popup2-bg');
const $popup3Bg = $('.popup3-bg');
const $noticeBg = $('.notice-bg');

const $postList = $('.post-list');

function adjustPostListWidth() {
    var containerWidth = $postList.parent().width();
    var newWidth = Math.floor(containerWidth / 152) * 152;
    $postList.css('width', newWidth);
}

$(document).ready(adjustPostListWidth);

$(window).on('resize', adjustPostListWidth);

$(".question").click(function () {
    let answer = $(this).find(".answer");
    let triangle = $(this).find(".Triangle");

    answer.toggleClass("hidden");
    triangle.toggleClass("rotate");
});

function createPost() {
    $popup1Bg.removeClass('hidden').addClass('flex');
}

function loadPost() {
    $popup1Bg.removeClass('flex').addClass('hidden');
    $popup2Bg.removeClass('hidden').addClass('flex');
}

$('.close-button').click(function () {
    $popupBg.removeClass('flex').addClass('hidden');
    $noticeBg.addClass('hidden');
});

$(".contact").click(function () {
    $popup3Bg.removeClass('hidden').addClass('flex');
});

$(".popup3-form").submit(function (event) {
    event.preventDefault();

    $("#submitBtn").prop("disabled", true);

    let formData = new FormData(this);

    let bodyValue = formData.get("body");
    if (bodyValue.trim() !== "" && !bodyValue.startsWith("[PayMana] ")) {
        formData.set("body", "[PayMana] " + bodyValue);
    }

    $.ajax({
        url: this.action,
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function () {
            alert("문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다!");
            $popupBg.removeClass('flex').addClass('hidden');
        },
        error: function (xhr) {
            console.log("전송 중 오류 발생: " + xhr.responseText);
            alert("문의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        },
        complete: function () {
            $("#submitBtn").prop("disabled", false);
        }
    });
});

$(document).ready(function () {
    let hasPost = false; // 게시글이 추가되었는지 확인하는 변수

    Object.keys(localStorage)
        .filter(key => key.startsWith('PM-'))
        .map(key => {
            const match = key.match(/\d+/);
            const postId = match ? parseInt(match[0], 10) : NaN;

            const decompressedData = LZString.decompressFromUTF16(
                localStorage.getItem(`PM-${postId}`)
            );
            const postData = decompressedData ? JSON.parse(decompressedData) : {};
            const title = `${postId}) ${postData?.title || "제목 없음"}`;
            const category = parseInt(postData?.category) || 1;

            return {postId, title, category};
        })
        .sort((a, b) => b.postId - a.postId)
        .forEach(post => {
            hasPost = true;
            const category = post.category;

            if (category === 1) {
                const newPost = `
                <a href="paymana/post.html?${post.postId}">
                    <img src="https://github.com/user-attachments/assets/e86ae66f-cd1b-407f-a195-d5c2e030ee01" alt="폴더">
                    <div>${post.title}</div>
                </a>
                `;
                $postList.append(newPost);
            } else if (category === 2) {
                const newPost = `
                <a href="paymana/post2.html?${post.postId}&${formattedDate}">
                    <img src="https://github.com/user-attachments/assets/e86ae66f-cd1b-407f-a195-d5c2e030ee01" alt="폴더">
                    <div>${post.title}</div>
                </a>
                `;
                $postList.append(newPost);
            }
        });

    if (!hasPost) {
        const noPostMessage = `
        <div>
            <h2>아직 생성된 일지가 없습니다.</h2>
            <p>화면 상단의 "만들기" 버튼을 눌러 일지 제목을 입력한 후 생성하세요.</p>
        </div>
        `;
        $('.post-list-section').append(noPostMessage);
    }
});

$('.popup1-form').submit(async function (event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 막음

    const $titleInput = $('input[name="title"]');
    const title = $titleInput.val().trim();

    const $categorySelect = $('select[name="category"]');
    const category = parseInt($categorySelect.val(), 10);

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

    if (category === 1) {
        const compressedData = LZString.compressToUTF16(JSON.stringify({
            "title": title,
            "category": category
        }));
        localStorage.setItem(`PM-${postId}`, compressedData);
        window.location.href = `paymana/post.html?${postId}`;
    } else if (category === 2) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');

        const formattedDate = `${yyyy}-${mm}`;

        const compressedData = LZString.compressToUTF16(JSON.stringify({
            "title": title,
            "category": category,
            [formattedDate]: {}
        }));
        localStorage.setItem(`PM-${postId}`, compressedData);
        window.location.href = `paymana/post2.html?${postId}&${formattedDate}`;
    }

});

function getLocalStorageSize() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);  // key 가져오기
        total += (localStorage.getItem(key).length * 2); // UTF-16 문자당 2바이트
    }

    let sizeInKB = total / 1024;
    let formattedSize = sizeInKB % 1 === 0 ? sizeInKB.toFixed(0) : sizeInKB.toFixed(1); // 정수일 경우 소수점 없이, 아니면 소수 첫째 자리까지

    console.log(`현재 로컬스토리지 사용량: ${sizeInKB}KB / 5120KB`);
    console.log(`현재 로컬스토리지 사용량: ${formattedSize}KB / 5120KB`);

    if (sizeInKB >= 4900) {
        alert(`현재 사용량 : [ ${formattedSize}KB / 5000KB ]\n저장공간이 얼마 남지 않았습니다.\n사용하지 않는 파일은 삭제해주세요.`);
    }
}

$(document).on('click', '.Guide-bt', function () {
    const button = $(this);
    const id = button.data('id');
    const count = $('.Guide-bts .Guide-bt').length;

    $(`.Guideline-${id}`).removeClass('hidden');

    for (let i = 1; i <= count; i++) {
        if (i !== id) {
            $(`.Guideline-${i}`).addClass('hidden');
        }
    }
});

getLocalStorageSize();

const now = new Date();
const year = `${now.getFullYear()}`;
const formattedTime = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

const localStorageKey = `PM${formattedTime}`;

$('.notice-form').submit(async function (event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 막음

    const isChecked = $('#confirm-checkbox').prop('checked');

    if (isChecked) {
        localStorage.setItem(localStorageKey, `1`);

        // 오늘을 제외하고 키가 같은 해로 시작하면 삭제
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`PM${year}`) && key !== localStorageKey) {
                localStorage.removeItem(key);
            }
        }
    }
});

if (!localStorage.getItem(localStorageKey)) {
    $noticeBg.removeClass('hidden').addClass('flex');
}

