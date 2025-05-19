// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    set,
    query,
    orderByChild,
    equalTo,
    update
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

const articlesRef = ref(database, 'articles');
const chatBotRef = ref(database, 'chatBots');
const chatRef = ref(database, 'chats');
const friendsRef = ref(database, 'friends');
const logsRef = ref(database, 'logs');
const membersRef = ref(database, 'members');
const repliesRef = ref(database, 'replies');
const weaponFindRef = ref(database, 'weaponFind');

export {
    database,
    articlesRef,
    chatBotRef,
    chatRef,
    friendsRef,
    logsRef,
    membersRef,
    repliesRef,
    weaponFindRef,
    ref,
    get,
    set,
    query,
    orderByChild,
    equalTo,
    update
};