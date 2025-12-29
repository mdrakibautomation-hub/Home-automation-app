import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, set, onValue } 
from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Firebase config — SAME
const firebaseConfig = {...};
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase(app);

const gpioList = ["gpio1","gpio2","gpio3","gpio4","gpio5","gpio6","gpio7","gpio8","gpio9","gpio10","gpio11","gpio12"];
const fanList = ["fan1","fan2","fan3","fan4"];
const device = "devices/esp32_1";

onAuthStateChanged(auth, user =>{
  document.getElementById("authBox").style.display = user ? "none" : "block";
  document.getElementById("controlBox").style.display = user ? "block" : "none";
  document.getElementById("statusBadge").className = user ? "status-badge online" : "status-badge offline";
  document.getElementById("statusBadge").textContent = user ? "Online" : "Offline";
  if(user) init();
});

loginBtn.onclick = ()=> signInWithEmailAndPassword(auth,emailField.value, passwordField.value).catch(e=>authMsg.textContent=e.message);
logoutBtn.onclick = ()=> signOut(auth);

// ===== Startup Listeners =====
function init(){
  // GPIO
  gpioList.forEach(g=>{
    const btn = document.querySelector(`[data-gpio="${g}"]`);
    onValue(ref(db,`${device}/${g}`),(snap)=>{
      snap.val()==1 ? btn.classList.add("on") : btn.classList.remove("on");
    });
    btn.onclick = ()=> set(ref(db,`${device}/${g}`), btn.classList.contains("on") ? 0 : 1);
  });

  // FAN PWM
  fanList.forEach((fan,i)=>{
    const range = document.querySelector(`input[data-fan="${fan}"]`);
    const valLbl = document.getElementById(`f${i+1}v`);

    onValue(ref(db,`${device}/${fan}`),(snap)=>{
      let v = snap.val() || 0;
      range.value = v;
      valLbl.textContent = v+"%";
    });

    range.oninput = ()=> {
      set(ref(db,`${device}/${fan}`), parseInt(range.value));
      valLbl.textContent = range.value+"%";
    };
  });
}
