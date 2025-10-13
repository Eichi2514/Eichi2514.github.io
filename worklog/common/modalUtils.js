// 파일 경로: worklog/common/modalUtils.js

// ========= 기본 모달 제어 =========
export function openModal(selector) {
    const $modal = $(selector);
    if ($modal.length === 0) return console.warn(`Modal not found: ${selector}`);
    $modal.removeClass('hidden').addClass('flex');
}

export function closeModal(selector) {
    const $modal = $(selector);
    if ($modal.length === 0) return console.warn(`Modal not found: ${selector}`);
    $modal.addClass('hidden').removeClass('flex');
}

export function bindModalEvents(openBtn, closeBtns, modalSelector) {
    $(document).on('click', openBtn, () => openModal(modalSelector));
    closeBtns.forEach(btn => {
        $(document).on('click', btn, () => closeModal(modalSelector));
    });
}

/**
 * 작업 목록(tasks)에서 카테고리 이름을 추출해 정렬된 배열로 반환
 * @param {Array<{title:string}>} tasks - title 속성에 "카테고리)제목" 형태가 포함된 작업 배열
 * @returns {string[]} 중복 제거된 카테고리 배열 (가나다 순)
 */
export function extractSortedCategories(tasks) {
    if (!Array.isArray(tasks) || tasks.length === 0) return [];

    // ✅ desc 우선 → title 보조
    const cats = tasks.map(t => {
        const str = t.desc || t.title || '';
        return str.includes(')') ? str.split(')')[0].trim() : '기타';
    });

    return [...new Set(cats)].sort((a, b) => a.localeCompare(b, 'ko'));
}

// ========= 카테고리 목록 갱신 유틸 =========
/**
 * 카테고리 모달 내부를 자동으로 채우는 함수
 * @param {string} selector - 카테고리 컨테이너 (#category-filter)
 * @param {string[]} allCategories - 전체 카테고리 목록
 * @param {string[]} selectedCats - 현재 선택된 카테고리 배열
 * @param {Function} onChange - 체크박스 변경 시 콜백 (selectedCats => void)
 */
export function renderCategoryFilter(selector, allCategories, selectedCats, onChange) {
    const $catBox = $(selector);
    $catBox.empty();

    if (!allCategories || allCategories.length === 0) {
        $catBox.append(`<div class="text-gray-400 text-sm text-center">카테고리 없음</div>`);
        return;
    }

    // ✅ 전체선택 체크박스
    const allChecked = selectedCats.length === allCategories.length;
    const partialChecked = selectedCats.length > 0 && !allChecked;

    $catBox.append(`
        <label class="flex items-center gap-2 cursor-pointer text-sm mb-2">
            <input type="checkbox" id="chk-all" class="accent-indigo-600" ${allChecked ? 'checked' : ''}>
            <span>전체</span>
        </label>
    `);

    // ✅ 개별 카테고리
    allCategories.forEach(cat => {
        const safeId = cat.replace(/[^\w가-힣]/g, '');
        const checked = selectedCats.includes(cat) ? 'checked' : '';
        $catBox.append(`
            <label class="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" class="cat-check accent-indigo-600" value="${cat}" id="chk-${safeId}" ${checked}>
                <span>${cat}</span>
            </label>
        `);
    });

    const $allBox = $catBox.find('#chk-all');
    const $checks = $catBox.find('.cat-check');

    if (partialChecked) $allBox.css('opacity', '0.7');

    // ✅ 이벤트 핸들러
    $catBox.off('change').on('change', '.cat-check, #chk-all', function () {
        const allCats = $checks.map((_, el) => $(el).val()).get();

        if (this.id === 'chk-all') {
            // ✅ 전체 클릭 시 실제 체크박스에도 반영
            const checked = $(this).prop('checked');
            $checks.prop('checked', checked);
        }

        // ✅ 현재 선택된 항목 추출
        const newSelected = $checks.filter(':checked').map((_, el) => $(el).val()).get();

        // ✅ 전체 체크박스 상태 갱신
        const allChecked = newSelected.length === allCats.length;
        const partialChecked = newSelected.length > 0 && !allChecked;
        $allBox.prop('checked', allChecked);
        $allBox.css('opacity', partialChecked ? '0.7' : '1');

        if (typeof onChange === 'function') onChange(newSelected);
    });
}