$(function () {
    function getLocalStorageSize() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);  // key 가져오기
            total += ((key.length + localStorage.getItem(key).length) * 2); // UTF-16 문자당 2바이트
        }

        let sizeInKB = total / 1024;
        let formattedSize = sizeInKB % 1 === 0 ? sizeInKB.toFixed(0) : sizeInKB.toFixed(1); // 정수일 경우 소수점 없이, 아니면 소수 첫째 자리까지

        console.log(`현재 로컬스토리지 사용량: ${sizeInKB}KB / 5120KB`);
        console.log(`현재 로컬스토리지 사용량: ${formattedSize}KB / 5120KB`);

        if (sizeInKB >= 4900) {
            alert(`현재 사용량 : [ ${formattedSize}KB / 5000KB ]\n저장공간이 얼마 남지 않았습니다.\n사용하지 않는 파일은 삭제해주세요.`);
        }
    }

    getLocalStorageSize();
});