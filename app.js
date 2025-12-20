import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  get
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// 🔐 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCswT15l41hEQv79qyBKKUVPfQPCVOiTZk",
  authDomain: "home-automation-esp32-e3790.firebaseapp.com",
  databaseURL: "https://home-automation-esp32-e3790-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "home-automation-esp32-e3790",
  appId: "1:209833223452:web:53badf29c0a1dc8818c6d9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase(app);

// UI
const authBox = document.getElementById("authBox");
const controlBox = document.getElementById("controlBox");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authMsg = document.getElementById("authMsg");
const badge = document.getElementById("statusBadge");

const gpioList = [
 "gpio1","gpio2","gpio3","gpio4",
 "gpio5","gpio6","gpio7","gpio8",
 "gpio9","gpio10","gpio11","gpio12"
];
const devicePath = "devices/esp32_1";

// LOGIN
loginBtn.onclick = async () => {
  authMsg.textContent = "";
  try {
    await signInWithEmailAndPassword(
      auth,
      emailField.value,
      passwordField.value
    );
  } catch (e) {
    authMsg.textContent = e.message;
  }
};

logoutBtn.onclick = () => signOut(auth);

// AUTH STATE
onAuthStateChanged(auth, (user) => {
  if (user) {
    authBox.style.display = "none";
    controlBox.style.display = "block";
    badge.textContent = "Online";
    badge.className = "status-badge online";
    startListeners();
  } else {
    authBox.style.display = "block";
    controlBox.style.display = "none";
    badge.textContent = "Offline";
    badge.className = "status-badge offline";
  }
});

// GPIO LISTENERS
function startListeners() {

  gpioList.forEach((gpio) => {
    const btn = document.querySelector(`[data-gpio="${gpio}"]`);

    onValue(ref(db, `${devicePath}/${gpio}`), (snap) => {
      snap.val() === 1 ? btn.classList.add("on") : btn.classList.remove("on");
    });

    btn.onclick = async () => {
      const modeSnap = await get(ref(db, `${devicePath}/${gpio}_mode`));
      const mode = modeSnap.exists() ? modeSnap.val() : "toggle";

      if (mode === "toggle") {
        const current = btn.classList.contains("on") ? 1 : 0;
        set(ref(db, `${devicePath}/${gpio}`), current ? 0 : 1);
      } else {
        set(ref(db, `${devicePath}/${gpio}`), 1); // momentary
      }
    };
  });
}
