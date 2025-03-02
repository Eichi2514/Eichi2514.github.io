// Firebase SDK 불러오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    set,
    child
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase 설정
const firebaseConfig = {
    apiKey: ".env/apiKey",
    authDomain: ".env/authDomain",
    databaseURL: "https://test-948ba-default-rtdb.firebaseio.com",
    projectId: ".env/projectId",
    storageBucket: ".env/storageBucket",
    messagingSenderId: ".env/messagingSenderId",
    appId: ".env/appId",
    measurementId: ".env/measurementId"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const membersRef = ref(database, 'members');

window.saveMembers = async function (member) {
    const now = new Date();
    const formattedTime = `${now.getFullYear()}년 ${String(now.getMonth() + 1).padStart(2, '0')}월 ${String(now.getDate()).padStart(2, '0')}일 ${String(now.getHours()).padStart(2, '0')}시 ${String(now.getMinutes()).padStart(2, '0')}분 ${String(now.getSeconds()).padStart(2, '0')}초`;

    let info = "알 수 없음";

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`);
                const data = await response.json();
                info = data.error ? "정보를 가져올 수 없음" : data.display_name;
            } catch (error) {
                info = "정보를 가져오는 중 오류 발생";
            }
            saveToDatabase(member, formattedTime, info);
        }, () => {
            saveToDatabase(member, formattedTime, info);
        });
    } else {
        await saveToDatabase(member, formattedTime, info);
    }
}

async function hashPassword(password, salt) {
    const scriptURL = "https://script.google.com/macros/s/AKfycbxD1axioR1FicH70pnzgTMS-kBmszf8T_ivRpPJoZqCXM8dhWbj8BxO8rQp4Gmf3psenQ/exec";

    if (!password || !salt) {
        alert('잘못된 접근 방식입니다.');
        return null;
    }

    try {
        const response = await fetch(scriptURL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                password: password,
                salt: salt
            })
        });

        const hashedPassword = await response.text();
        return hashedPassword.trim();

    } catch (error) {
        console.error("비밀번호 해싱 중 오류 발생:", error);
        return null;
    }
}

async function saveToDatabase(member, formattedTime, info) {
    try {
        const snapshot = await get(membersRef);
        let newId = 1;
        if (snapshot.exists()) {
            const members = snapshot.val();
            const ids = Object.values(members).map(info => info.id);
            newId = Math.max(...ids, 0) + 1;
        }

        const salt = generateUUID();
        const hashedPw = await hashPassword(member.loginPw, salt);

        const newMembersRef = child(membersRef, newId + ")" + member.name);
        set(newMembersRef, {
            id: newId,
            name: member.name,
            nickname: member.nickname,
            loginId: member.loginId,
            loginPw: hashedPw,
            profileImageId: Math.floor(Math.random() * 3) + 1,
            email: member.email,
            salt: salt,
            key: member.key,
            time: formattedTime,
            info: info
        });

        alert("회원가입이 완료되었습니다.");
        history.back();
    } catch (error) {
        alert("데이터를 저장하는 중 오류 발생: " + error);
    }
}

window.doJoin = async function (member) {
    const snapshot = await get(membersRef);
    if (snapshot.exists()) {
        const members = snapshot.val();
        const existingIds = Object.values(members).map(info => info.loginId);
        const existingNicknames = Object.values(members).map(info => info.nickname);
        const existingEmails = Object.values(members).map(info => info.email);

        if (existingIds.includes(member.loginId)) {
            alert("이미 사용 중인 아이디입니다.");
            return;
        }
        if (existingNicknames.includes(member.nickname)) {
            alert("이미 사용 중인 닉네임입니다.");
            return;
        }
        if (existingEmails.includes(member.email)) {
            alert("이미 사용 중인 이메일입니다.");
            return;
        }
        if (specialCharPattern1.test(member.name)) {
            alert("* 이름에 한글, 영문만 사용해 주세요.\n (특수기호, 공백, 숫자 사용 불가)");
            return;
        }
        if (specialCharPattern2.test(member.nickname)) {
            alert("* 닉네임에 한글, 영문, 숫자만 사용해 주세요.\n (특수기호, 공백 사용 불가)");
            return;
        }
        if (member.nickname.length < 3 || member.nickname.length > 7) {
            alert("* 닉네임은 3~7자여야 합니다.");
            return;
        }
        if (member.loginId.length < 3) {
            alert("* 아이디는 3자 이상이어야 합니다.");
            return;
        }
        if (!emailRegex.test(member.email)) {
            alert("* 올바른 이메일 형식을 입력해 주세요.");
            return;
        }
        if (checkRestrictedNickname(member.nickname)) {
            alert("* 사용 불가능한 닉네임입니다.");
            return;
        }
        if (specialCharPattern0.test(member.loginId)) {
            alert("* 아이디에 영문, 숫자만 사용해 주세요.\n (특수기호, 공백, 한글 사용 불가)");
            return;
        }

    }

    await saveMembers(member);
};

window.getKey = async function () {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 15; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const snapshot = await get(membersRef);
    if (snapshot.exists()) {
        const members = snapshot.val();
        const existingKeys = Object.values(members).map(info => info.key);
        if (existingKeys.includes(key)) {
            return getKey();
        }
    }
    return key;
}

window.checkDuplicate = async function (field, value) {
    const snapshot = await get(membersRef);
    if (snapshot.exists()) {
        const members = snapshot.val();
        const existingValues = Object.values(members).map(info => info[field]);
        return existingValues.includes(value);
    }
    return false;
}