// =========================
// Firebase Web App Config
// =========================
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  onValue,
  set,
  update
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";


// 🧠 CHANGE WITH YOUR OWN FIREBASE CONFIG!!
const firebaseConfig = {
  apiKey: "AIzaSyCswT15l41hEQv79qyBKKUVPfQPCVOiTZk",
  authDomain: "home-automation-esp32-e3790.firebaseapp.com",
  databaseURL: "https://home-automation-esp32-e3790-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "home-automation-esp32-e3790",
  storageBucket: "home-automation-esp32-e3790.appspot.com",
  messagingSenderId: "346907339451",
  appId: "1:346907339451:web:xxxxxxxxxxxxxxxx"
};


// =======================
// Init Firebase Services
// =======================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);


// =======================
// UI DOM Elements
// =======================
const emailField = document.getElementById("emailField");
const passwordField = document.getElementById("passwordField");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authMsg = document.getElementById("authMsg");

const authBox = document.getElementById("authBox");
const controlBox = document.getElementById("controlBox");
const statusBadge = document.getElementById("statusBadge");


// =======================
// LOGIN
// =======================
loginBtn.addEventListener("click", () => {
  let email = emailField.value.trim();
  let pass = passwordField.value.trim();

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => {
      authMsg.innerText = "";
    })
    .catch((err) => {
      authMsg.innerText = "⚠ Login Failed (" + err.message + ")";
    });
});


// =======================
// LOGOUT
// =======================
logoutBtn.addEventListener("click", () => {
  signOut(auth);
});


// =======================
// LOGIN STATE LISTENER
// =======================
onAuthStateChanged(auth, (user) => {
  if (user) {
    authBox.style.display = "none";
    controlBox.style.display = "block";
    statusBadge.innerText = "Online";
    statusBadge.classList.remove("offline");
    statusBadge.classList.add("online");
    listenDB();
  } else {
    authBox.style.display = "block";
    controlBox.style.display = "none";
    statusBadge.innerText = "Offline";
    statusBadge.classList.remove("online");
    statusBadge.classList.add("offline");
  }
});


// ===========================
// Listen Database Live Update
// ===========================
function listenDB() {
  const gpioRef = ref(db, "/devices/esp32_1");

  onValue(gpioRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    document.querySelectorAll(".gpio-button").forEach(btn => {
      let key = btn.dataset.gpio;
      let state = data[key] == 1 ? "ON" : "OFF";

      btn.classList.toggle("on", data[key] == 1);
      document.getElementById(key + "Status").innerText = "Status: " + state;
    });
  });
}


// ===========================
// Handle Manual Button Clicks
// ===========================
document.querySelectorAll(".gpio-button").forEach(btn => {
  btn.addEventListener("click", () => {
    let key = btn.dataset.gpio;
    let isOn = btn.classList.contains("on");
    let newVal = isOn ? 0 : 1;

    update(ref(db, "/devices/esp32_1"), {
      [key]: newVal
    });
  });
});

