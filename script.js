let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let todayCount = 0;

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function display(list = tasks) {
  let ul = document.getElementById("taskList");
  ul.innerHTML = "";

  list.forEach((t, i) => {
    let li = document.createElement("li");

    let overdue = t.date && new Date(t.date) < new Date() ? "overdue" : "";

    li.className = overdue;

    li.draggable = true;

    li.ondragstart = e => e.dataTransfer.setData("index", i);
    li.ondragover = e => e.preventDefault();
    li.ondrop = e => {
      let from = e.dataTransfer.getData("index");
      let temp = tasks[from];
      tasks[from] = tasks[i];
      tasks[i] = temp;
      save();
      display();
    };

    li.innerHTML = `
      <span style="text-decoration:${t.done ? "line-through" : ""}">
        ${t.name} (${t.category})
      </span>
      <div>
        <button onclick="toggle(${i})">✔</button>
        <button onclick="del(${i})">❌</button>
      </div>
    `;

    ul.appendChild(li);
  });

  document.getElementById("stats").innerText = todayCount;
}

function addTask() {
  let name = document.getElementById("taskInput").value;
  let date = document.getElementById("date").value;
  let category = document.getElementById("category").value;

  if (!name) return alert("Enter task!");

  tasks.push({ name, date, category, done: false });
  save();
  display();
}

function toggle(i) {
  tasks[i].done = !tasks[i].done;
  if (tasks[i].done) todayCount++;
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

display();


//  DARK MODE SAVE
function toggleDark() {
  document.body.classList.toggle("dark");
  localStorage.setItem("dark", document.body.classList.contains("dark"));
}

if (localStorage.getItem("dark") === "true") {
  document.body.classList.add("dark");
}


// TIMER PRO
let time = 1500, interval;
let beep = new Audio("https://www.soundjay.com/button/beep-07.wav");

function start() {
  time = document.getElementById("mode").value;
  if (interval) return;

  interval = setInterval(() => {
    if (time <= 0) {
      beep.play();
      clearInterval(interval);
      interval = null;
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
