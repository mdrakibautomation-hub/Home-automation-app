// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCswT15l41hEQv79qyBKKUVPfQPCVOiTZk",
  authDomain: "home-automation-esp32-e3790.firebaseapp.com",
  databaseURL: "https://home-automation-esp32-e3790-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "home-automation-esp32-e3790",
  storageBucket: "home-automation-esp32-e3790.firebasestorage.app",
  messagingSenderId: "209833223452",
  appId: "1:209833223452:web:53badf29c0a1dc8818c6d9"
};


// Init
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// ================= DOM ELEMENTS =================
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authBox = document.getElementById("authBox");
const controlBox = document.getElementById("controlBox");
const statusBadge = document.getElementById("statusBadge");

const emailField = document.getElementById("emailField");
const passwordField = document.getElementById("passwordField");
const authMsg = document.getElementById("authMsg");

// ================= LOGIN =================
loginBtn.onclick = async () => {
  const email = emailField.value.trim();
  const pass = passwordField.value.trim();
  authMsg.textContent = "";

  try {
    await auth.signInWithEmailAndPassword(email, pass);
    authMsg.textContent = "Login Success!";
    authBox.style.display = "none";
    controlBox.style.display = "block";
  } catch (err) {
    authMsg.textContent = "Login Failed: " + err.message;
  }
};

// ================= LOGOUT =================
logoutBtn.onclick = () => {
  auth.signOut();
  authBox.style.display = "block";
  controlBox.style.display = "none";
};

// ================= DEVICE DB =================
const basePath = "devices/esp32_1";

function setGPIO(name, value) {
  db.ref(`${basePath}/${name}`).set(value);
}

// Stream for UI sync
db.ref(basePath).on("value", snap => {
  statusBadge.textContent = "Online";
  statusBadge.classList.remove("offline");
  statusBadge.classList.add("online");

  const data = snap.val();
  document.querySelectorAll(".gpio-button").forEach(btn => {
    const key = btn.dataset.gpio;
    if (data[key] === 1) btn.classList.add("on");
    else btn.classList.remove("on");
  });

  for (let i = 1; i <= 4; i++) {
    const slider = document.getElementById(`fan${i}`);
    if (slider) slider.value = data[`fan${i}_speed`] || 0;
  }
});

// ================= BUTTON CLICK =================
document.querySelectorAll(".gpio-button").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.gpio;
    const isOn = btn.classList.contains("on");
    setGPIO(key, isOn ? 0 : 1);
  });
});

// ================= FAN SLIDERS =================
for (let i = 1; i <= 4; i++) {
  const slider = document.getElementById(`fan${i}`);
  if (slider)
    slider.oninput = () => db.ref(`${basePath}/fan${i}_speed`).set(Number(slider.value));
}

