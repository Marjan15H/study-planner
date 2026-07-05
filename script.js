//DATA
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let streakData = JSON.parse(localStorage.getItem("streakData")) || { count: 0, lastDate: null };

let generatedNotes = "";
let quizData = [];

let mode = "notes"; 

// MODE (PDF Notes/Quiz) 
function setMode(m) {
  mode = m;
  document.querySelectorAll(".mode-select button").forEach(btn => {
    btn.classList.remove("active-mode");
  });
  event.target.classList.add("active-mode");
}

//TASKS 
function addTask() {
  let text = document.getElementById("taskInput").value.trim();
  let date = document.getElementById("taskDate").value;
  let category = document.getElementById("taskCategory").value;
  let priority = document.getElementById("taskPriority").value;

  if (!text) return alert("Write a task!");

  tasks.push({
    id: Date.now(),
    text,
    date,
    category,
    priority,
    completed: false
  });

  saveTasks();
  document.getElementById("taskInput").value = "";
  document.getElementById("taskDate").value = "";
  display();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function display(list) {
  let ul = document.getElementById("taskList");
  ul.innerHTML = "";

  let source = list || tasks;

  source.forEach(t => {
    let li = document.createElement("li");
    li.className = t.priority || "";

    let meta = [];
    if (t.category) meta.push(t.category);
    if (t.date) meta.push(t.date);

    li.innerHTML = `
      <span class="task-text ${t.completed ? "done" : ""}">
        <input type="checkbox" ${t.completed ? "checked" : ""} onchange="toggleComplete(${t.id})">
        ${t.text} ${meta.length ? `<small>(${meta.join(" • ")})</small>` : ""}
      </span>
      <button onclick="del(${t.id})">❌</button>
    `;

    ul.appendChild(li);
  });

  updateProgress();
}

function toggleComplete(id) {
  let task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;

  if (task.completed) {
    updateStreak();
  }

  saveTasks();
  display();
}

function del(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  display();
}

function searchTask() {
  let q = document.getElementById("search").value.toLowerCase();
  let filtered = tasks.filter(t => t.text.toLowerCase().includes(q));
  display(filtered);
}

function updateProgress() {
  let total = tasks.length;
  let completed = tasks.filter(t => t.completed).length;
  let percent = total ? Math.round((completed / total) * 100) : 0;

  document.getElementById("progress").style.width = percent + "%";
  document.getElementById("completedCount").innerText = completed;
  document.getElementById("streakCount").innerText = streakData.count;
}

//STREAK
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak() {
  let today = todayStr();

  if (streakData.lastDate === today) {
    
  } else if (isYesterday(streakData.lastDate, today)) {
    streakData.count += 1;
    streakData.lastDate = today;
  } else {
    streakData.count = 1;
    streakData.lastDate = today;
  }

  localStorage.setItem("streakData", JSON.stringify(streakData));
}

function isYesterday(lastDate, today) {
  if (!lastDate) return false;
  let last = new Date(lastDate);
  let cur = new Date(today);
  let diff = (cur - last) / (1000 * 60 * 60 * 24);
  return diff === 1;
}

//FOCUS MODE (POMODORO)
let timerInterval = null;
let timeLeft = 25 * 60;

document.addEventListener("DOMContentLoaded", () => {
  let durationSelect = document.getElementById("timerDuration");
  durationSelect.addEventListener("change", () => {
    timeLeft = parseInt(durationSelect.value) * 60;
    updateTimerDisplay();
  });
});

function updateTimerDisplay() {
  let min = Math.floor(timeLeft / 60);
  let sec = timeLeft % 60;
  document.getElementById("timerDisplay").innerText =
    `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function startTimer() {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      alert("⏰ Focus session complete!");
      return;
    }
    timeLeft--;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  let duration = parseInt(document.getElementById("timerDuration").value);
  timeLeft = duration * 60;
  updateTimerDisplay();
}

//NOTES
function addNote() {
  let title = document.getElementById("noteTitle").value.trim();
  let text = document.getElementById("noteText").value.trim();

  if (!title || !text) return alert("Write something!");

  let summary = text.split(".").slice(0, 2).join(".") + "...";

  notes.unshift({ title, text, summary });
  localStorage.setItem("notes", JSON.stringify(notes));

  document.getElementById("noteTitle").value = "";
  document.getElementById("noteText").value = "";

  displayNotes();
}

function displayNotes(list) {
  let div = document.getElementById("notes");
  div.innerHTML = "";

  let source = list || notes;

  source.forEach(n => {
    div.innerHTML += `
      <div class="note">
        <h3>${n.title}</h3>
        <p>${n.summary}</p>
      </div>
    `;
  });
}

function searchNotes() {
  let q = document.getElementById("noteSearch").value.toLowerCase();
  let filtered = notes.filter(n =>
    n.title.toLowerCase().includes(q) || n.text.toLowerCase().includes(q)
  );
  displayNotes(filtered);
}

//PDF PROCESS
async function processFile() {
  let file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Upload PDF");

  let pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    let page = await pdf.getPage(i);
    let content = await page.getTextContent();
    text += content.items.map(i => i.str).join(" ");
  }

  generate(text);
}

// GENERATE NOTES/QUIZ 
function generate(text) {
  text = text.replace(/\s+/g, " ").trim();

  let sentences = text.split(".").filter(s => s.length > 20);

  // NOTES
  generatedNotes = sentences.slice(0, 5).join(".") + ".";

  // QUIZ
  quizData = [];

  for (let i = 0; i < 3; i++) {
    let correct = sentences[i];

    let options = [
      correct,
      sentences[i + 1] || correct,
      sentences[i + 2] || correct,
      "None of the above"
    ];

    options = options.sort(() => Math.random() - 0.5);

    quizData.push({
      q: "What is correct about:",
      options: options,
      answer: correct
    });
  }

  displayOutput();
}

function displayOutput() {
  let html = "";

  if (mode === "notes") {
    html = `<h3>🧠 Notes from PDF</h3><p>${generatedNotes}</p>`;
  }

  if (mode === "quiz") {
    html = `<h3>🎯 Quiz from PDF</h3>`;

    quizData.forEach((q, i) => {
      html += `<p>${i + 1}. ${q.q}</p>`;

      q.options.forEach(opt => {
        html += `
          <button onclick="checkAnswer('${opt}','${q.answer}')">
            ${opt}
          </button>
        `;
      });
    });
  }

  document.getElementById("output").innerHTML = html;
}

// QUIZ SCORE 
let total = 0;
let correctCount = 0;

function checkAnswer(selected, answer) {
  total++;

  if (selected === answer) {
    correctCount++;
    alert("✅ Correct");
  } else {
    alert("❌ Wrong");
  }

  let percent = Math.round((correctCount / total) * 100);
  document.getElementById("score").innerText = percent + "%";
}

// SAVE / DOWNLOAD GENERATED NOTES
function saveGeneratedNotes() {
  if (!generatedNotes) return alert("No notes generated!");

  notes.unshift({
    title: "Generated",
    text: generatedNotes,
    summary: generatedNotes
  });

  localStorage.setItem("notes", JSON.stringify(notes));
  displayNotes();
}

function downloadGeneratedPDF() {
  if (!generatedNotes) return alert("No notes!");

  const { jsPDF } = window.jspdf;
  let doc = new jsPDF();

  let text = doc.splitTextToSize(generatedNotes, 180);
  doc.text(text, 10, 10);

  doc.save("notes.pdf");
}

//EXPORT / CLEAR 
function exportData() {
  let data = { tasks, notes, streakData };
  let blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "study-planner-data.json";
  a.click();

  URL.revokeObjectURL(url);
}

function clearData() {
  if (!confirm("This will delete all tasks and notes. Continue?")) return;

  localStorage.removeItem("tasks");
  localStorage.removeItem("notes");
  localStorage.removeItem("streakData");

  tasks = [];
  notes = [];
  streakData = { count: 0, lastDate: null };

  display();
  displayNotes();
}

// INIT 
display();
displayNotes();
updateTimerDisplay();