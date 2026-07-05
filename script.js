let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function displayTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((task, index) => {
    let li = document.createElement("li");
    li.innerHTML = `
      ${task.name} (${task.priority}) - ${task.date}
      <button onclick="deleteTask(${index})">❌</button>
    `;
    list.appendChild(li);
  });
}

function addTask() {
  const name = document.getElementById("taskInput").value;
  const date = document.getElementById("deadline").value;
  const priority = document.getElementById("priority").value;

  tasks.push({ name, date, priority });
  saveTasks();
  displayTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  displayTasks();
}

displayTasks();


// Timer
let time = 1500;
let interval;

function startTimer() {
  interval = setInterval(() => {
    if (time <= 0) clearInterval(interval);
    time--;

    let min = Math.floor(time / 60);
    let sec = time % 60;

    document.getElementById("timer").innerText =
      `${min}:${sec < 10 ? "0" : ""}${sec}`;
  }, 1000);
}

function resetTimer() {
  clearInterval(interval);
  time = 1500;
  document.getElementById("timer").innerText = "25:00";
}