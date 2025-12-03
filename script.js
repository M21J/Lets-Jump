// script.js - moved logic from previous single-file app, unchanged functionality
// RANDOM QUOTES
const quotes = [
  "Strive for progress, not perfection.",
  "Every workout is progress, no matter how small.",
  "A little progress each day adds up to big results.",
  "The only bad workout is the one you didn't do.",
  "Results happen over time, not overnight. Work hard, stay consistent.",
  "You are stronger than you think.",
  "The only person who can stop you from reaching your goals is you.",
  "Your mind is your strongest muscle.",
  "Whether you think you can, or you think you can't, you're right.",
  "The only way to define your limits is by going beyond them.",
  "All progress takes place outside the comfort zone.",
  "Don't limit your challenges, challenge your limits.",
  "Take care of your body. It's the only place you have to live.",
  "The reason I exercise is for the quality of life I enjoy.",
  "Exercise should be regarded as a tribute to the heart.",
  "Push yourself because no one else is going to do it for you.",
  "It never gets easier, you just get stronger.",
  "You don’t have to be extreme, just consistent.",
  "Discipline is choosing what you want most over what you want now.",
  "Wake up with determination, go to bed with satisfaction.",
  "Success starts with self-discipline.",
  "Small steps every day lead to big changes.",
  "One workout at a time, one day at a time, one step at a time.",
  "If it doesn’t challenge you, it doesn’t change you.",
  "Don’t stop when you’re tired, stop when you’re done.",
  "Consistency beats intensity every time.",
  "Your only limit is you.",
  "Strong today, stronger tomorrow.",
  "Fitness is not about being better than someone else, it's about being better than you used to be.",
  "Don’t wait for motivation, create it.",
  "Make time for it. Just get it done. Nobody ever got strong looking for excuses.",
  "Sore today, strong tomorrow.",
  "The body achieves what the mind believes.",
  "Action is the foundational key to all success.",
  "You miss 100% of the shots you don’t take.",
  "Do something today that your future self will thank you for.",
  "Don’t wish for it, work for it.",
  "Hard work beats talent when talent doesn’t work hard.",
  "Sweat is fat crying.",
  "Your future is created by what you do today, not tomorrow.",
  "Pain is temporary. Quitting lasts forever.",
  "If it doesn’t challenge you, it won’t change you.",
  "Stronger than yesterday.",
  "Discipline is the bridge between goals and accomplishment.",
  "Push harder than yesterday if you want a different tomorrow.",
  "Fitness is like a relationship. You can’t cheat and expect it to work.",
  "Fall in love with taking care of yourself."
];

function showRandomQuote() {
  const todayQuoteDiv = document.getElementById("dailyQuote");
  const today = new Date().getDay(); // 0-6
  // pick a consistent quote per day based on index
  const quoteIndex = today % quotes.length;
  todayQuoteDiv.textContent = quotes[quoteIndex];
}

showRandomQuote();

// ✅ NEW: Consistent date formatter (fixes iPhone issue)
function getFormattedDate() {
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; 
  const day = now.getDate().toString().padStart(2, '0');
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  return `${day} ${month} ${year}`;
}

// ==== EXISTING SCRIPT ====
// NAVIGATION (hooked to bottom nav)
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    sections.forEach(sec => sec.classList.remove('active'));
    navButtons.forEach(n => n.classList.remove('active'));
    const section = document.getElementById(btn.dataset.section);
    if(section){
      section.classList.add("active");
      btn.classList.add("active");
      if(btn.dataset.section === "achievements") updateAchievements();
    }
  });
});

// DATA
let plans = JSON.parse(localStorage.getItem("plans")) || {};
let dayTypeData = JSON.parse(localStorage.getItem("dayTypes")) || {};
let selectedTodayPlan = null;

let workoutDoneState = JSON.parse(localStorage.getItem("workoutDoneState")) || {};
const planSelect = document.getElementById("planSelect");
const planButtonsContainer = document.getElementById("planButtons");
const newPlanBtn = document.getElementById("newPlanBtn");
const daySelect = document.getElementById("daySelect");
const workoutInput = document.getElementById("workoutInput");
const saveBtn = document.getElementById("saveBtn");
const todayList = document.getElementById("todayList");
const editWorkoutList = document.getElementById("editWorkoutList");
const saveMessage = document.getElementById("saveMessage");
const starReward = document.getElementById("starReward");

const workoutFields = document.getElementById("workoutInput"); 
const dayTypeRadios = document.querySelectorAll('input[name="dayType"]'); 

function updatePlanOptions() {
  planSelect.innerHTML = "";
  if (Object.keys(plans).length === 0) {
    plans["Plan A"] = {};
  }
  Object.keys(plans).forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    planSelect.appendChild(opt);
  });
  localStorage.setItem("plans", JSON.stringify(plans));
  updatePlanTabs();
}

function updatePlanTabs() {
  planButtonsContainer.innerHTML = "";
  Object.keys(plans).forEach(plan => {
    const container = document.createElement("div");
    container.className = "plan-container";

    const btn = document.createElement("button");
    btn.textContent = plan;
    btn.className = "tab-btn";
    if (plan === selectedTodayPlan) btn.classList.add("active");
    btn.onclick = () => {
      selectedTodayPlan = plan;
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      showTodayList();
    };

    const delBtn = document.createElement("button");
    delBtn.className = "delete-plan-btn";
    delBtn.textContent = "Delete";
    delBtn.onclick = () => deletePlan(plan);

    container.appendChild(btn);
    container.appendChild(delBtn);
    planButtonsContainer.appendChild(container);
  });

  if (!selectedTodayPlan) {
    selectedTodayPlan = Object.keys(plans)[0];
    const firstBtn = document.querySelector(".tab-btn");
    if (firstBtn) firstBtn.classList.add("active");
  }
}

function deletePlan(plan) {
  if (confirm(`Delete "${plan}"?`)) {
    delete plans[plan];
    localStorage.setItem("plans", JSON.stringify(plans));
    if (selectedTodayPlan === plan) selectedTodayPlan = Object.keys(plans)[0] || null;
    updatePlanOptions();
    showTodayList();
    showWorkoutsForDay();
  }
}

newPlanBtn.onclick = () => {
  const planName = prompt("Enter new plan name:");
  if (!planName) return;
  if (plans[planName]) return alert("Plan already exists!");
  plans[planName] = {};
  localStorage.setItem("plans", JSON.stringify(plans));
  updatePlanOptions();
  planSelect.value = planName;
  showWorkoutsForDay();
  showTodayList();
};

function saveWorkout() {
  const selectedPlan = planSelect.value;
  const day = daySelect.value;
  const dayType = document.querySelector('input[name="dayType"]:checked').value;
  const workout = workoutInput.value.trim();

  dayTypeData[`${selectedPlan}-${day}`] = dayType;
  localStorage.setItem("dayTypes", JSON.stringify(dayTypeData));

  if (dayType === "off") {
    if (!plans[selectedPlan]) plans[selectedPlan] = {};
    plans[selectedPlan][day] = [];
    localStorage.setItem("plans", JSON.stringify(plans));
    workoutInput.value = "";
    saveMessage.textContent = `${day} set as Off Day!`;
    setTimeout(() => (saveMessage.textContent = ""), 2000);
    showWorkoutsForDay();
    showTodayList();
    return;
  }

  if (!workout) return;
  if (!plans[selectedPlan]) plans[selectedPlan] = {};
  if (!plans[selectedPlan][day]) plans[selectedPlan][day] = [];
  plans[selectedPlan][day].push({ name: workout, done: false });
  localStorage.setItem("plans", JSON.stringify(plans));
  workoutInput.value = "";
  saveMessage.textContent = "Workout saved successfully!";
  setTimeout(() => (saveMessage.textContent = ""), 2000);
  showWorkoutsForDay();
  showTodayList();
}

saveBtn.onclick = saveWorkout;

function showTodayList() {
  const today = new Date().toLocaleString("en-us", { weekday: "long" });
  const selectedPlan = selectedTodayPlan || Object.keys(plans)[0];
  if (!selectedPlan) {
    todayList.innerHTML = `<p>No plans available.</p>`;
    return;
  }
  const list = plans[selectedPlan]?.[today] || [];
  const dayType = dayTypeData[`${selectedPlan}-${today}`] || "workout";

  if (dayType === "off") {
    todayList.innerHTML = `<h3>${today}</h3><p>Relaxe — No workouts today!</p>`;
    starReward.style.display = "none";
    return;
  }

  if (list.length === 0) {
    todayList.innerHTML = `<h3>${today}</h3><p>No workouts yet</p>`;
    starReward.style.display = "none";
    return;
  }

  let html = `<h3>${today} (${selectedPlan})</h3><ul style="list-style:none; padding:0;">`;
  list.forEach((w, i) => {
    const todayDate = getFormattedDate();
    const key = `${selectedPlan}-${today}-${todayDate}`;

    let dayState = workoutDoneState[key] || [];
    const checked = dayState[i] ? "checked" : "";

    const style = w.done ? "text-decoration: line-through; color: gray;" : "";
    html += `<li>
      <label>
        <input type="checkbox" ${checked} onchange="toggleWorkoutDone('${selectedPlan}','${today}', ${i}, this)">
        <span style="${style}">${w.name}</span>
      </label>
    </li>`;
  });
  html += "</ul>";
  todayList.innerHTML = html;
  checkAllCompleted(today);
}

function toggleWorkoutDone(plan, day, index, checkbox) {
  const todayDate = getFormattedDate();
  const key = `${plan}-${day}-${todayDate}`;

  if (!workoutDoneState[key]) workoutDoneState[key] = [];

  workoutDoneState[key][index] = checkbox.checked;
  localStorage.setItem("workoutDoneState", JSON.stringify(workoutDoneState));

  showTodayList();
  showWorkoutsForDay();
}

function checkAllCompleted(day) {
  const selectedPlan = selectedTodayPlan || Object.keys(plans)[0];
  const list = plans[selectedPlan]?.[day] || [];
  const todayDate = getFormattedDate();
  const key = `${selectedPlan}-${day}-${todayDate}`;
  const state = workoutDoneState[key] || [];

  const allDone = list.length > 0 && state.length === list.length && state.every(Boolean);

  starReward.style.display = allDone ? "block" : "none";
}

planSelect.addEventListener("change", () => { showWorkoutsForDay(); showTodayList(); });
daySelect.addEventListener("change", showWorkoutsForDay);

function showWorkoutsForDay() {
  const selectedPlan = planSelect.value;
  if (!selectedPlan) return;
  const day = daySelect.value;
  const dayType = dayTypeData[`${selectedPlan}-${day}`] || "workout";
  const list = plans[selectedPlan]?.[day] || [];

  const radio = document.querySelector(`input[name="dayType"][value="${dayType}"]`);
  if (radio) radio.checked = true;

  workoutFields.style.display = dayType === "workout" ? "inline-block" : "none";

  if (dayType === "off") {
    editWorkoutList.innerHTML = `<p>${day} is an Off Day.</p>`;
    return;
  }

  if (list.length === 0) {
    editWorkoutList.innerHTML = "<p>No workouts for this day.</p>";
    return;
  }

  let html = "<ul style='list-style:none; padding:0;'>";
  list.forEach((w, i) => {
    html += `<li style="margin-bottom:5px;">
      <span>${w.name}</span>
      <button class="delete-btn" onclick="deleteWorkout('${selectedPlan}','${day}', ${i})">❌</button>
    </li>`;
  });
  html += "</ul>";
  editWorkoutList.innerHTML = html;
}

function deleteWorkout(plan, day, index) {
  if (confirm("Are you sure you want to delete this workout?")) {
    plans[plan][day].splice(index, 1);
    localStorage.setItem("plans", JSON.stringify(plans));
    showWorkoutsForDay();
    showTodayList();
  }
}

updatePlanOptions();
showTodayList();
showWorkoutsForDay();

dayTypeRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    if (radio.value === "off" && radio.checked) {
      workoutFields.style.display = "none";
    } else if (radio.value === "workout" && radio.checked) {
      workoutFields.style.display = "inline-block";
    }
  });
});

// === ACHIEVEMENTS SCRIPT ===
const achievementInput = document.getElementById("achievementInput");
const celebrateBtn = document.getElementById("celebrateBtn");
const achievementBanner = document.getElementById("achievementBanner");
const tableBody = document.querySelector("#achievementTable tbody");
const tableNav = document.getElementById("tableNav");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const confettiCanvas = document.getElementById("confettiCanvas");

let achievements = JSON.parse(localStorage.getItem("achievements")) || [];
let startIndex = 0;
const pageSize = 7;

// === AUTO CLEAR SCROLLING BANNER ===


function autoClearBannerByCount() {
  // Create a separate array ONLY for the banner
  let bannerAchievements = achievements.slice(-14);

  achievementBanner.innerHTML = `
    <div class="scroll-row">
      ${bannerAchievements.map(a => `<span>🏅 ${escapeHtml(a.text)}</span>`).join(" ")}
    </div>
  `;
}


autoClearBannerByCount();


celebrateBtn.addEventListener("click", () => {
  const achievement = achievementInput.value.trim();
  if (!achievement) return alert("Enter an achievement!");
  // ✅ Use consistent manual date format
  const date = getFormattedDate();
  achievements.push({ text: achievement, date });
  localStorage.setItem("achievements", JSON.stringify(achievements));
  achievementInput.value = "";
  updateAchievements();      // updates table using full history
  autoClearBannerByCount(); 
  launchConfetti();
});

function updateAchievements() {
  if (achievements.length === 0) {
    achievementBanner.innerHTML = `<span>No achievements yet</span>`;
  } else {
    achievementBanner.innerHTML = `
      <div class="scroll-row">
        ${achievements.map(a => `<span>🏅 ${escapeHtml(a.text)}</span>`).join(" ")}
      </div>
    `;
  }
  renderTable();
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
}

function launchConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  let confettiPieces = Array.from({ length: 200 }).map(() => ({
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * confettiCanvas.height - confettiCanvas.height,
    w: Math.random() * 8 + 4,
    h: Math.random() * 2 + 2,
    angle: Math.random() * 360,
    c: `hsl(${Math.random() * 360}, 70%, 60%)`,
    d: Math.random() * 3 + 2,
    rotationSpeed: (Math.random() - 0.5) * 5
  }));
  const ctx = confettiCanvas.getContext("2d");
  let confettiInterval = setInterval(drawConfetti, 20);
  function drawConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach(p => {
      p.y += p.d;
      p.angle += p.rotationSpeed;
      if (p.y > confettiCanvas.height) p.y = -10;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
  }
  setTimeout(() => {
    clearInterval(confettiInterval);
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }, 8000);
}

function renderTable() {
  tableBody.innerHTML = "";
  const visible = achievements.slice(startIndex, startIndex + pageSize);
  visible.forEach(a => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${escapeHtml(a.text)}</td><td>${a.date}</td>`;
    tableBody.appendChild(row);
  });
  tableNav.style.display = achievements.length > pageSize ? "flex" : "none";
}

prevBtn.onclick = () => {
  if (startIndex >= pageSize) {
    startIndex -= pageSize;
    renderTable();
  }
};
nextBtn.onclick = () => {
  if (startIndex + pageSize < achievements.length) {
    startIndex += pageSize;
    renderTable();
  }
};

updateAchievements();

window.addEventListener('resize', () => {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});

// Migration (old achievements stored as strings)
(function migrateOldAchievements() {
  try {
    const raw = localStorage.getItem('achievements');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
      const migrated = parsed.map(s => ({ text: s, date: getFormattedDate() }));
      achievements = migrated;
      localStorage.setItem('achievements', JSON.stringify(achievements));
      updateAchievements();
    }
  } catch (e) {}
})();
