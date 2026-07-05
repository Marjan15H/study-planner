let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let streak = localStorage.getItem("streak") || 0;

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function display(list = tasks) {
  let ul = document.getElementById("taskList");
  ul.innerHTML = "";

  list.forEach((t, i) => {
    let li = document.createElement("li");

    li.className = t.priority;

    li.innerHTML = `
      <span style="text-decoration:${t.done ? "line-through" : ""}">
        ${t.name} (${t.category}) - ${t.priority}
      </span>
      <div>
        <button onclick="toggle(${i})">✔</button>
        <button onclick="del(${i})">❌</button>
      </div>
    `;

    ul.appendChild(li);
  });

  document.getElementById("stats").innerText =
    tasks.filter(t => t.done).length;

  document.getElementById("streak").innerText = streak;

  updateProgress();
}

function addTask() {
  let name = document.getElementById("taskInput").value;
  let date = document.getElementById("date").value;
  let category = document.getElementById("category").value;
  let priority = document.getElementById("priority").value;

  if (!name) return alert("Enter task!");

  tasks.push({ name, date, category, priority, done: false });

  document.getElementById("taskInput").value = "";

  save();
  display();
}

function toggle(i) {
  tasks[i].done = !tasks[i].done;

  if (tasks.every(t => t.done)) {
    streak++;
    localStorage.setItem("streak", streak);
    alert("🔥 Streak Increased!");
  }

  save();
  display();
}

function del(i) {
  tasks.splice(i, 1);
  save();
  display();
}

function searchTask() {
  let q = document.getElementById("search").value.toLowerCase();
  let filtered = tasks.filter(t => t.name.toLowerCase().includes(q));
  display(filtered);
}

function updateProgress() {
  let done = tasks.filter(t => t.done).length;
  let percent = tasks.length ? (done / tasks.length) * 100 : 0;
  document.getElementById("progress").style.width = percent + "%";
}

// DARK MODE
function toggleDark() {
  document.body.classList.toggle("dark");
}

// TIMER
let time = 1500, interval;

function start() {
  time = parseInt(document.getElementById("mode").value);

  if (interval) return;

  interval = setInterval(() => {
    if (time <= 0) {
      clearInterval(interval);
      interval = null;
      alert("⏰ Time's up!");
      return;
    }

    time--;
    update();
  }, 1000);
}

function pause() {
  clearInterval(interval);
  interval = null;
}

function reset() {
  clearInterval(interval);
  interval = null;
  time = 1500;
  update();
}

function update() {
  let m = Math.floor(time / 60);
  let s = time % 60;

  document.getElementById("time").innerText =
    `${m}:${s < 10 ? "0" : ""}${s}`;
}


function exportData() {
  let data = JSON.stringify(tasks);
  navigator.clipboard.writeText(data);
  alert("Copied!");
}

function clearAll() {
  tasks = [];
  save();
  display();
}

display();
update();
