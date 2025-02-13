window.onerror = function () {
    window.location.href = 'https://eichi2514.github.io/ascentlime/restricted/restricted';
    return true;
};

const urls = window.location.search;
const articleNum = urls ? parseInt(urls.substring(1)) : 0;

<!-- 조회수 증가 함수 -->
function ArticleDetail__doIncreaseHitCount() {
    const localStorageKey = 'article__' + articleNum + '__alreadyOnView';

    if (localStorage.getItem(localStorageKey)) {
        return;
    }

    doIncreaseHitCountRd(articleNum).then(({dateOnly, newViewCount}) => {
        $('.meta').text(`${dateOnly} / 조회수 ${newViewCount}`);
    });

    localStorage.setItem(localStorageKey, true);
}

ArticleDetail__doIncreaseHitCount();