// ========== CONFIG ==========
const ESP_URL = "http://192.168.4.1";   // Change If Needed
const GPIO_COUNT = 8;

// ========== DOM ==========
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authBox = document.getElementById("authBox");
const controlPanel = document.getElementById("controlPanel");
const connStatus = document.getElementById("connStatus");

// ========== LOGIN ==========
loginBtn.onclick = async () => {
  const u = user.value, p = pass.value;
  let r = await fetch(`${ESP_URL}/login?u=${u}&p=${p}`);
  let ok = (await r.text()).trim() === "OK";
  if(ok){
    authBox.style.display="none";
    controlPanel.style.display="block";
  } else authMsg.textContent = "Invalid Login";
};

// LOGOUT
logoutBtn.onclick = async () => {
  await fetch(`${ESP_URL}/logout`);
  location.reload();
};

// ========== GPIO Buttons ==========
const gpioArea = document.getElementById("gpioArea");
let gpioState = Array(GPIO_COUNT).fill(0);

for(let i=0;i<GPIO_COUNT;i++){
  let btn = document.createElement("button");
  btn.className="gpio-button";
  btn.id="gpio"+i;
  btn.textContent="GPIO " + i;
  btn.onclick = ()=> toggleGPIO(i);
  gpioArea.appendChild(btn);
}

async function toggleGPIO(i){
  gpioState[i] = gpioState[i] ? 0 : 1;
  await fetch(`${ESP_URL}/gpio?pin=${i}&v=${gpioState[i]}`);
  updateButtons();
}

function updateButtons(){
  for(let i=0;i<GPIO_COUNT;i++){
    const b=document.getElementById("gpio"+i);
    b.classList.toggle("on", gpioState[i]===1);
  }
}

// ========== FAN PWM ==========
const fanSlider = document.getElementById("fanSlider");
const fanLabel = document.getElementById("fanLabel");

fanSlider.oninput = async ()=>{
  fanLabel.textContent = `Speed: ${fanSlider.value}%`;
  await fetch(`${ESP_URL}/fan?speed=${fanSlider.value}`);
};

// ========== AUTO ONLINE CHECK ==========
setInterval(async()=>{
  try{
    let r = await fetch(`${ESP_URL}/status`);
    connStatus.textContent="Online";
    connStatus.className="status-badge online";
  }catch{
    connStatus.textContent="Offline";
    connStatus.className="status-badge offline";
  }
},2500);
