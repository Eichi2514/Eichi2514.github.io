const urls = window.location.search;
const postId = urls ? parseInt(urls.substring(1)) : 0;
const decompressedData = LZString.decompressFromUTF16(localStorage.getItem(`PM-${postId}`));
const post = decompressedData ? JSON.parse(decompressedData) : null;

const category = (post && post.category) || 1;

if (isNaN(postId) || category !== 1) {
    console.log(`postId : ${postId}`);
    console.log(`post : ${post}`);
    alert(`잘못된 접근방식입니다.`);
    history.back();
}

function titleUpdate() {
    $('.title').val(post.title);
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

function totalSpentUpdate() {
    let totalSpent = 0;
    Object.keys(post).forEach(key => {
        if (key.startsWith('i')) {
            const amount = parseInt(post[key].amount) || 0;
            totalSpent += amount;
        }
    });

    const $totalSpent = $('.totalSpent');
    $totalSpent.removeClass('total-amount-negative total-amount');

    const formatString = formatNum(totalSpent);

    if (totalSpent < 0) {
        $totalSpent.text(`${formatString}원`).addClass('total-amount-negative');
    } else {
        $totalSpent.text(`${formatString}원`).addClass('total-amount');
    }

    return totalSpent;
}

function totalFeeUpdate() {
    let totalFee = 0;
    Object.keys(post).forEach(key => {
        if (key.startsWith('p')) {
            const advanceAmount = parseInt(post[key].advanceAmount) || 0;
            totalFee += advanceAmount;
        }
    });

    const $totalFee = $('.totalFee');
    $totalFee.removeClass('total-amount-negative total-amount');

    const formatString = formatNum(totalFee);

    if (totalFee < 0) {
        $totalFee.text(`${formatString}원`).addClass('total-amount-negative');
    } else {
        $totalFee.text(`${formatString}원`).addClass('total-amount');
    }

    return totalFee;
}

function remainingAmountUpdate() {
    const totalFee = totalFeeUpdate();
    const totalSpent = totalSpentUpdate();
    const remainingAmount = totalFee - totalSpent;

    const $remainingAmount = $('.remainingAmount');
    $remainingAmount.removeClass('total-amount-negative total-amount');
    const formatString = formatNum(remainingAmount);

    if (remainingAmount < 0) {
        $remainingAmount.text(`${formatString}원`).addClass('total-amount-negative');
    } else {
        $remainingAmount.text(`${formatString}원`).addClass('total-amount');
    }

    let count = 0;

    Object.keys(post).forEach(key => {
        if (key.startsWith('p')) {
            count++;
        }
    });


    if (count > 0) {
        Object.keys(post).forEach(key => {
            if (key.startsWith('p')) {
                const advanceAmount = parseInt(post[key].advanceAmount) || 0;
                const calculatedAmount = (totalSpent / count) - advanceAmount;

                const $settledAmount = $(`.settledAmount-${key}`);
                $settledAmount.removeClass('total-amount-negative total-amount');
                const formatString = formatNum(calculatedAmount);

                if (calculatedAmount < 0) {
                    $settledAmount.text(`${formatString}원`).addClass('total-amount');
                } else {
                    $settledAmount.text(`${formatString}원`).addClass('total-amount-negative');
                }
            }
        });
    }
}

function postUpdate(newPost) {
    if (isNaN(postId)) {
        alert(`잘못된 접근방식입니다.`);
        history.back();
        return;
    }
    const compressedData = LZString.compressToUTF16(JSON.stringify(newPost));
    localStorage.setItem(`PM-${postId}`, compressedData);
}

function startPost() {
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
            const advanceAmount = parseInt(post[key].advanceAmount) || 0;

            const newItem = `
                    <div class="person row">
                        <label>
                            <input class="name" type="text" name="${key}" value="${name}">
                        </label>
                        <span class="settledAmount-${key}">0원</span>
                        <label>
                            <input class="advanceAmount" type="number" name="${key}" value="${advanceAmount}">
                        </label>
                        <button class="remove-bt" data-id="${key}">🗑</button>
                    </div>
                    `;

            $('.person-list').append(newItem);
        }
    });

    remainingAmountUpdate();

}

startPost();

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
            <span class="settledAmount-p${formattedNum}">0원</span>
            <label>
                <input class="advanceAmount" type="number" name="p${formattedNum}">
            </label>
            <button class="remove-bt" data-id="p${formattedNum}">🗑</button>
        </div>
        `;

    const nameAttr = `p${formattedNum}`;
    const name = `name`;
    const advanceAmount = `advanceAmount`;

    if (!post[nameAttr]) {
        post[nameAttr] = {};
    }
    post[nameAttr][name] = '';
    post[nameAttr][advanceAmount] = 0;

    postUpdate(post);

    $('.person-list').append(newItem);
}

$(document).on('input', 'input', function () {
    const val = $(this).val();
    const nameAttr = $(this).attr('name');
    const classAttr = $(this).attr('class');

    if (classAttr.startsWith('title')) {
        post['title'] = val;
    } else {
        if (!post[nameAttr]) {
            post[nameAttr] = {};
        }
        post[nameAttr][classAttr] = val;
    }

    postUpdate(post);

    if (!classAttr.startsWith('title')) {
        console.log(`classAttr : ${classAttr}`);
        if (nameAttr.startsWith('p') || nameAttr.startsWith('i') && classAttr === 'amount') {
        remainingAmountUpdate();
        }
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
        remainingAmountUpdate();
    }
});