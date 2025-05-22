import * as memberRepository from './memberRepository.js';

export async function loginKeyCheckById(key) {
    if (!key) return;

    try {
        const snapshot = await memberRepository.getMemberByKey(key);
        if (!snapshot.exists()) {
            console.log('loginKeyCheckById) 해당 키가 존재하지 않습니다.');
            return null;
        }

        const memberData = snapshot.val();
        const memberKey = Object.keys(memberData)[0];
        return memberData[memberKey].id;
    } catch (error) {
        console.error("loginKeyCheckById) 해당 키 확인 중 오류 발생:", error);
        return null;
    }
};

export async function getUserMoney(key) {
    try {
        const snapshot = await memberRepository.getMemberByKey(key);
        if (!snapshot.exists()) {
            console.log('해당 아이디를 찾을 수 없습니다.');
            return null;
        }

        const memberData = snapshot.val();
        const memberKey = Object.keys(memberData)[0];
        return memberData[memberKey].money;
    } catch (error) {
        console.error("로그인 아이디 확인 중 오류 발생:", error);
        return null;
    }
}

export async function updateUserMoney(memberKey, newMoney) {
    try {
        const snapshot = await memberRepository.getMemberByKey(memberKey);

        if (snapshot.exists()) {
            const key = Object.keys(snapshot.val())[0];
            const data = snapshot.val()[key];

            if (data) {
                const updatedData = {
                    ...data,
                    money: newMoney,
                };

                await memberRepository.updateMemberCash(key, updatedData);
            }
        }
    } catch (error) {
        console.error("금액 업데이트 실패:", error);
        throw error;
    }
};
