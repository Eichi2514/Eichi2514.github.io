const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');

const urls = window.location.search;
const postId = urls ? parseInt(urls.substring(1)) : 0;
const dateString = urls.substring(1).split('&')[1];
const decompressedData = LZString.decompressFromUTF16();
const originalPost = JSON.parse(localStorage.getItem(`PM-${postId}`));

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

const post = originalPost[dateString];

function titleUpdate() {
    $('.calendar').val(dateString);
    $('.title').val(originalPost.title);
}

titleUpdate();

function removePost() {
    const deleteCheck = confirm('정말로 삭제하시겠습니까? \n삭제 시 복구가 불가능합니다.');

    if (deleteCheck) {
        localStorage.removeItem(`PM-${postId}`);
        window.location.href = `../paymana`;
    }
}

function formatNum(num) {
    return num.toLocaleString('ko-KR', {minimumFractionDigits: 0, maximumFractionDigits: 1});
}

function originalPostUpdate(newOriginalPost) {
    if (checkAccess === 0) return;

    // const compressedData = LZString.compressToUTF16(JSON.stringify(newOriginalPost));
    const compressedData = JSON.stringify(newOriginalPost);
    localStorage.setItem(`PM-${postId}`, compressedData);
}

function postUpdate(newPost) {
    if (checkAccess === 0) return;

    originalPost[dateString] = newPost;
    // const compressedData = LZString.compressToUTF16(JSON.stringify(newPost));
    const compressedData = JSON.stringify(originalPost);
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

    // 새로운 아이템 추가 HTML 구조
    const newItem = `
         <div class="item row">
             <label>
                 <input class="itemName" type="text" name="i${lastItemId + 1}">
             </label>
             <label>
                 <input class="amount" type="number" name="i${lastItemId + 1}">
             </label>
             <span class="splitAmount"></span>
             <button class="remove-bt" data-id="i${lastItemId + 1}">🗑</button>
         </div>
        `;

    const nameAttr = `i${lastItemId + 1}`;
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

    const newItem = `
        <div class="person row">
            <label>
                <input class="name" type="text" name="p${lastPersonId + 1}">
            </label>
            <label>
                <input style="width: calc(100% - 60px);"
                       class="depositDate" type="text"
                       name="p${lastPersonId + 1}">
                <button style="width: 50px; height: 36px" class="button payment-bt" data-id="p${lastPersonId + 1}">납부</button>
            </label>
            <span class="flex gap-2">
                <span class="status-p${lastPersonId + 1}" style="width: 50px;">불참</span>
                <button style="width: 50px; height: 36px" class="button status-bt" data-id="p${lastPersonId + 1}">참여</button>
            </span>
            <button class="remove-bt" data-id="p${lastPersonId + 1}">🗑</button>
        </div>
        `;

    const nameAttr = `p${lastPersonId + 1}`;
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
    } else {
        if (!post[nameAttr]) {
            post[nameAttr] = {};
        }
        post[nameAttr][classAttr] = val;
        postUpdate(post);
    }

    $(`.status-${nameAttr}`).text(statusUpdate(nameAttr));

    if (nameAttr.startsWith('p') || nameAttr.startsWith('i') && classAttr === 'amount' && classAttr !== 'title') {
        // remainingAmountUpdate();
    }
});

$('input').on('focus', function () {
    $('body').css('zoom', '1');
});

$(document).on('click', '.remove-bt', function () {
    const button = $(this);
    const id = button.data('id');

    button.closest('div').remove();

    delete post[dateString][`${id}`];

    postUpdate(post);

    if (id.startsWith('p') || id.startsWith('i')) {
        // remainingAmountUpdate();
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

    postUpdate(post);

    // remainingAmountUpdate();
});

$(document).on('click', '.status-bt', function () {
    const button = $(this);
    const id = button.data('id');

    if (post[id][`status`] === '참여') {
        post[id][`status`] = '불참';
    } else {
        post[id][`status`] = '참여';
    }

    $(`.status-${id}`).text(statusUpdate(id));

    postUpdate(post);

    // remainingAmountUpdate();
});

function statusUpdate(id) {
    if (!post[id]) {
        post[id] = {};
    }

    const status = post[id][`status`] || '불참';
    const depositDate = post[id][`depositDate`] || "";

    if (status === '불참' && depositDate === "") {
        return '불참';
    } else if (status === '불참' && depositDate !== "") {
        return '환불';
    } else if (status === '참여' && depositDate === "") {
        return '미납';
    } else if (status === '참여' && depositDate !== "") {
        return '참여';
    }

    return '오류';
}