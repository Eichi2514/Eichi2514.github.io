const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');

const urls = window.location.search;
const postId = urls ? parseInt(urls.substring(1)) : 0;
const dateString = urls.substring(1).split('&')[1];
const decompressedData = LZString.decompressFromUTF16(localStorage.getItem(`PM-${postId}`));
const originalPost = decompressedData ? JSON.parse(decompressedData) : null;

function checkAccess() {
    if (isNaN(postId) || !originalPost || originalPost.category !== 2 || !dateString) {
        console.log(`postId : ${postId}`);
        alert(`잘못된 접근방식입니다.`);
        history.back();

        return 0;
    }
    return 1;
}

checkAccess();

let post = originalPost[dateString];

function titleUpdate() {
    $('.calendar').val(dateString);
    $('.title').val(originalPost.title);
}

titleUpdate();

function removePost() {
    const deleteCheck = confirm('정말로 삭제하시겠습니까? \n삭제 시 복구가 불가능합니다.');

    if (deleteCheck) {
        localStorage.removeItem(`PM-${postId}`);
        window.location.href = '../paymana.html';
    }
}

function formatNum(num) {
    return num.toLocaleString('ko-KR', {minimumFractionDigits: 0, maximumFractionDigits: 1});
}

function originalPostUpdate(newOriginalPost) {
    if (checkAccess === 0) return;

    const compressedData = LZString.compressToUTF16(JSON.stringify(newOriginalPost));
    // const compressedData = JSON.stringify(newOriginalPost);
    localStorage.setItem(`PM-${postId}`, compressedData);
}

function postUpdate(newPost) {
    if (checkAccess === 0) return;

    originalPost[dateString] = newPost;
    const compressedData = LZString.compressToUTF16(JSON.stringify(originalPost));
    // const compressedData = JSON.stringify(originalPost);
    localStorage.setItem(`PM-${postId}`, compressedData);
}

function addItem() {
    let lastItemId = 0;

    Object.keys(post).forEach(key => {
        if (key.startsWith('i')) {
            const num = parseInt(key.substring(1), 10);
            if (!isNaN(num) && num > lastItemId) {
                lastItemId = num;
            }
        }
    });

    const formattedNum = String(lastItemId+1).padStart(2, '0');
    console.log(`${formattedNum}`);

    // 새로운 아이템 추가 HTML 구조
    const newItem = `
         <div class="item row">
             <label>
                 <input class="itemName" type="text" name="i${formattedNum}">
             </label>
             <label>
                 <input class="amount" type="number" name="i${formattedNum}">
             </label>
             <span class="splitAmount"></span>
             <button class="remove-bt" data-id="i${formattedNum}">🗑</button>
         </div>
        `;

    const nameAttr = `i${formattedNum}`;
    const itemName = `itemName`;
    const amount = `amount`;

    if (!post[nameAttr]) {
        post[nameAttr] = {};
    }

    post[nameAttr][itemName] = '';
    post[nameAttr][amount] = 0;

    postUpdate(post);

    $('.item-list').append(newItem);
}


function addPerson() {
    let lastPersonId = 0;

    Object.keys(post).forEach(key => {
        if (key.startsWith('p')) {
            const num = parseInt(key.substring(1), 10);
            if (!isNaN(num) && num > lastPersonId) {
                lastPersonId = num;
            }
        }
    });

    const formattedNum = String(lastPersonId+1).padStart(2, '0');
    console.log(`${formattedNum}`);

    const newItem = `
        <div class="person row">
            <label>
                <input class="name" type="text" name="p${formattedNum}">
            </label>
            <label>
                <input style="width: calc(100% - 60px);"
                       class="depositDate" type="text"
                       name="p${formattedNum}">
                <button style="width: 50px; height: 36px" class="black-button payment-bt payment-bt-p${formattedNum}" data-id="p${formattedNum}">납부</button>
                <button style="width: 50px; height: 36px; display: none;" class="red-button payment-cancel-bt payment-cancel-bt-p${formattedNum}" data-id="p${formattedNum}">취소</button>
            </label>
            <span class="flex gap-2">
                <span class="status-p${formattedNum}" style="width: 50px;">불참</span>
                <button style="width: 50px; height: 36px" class="black-button status-bt status-bt-p${formattedNum}" data-id="p${formattedNum}">참여</button>
                <button style="width: 50px; height: 36px; display: none;" class="red-button status-cancel-bt status-cancel-bt-p${formattedNum}" data-id="p${formattedNum}">취소</button>
            </span>
            <button class="remove-bt" data-id="p${formattedNum}">🗑</button>
        </div>
        `;

    const nameAttr = `p${formattedNum}`;
    const name = `name`;
    const depositDate = `depositDate`;
    const status = `status`;

    if (!post[nameAttr]) {
        post[nameAttr] = {};
    }

    post[nameAttr][name] = '';
    post[nameAttr][depositDate] = '';
    post[nameAttr][status] = '불참';

    postUpdate(post);

    $('.person-list').append(newItem);
}

$(document).on('input', 'input', function () {
    const val = $(this).val();
    const nameAttr = $(this).attr('name');
    const classAttr = $(this).attr('class');

    if (classAttr === 'title') {
        originalPost[classAttr] = val;
        originalPostUpdate(originalPost);
    } else if (classAttr === 'calendar') {

    } else if (classAttr === 'monthlyFee' || classAttr === 'monthlyInterest') {
        if (!post[classAttr]) {
            post[classAttr] = {};
        }
        post[classAttr] = parseInt(val);
        postUpdate(post);
    } else {
        if (!post[nameAttr]) {
            post[nameAttr] = {};
        }
        post[nameAttr][classAttr] = val;
        postUpdate(post);
    }

    if (classAttr !== 'title') {
        remainingAmountUpdate(dateString);
        $(`.status-${nameAttr}`).text(statusUpdate(nameAttr));
    }

    if (classAttr === 'depositDate' && val) {
        $(`.payment-bt-${nameAttr}`).hide();
        $(`.payment-cancel-bt-${nameAttr}`).show();
    } else if (classAttr === 'depositDate' && !val) {
        $(`.payment-bt-${nameAttr}`).show();
        $(`.payment-cancel-bt-${nameAttr}`).hide();
    }
});

$('input').on('focus', function () {
    $('body').css('zoom', '1');
});

$(document).on('click', '.remove-bt', function () {
    const button = $(this);
    const id = button.data('id');

    button.closest('div').remove();
    console.log(id);

    delete post[`${id}`];

    postUpdate(post);

    if (id.startsWith('p') || id.startsWith('i')) {
        remainingAmountUpdate(dateString);
    }
});

$(document).on('click', '.payment-bt', function () {
    const button = $(this);
    const id = button.data('id');

    $(`.depositDate[name="${id}"]`).val(`${yyyy}-${mm}-${dd}`);

    if (!post[id]) {
        post[id] = {};
    }
    post[id][`depositDate`] = `${yyyy}-${mm}-${dd}`;
    $(`.status-${id}`).text(statusUpdate(id));

    $(`.payment-bt-${id}`).hide();
    $(`.payment-cancel-bt-${id}`).show();

    postUpdate(post);

    remainingAmountUpdate(dateString);
});

$(document).on('click', '.payment-cancel-bt', function () {
    const button = $(this);
    const id = button.data('id');

    $(`.depositDate[name="${id}"]`).val(``);

    if (!post[id]) {
        post[id] = {};
    }
    post[id][`depositDate`] = ``;
    $(`.status-${id}`).text(statusUpdate(id));

    $(`.payment-bt-${id}`).show();
    $(`.payment-cancel-bt-${id}`).hide();

    postUpdate(post);

    remainingAmountUpdate(dateString);
});

$(document).on('click', '.status-bt', function () {
    const button = $(this);
    const id = button.data('id');

    post[id][`status`] = '참여';

    $(`.status-${id}`).text(statusUpdate(id));

    $(`.status-bt-${id}`).hide();
    $(`.status-cancel-bt-${id}`).show();

    postUpdate(post);

    remainingAmountUpdate(dateString);
});

$(document).on('click', '.status-cancel-bt', function () {
    const button = $(this);
    const id = button.data('id');

    post[id][`status`] = '불참';

    $(`.status-${id}`).text(statusUpdate(id));

    $(`.status-bt-${id}`).show();
    $(`.status-cancel-bt-${id}`).hide();

    postUpdate(post);

    remainingAmountUpdate(dateString);
});

function statusUpdate(id) {
    if (!post[id]) {
        post[id] = {};
    }

    const status = post[id][`status`] || '불참';
    const depositDate = post[id][`depositDate`] || "";

    if (status === '불참' && depositDate === "") {
        $(`.status-${id}`).css({backgroundColor: 'transparent', color: '#000000'});
        return '불참';
    } else if (status === '불참' && depositDate !== "") {
        $(`.status-${id}`).css({backgroundColor: 'transparent', color: '#E53935'});
        return '환불';
    } else if (status === '참여' && depositDate === "") {
        $(`.status-${id}`).css({backgroundColor: '#E53935', color: '#FFFFFF'});
        return '미납';
    } else if (status === '참여' && depositDate !== "") {
        $(`.status-${id}`).css({backgroundColor: 'transparent', color: '#4CAF50'});
        return '참여';
    }

    return '오류';
}

function monthlySpentUpdate(postItem) {
    let monthlySpent = 0;
    Object.keys(postItem).forEach(key => {
        if (key.startsWith('i')) {
            const amount = parseInt(postItem[key].amount) || 0;
            monthlySpent += amount;
        }
    });

    const $monthlySpent = $('.monthlySpent');
    $monthlySpent.removeClass('total-amount-negative total-amount');

    const formatString = formatNum(monthlySpent);

    if (monthlySpent < 0) {
        $monthlySpent.text(`${formatString}원`).addClass('total-amount-negative');
    } else {
        $monthlySpent.text(`${formatString}원`).addClass('total-amount');
    }

    return monthlySpent;
}

function participantCountUpdate(postItem) {
    let participantCount = 0;

    Object.keys(postItem).forEach(key => {
        if (key.startsWith('p') && postItem[key].depositDate !== '' && postItem[key].status === '참여' && /^(\d{4})-(\d{2})-(\d{2})$/.test(postItem[key].depositDate)) {
            participantCount++;
        }
    });

    return participantCount;
}

function paidParticipants(postItem) {
    let paidParticipantsCount = 0;
    Object.keys(postItem).forEach(key => {
        if (key.startsWith('p') && postItem[key].status === '참여') {
            paidParticipantsCount++;
        }
    });
    const $paidParticipantsCount = $('.paidParticipantsCount');

    if (paidParticipantsCount === 0) {
        $paidParticipantsCount.text(`${paidParticipantsCount}명`).removeClass('total-amount');
    } else $paidParticipantsCount.text(`${paidParticipantsCount}명`).addClass('total-amount');

    return paidParticipantsCount;
}

function checkValidNumber(value) {
    if (typeof value !== 'number' || isNaN(value) || value < 0) {
        return 0;
    }
    return value;
}

function remainingAmountUpdate(yearMonth) {
    let totalRemainingAmount = 0;

    const keys = Object.keys(originalPost);
    const previousMonths = keys.filter(key => key <= yearMonth);
    const filteredPosts = previousMonths.map(key => originalPost[key]);

    filteredPosts.forEach(postItem => {
        // post 객체에서 필요한 값을 추출하고 유효성 검사
        let monthlyFee = checkValidNumber(postItem['monthlyFee']);
        let participantCount = checkValidNumber(participantCountUpdate(postItem));
        let monthlySpent = checkValidNumber(monthlySpentUpdate(postItem));
        let monthlyInterest = checkValidNumber(postItem['monthlyInterest']);

        // 남은 금액 계산
        const remainingAmount = (monthlyFee * participantCount) - monthlySpent + monthlyInterest;

        // 남은 금액을 totalRemainingAmount에 누적
        totalRemainingAmount += remainingAmount;
    });

    const $remainingAmount = $('.remainingAmount');
    $remainingAmount.removeClass('total-amount-negative total-amount');

    const formatString = formatNum(totalRemainingAmount);

    if (totalRemainingAmount < 0) {
        $remainingAmount.text(`${formatString}원`).addClass('total-amount-negative');
    } else {
        $remainingAmount.text(`${formatString}원`).addClass('total-amount');
    }

    paidParticipants(post);
}

function startPost() {
    $('.monthlyFee').val(post['monthlyFee' || 0]);
    $('.monthlyInterest').val(post['monthlyInterest' || 0]);

    Object.keys(post).forEach(key => {
        if (key.startsWith('i')) {
            const itemName = post[key].itemName || '';
            const amount = parseInt(post[key].amount) || 0;

            const newItem = `
                     <div class="item row">
                        <label>
                            <input class="itemName" type="text" name="${key}" value="${itemName}">
                        </label>
                        <label>
                            <input class="amount" type="number" name="${key}" value="${amount}">
                        </label>
                        <span class="splitAmount"></span>
                        <button class="remove-bt" data-id="${key}">🗑</button>
                    </div>
                    `;

            $('.item-list').append(newItem);
        } else if (key.startsWith('p')) {
            const name = post[key].name || '';
            const depositDate = post[key].depositDate || '';
            const paymentBtClass = depositDate === '' ? '' : 'display: none;'
            const paymentCancelBtClass = depositDate !== '' ? '' : 'display: none;'
            const status = post[key].status || '불참';
            const statusBtClass = status !== '참여' ? '' : 'display: none;'
            const statusCancelBtClass = status === '참여' ? '' : 'display: none;'

            const newItem = `
                    <div class="person row">
                        <label>
                            <input class="name" type="text" name="${key}" value="${name}">
                        </label>
                        <label>
                            <input style="width: calc(100% - 60px);"
                                class="depositDate" type="text"
                                name="${key}"
                                value="${depositDate}">
                            <button style="width: 50px; height: 36px; ${paymentBtClass}" class="black-button payment-bt payment-bt-${key}" data-id="${key}">납부</button>
                            <button style="width: 50px; height: 36px; ${paymentCancelBtClass}" class="red-button payment-cancel-bt payment-cancel-bt-${key}" data-id="${key}">취소</button>
                        </label>
                        <span class="flex gap-2">
                            <span class="status-${key}" style="width: 50px;">${statusUpdate(key)}</span>
                            <button style="width: 50px; height: 36px; ${statusBtClass}" class="black-button status-bt status-bt-${key}" data-id="${key}">참여</button>
                            <button style="width: 50px; height: 36px; ${statusCancelBtClass}" class="red-button status-cancel-bt status-cancel-bt-${key}" data-id="${key}">취소</button>
                        </span>
                        <button class="remove-bt" data-id="${key}">🗑</button>
                    </div>
                    `;

            $('.person-list').append(newItem);

            statusUpdate(key)
        }
    });

    remainingAmountUpdate(dateString);
}

if (post !== undefined) {
    startPost();
} else {
    updatePostHistory(dateString);
}

function updatePostHistory(dateString) {
    let currentDate = new Date(dateString + '-01');
    currentDate.setMonth(currentDate.getMonth() - 1);
    let previousMonth = currentDate.toISOString().slice(0, 7);

    if (!originalPost[dateString]) {
        if (originalPost[previousMonth]) {
            originalPost[dateString] = JSON.parse(JSON.stringify(originalPost[previousMonth]));
        } else {
            originalPost[dateString] = {};
        }
    }

    let postData = originalPost[dateString];

    Object.keys(postData).forEach(key => {
        console.log(`key : ${key}`);
        if (key === `monthlyInterest`) {
            delete postData[key]
        } else if (key.startsWith('i')) {
            delete postData[key];
        } else if (key.startsWith('p')) {
            postData[key][`depositDate`] = '';
            postData[key][`status`] = '';
        }
    });

    post = postData || {};

    const compressedData = LZString.compressToUTF16(JSON.stringify(originalPost));
    localStorage.setItem(`PM-${postId}`, compressedData);

    startPost()
}

$('#calendar').on('change', function () {
    const selectedMonth = $(this).val();
    window.location.href = `../paymana/post2.html?${postId}&${selectedMonth}`;
});