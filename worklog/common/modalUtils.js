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

// ========= localStorage 압축 저장 / 압축 해제 유틸 =========
const LZ_PREFIX = "__LZUTF16__";

function assertLZString() {
    if (typeof LZString === 'undefined') {
        throw new Error('LZString 라이브러리가 로드되지 않았습니다.');
    }
}

export function saveCompressedStorage(key, obj) {
    assertLZString();

    const json = JSON.stringify(obj);
    const compressed = LZString.compressToUTF16(json);

    localStorage.setItem(key, LZ_PREFIX + compressed);
}

export function loadStorageDecompressed(key) {
    assertLZString();

    const value = localStorage.getItem(key);

    if (value == null) {
        return null;
    }

    // 새 압축 포맷
    if (value.startsWith(LZ_PREFIX)) {
        const json = LZString.decompressFromUTF16(value.slice(LZ_PREFIX.length));
        return json ? JSON.parse(json) : null;
    }

    // 비압축 JSON
    try {
        return JSON.parse(value);
    } catch {
        // 구 압축 포맷
        const json = LZString.decompressFromUTF16(value);
        return json ? JSON.parse(json) : null;
    }
}

// ========= 전체 내역 내보내기 =========
export function exportStorageJson({
                                      storageKey,
                                      fileName = 'worklog-export.json'
                                  }) {
    const data = loadStorageDecompressed(storageKey) || {};

    const exportData = {
        app: 'worklog',
        storageKey,
        exportedAt: new Date().toISOString(),
        data
    };

    const blob = new Blob(
        [JSON.stringify(exportData, null, 2)],
        {type: 'application/json;charset=utf-8'}
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    a.remove();
    URL.revokeObjectURL(url);
}

// ========= 전체 내역 업로드 =========
export function importStorageJson({
                                      storageKey,
                                      file,
                                      onSuccess,
                                      onError,
                                      reload = true
                                  }) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {
        try {
            const parsed = JSON.parse(reader.result);

            // exportStorageJson()으로 내보낸 파일이면 parsed.data 사용
            // 순수 데이터 JSON이면 parsed 자체 사용
            const data = parsed && typeof parsed === 'object' && 'data' in parsed
                ? parsed.data
                : parsed;

            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                throw new Error('올바른 작업일지 JSON 형식이 아닙니다.');
            }

            saveCompressedStorage(storageKey, data);

            if (typeof onSuccess === 'function') {
                onSuccess(data);
            }

            if (reload) {
                window.location.reload();
            }
        } catch (err) {
            console.error(err);

            if (typeof onError === 'function') {
                onError(err);
            } else {
                window.alert('업로드에 실패했습니다. JSON 파일 형식을 확인해 주세요.');
            }
        }
    };

    reader.onerror = function () {
        const err = new Error('파일을 읽는 중 오류가 발생했습니다.');

        if (typeof onError === 'function') {
            onError(err);
        } else {
            window.alert(err.message);
        }
    };

    reader.readAsText(file, 'utf-8');
}

// ========= 버튼 바인딩 공통 함수 =========
export function bindStorageBackupEvents({
                                            exportBtn,
                                            importBtn,
                                            fileInput,
                                            storageKey,
                                            fileName = 'worklog-export.json',
                                            reload = true
                                        }) {
    $(document).on('click', exportBtn, function () {
        exportStorageJson({
            storageKey,
            fileName
        });
    });

    $(document).on('click', importBtn, function () {
        $(fileInput).val('');
        $(fileInput).trigger('click');
    });

    $(document).on('change', fileInput, function () {
        const file = this.files && this.files[0];

        if (!file) return;

        const ok = window.confirm(
            '업로드하면 현재 저장된 전체 작업일지가 업로드한 파일 내용으로 교체됩니다. 계속하시겠습니까?'
        );

        if (!ok) {
            $(fileInput).val('');
            return;
        }

        importStorageJson({
            storageKey,
            file,
            reload,
            onError(error) {
                window.alert(error.message || '업로드에 실패했습니다.');
            }
        });
    });
}