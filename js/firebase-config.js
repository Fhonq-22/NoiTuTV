// firebase-config.js

// Đảm bảo bạn load firebase-app-compat.js và firebase-database-compat.js trước rồi mới import file này

const firebaseConfig = {
  apiKey: "AIzaSyB-3OtQZ43rIpnH_FwybCiNzg5_3VpfUuE",
  authDomain: "tuvung-f564c.firebaseapp.com",
  databaseURL: "https://tuvung-f564c-default-rtdb.firebaseio.com",
  projectId: "tuvung-f564c",
  storageBucket: "tuvung-f564c.firebasestorage.app",
  messagingSenderId: "608040324748",
  appId: "1:608040324748:web:a5b28a544e00bc5f35a9",
  measurementId: "G-QB1CP0EVTW"
};

// Nếu chưa initialize thì initialize, tránh lỗi khi import nhiều lần
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

export { db };
