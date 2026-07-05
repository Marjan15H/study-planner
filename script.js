let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let notes = JSON.parse(localStorage.getItem("notes")) || [];

let generatedNotes = "";
let quizData = [];
let score = 0;

let mode = "notes"; // 🔥 FIX

// MODE
function setMode(m) {
  mode = m;
  alert("Mode: " + m);
}

// TASK
function addTask() {
  let val = document.getElementById("taskInput").value;
  if (!val) return;

  tasks.push(val);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  display();
}

function display() {
  let ul = document.getElementById("taskList");
  ul.innerHTML = "";

  tasks.forEach((t, i) => {
    ul.innerHTML += `<li>${t} <button onclick="del(${i})">❌</button></li>`;
  });
}

function del(i) {
  tasks.splice(i, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  display();
}

function searchTask() {
  let q = document.getElementById("search").value.toLowerCase();
  let ul = document.getElementById("taskList");

  ul.innerHTML = tasks
    .filter(t => t.toLowerCase().includes(q))
    .map((t, i) => `<li>${t}</li>`).join("");
}

// NOTES
function addNote() {
  let title = document.getElementById("noteTitle").value;
  let text = document.getElementById("noteText").value;

  if (!title || !text) return alert("Write something!");

  let summary = text.split(".").slice(0,2).join(".") + "...";

  notes.unshift({title, text, summary});
  localStorage.setItem("notes", JSON.stringify(notes));
  displayNotes();
}

function displayNotes() {
  let div = document.getElementById("notes");
  div.innerHTML = "";

  notes.forEach(n => {
    div.innerHTML += `
      <div class="note">
        <h3>${n.title}</h3>
        <p>${n.summary}</p>
      </div>
    `;
  });
}

// PDF PROCESS 
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

// GENERATE
function generate(text) {
  let sentences = text.split(".").slice(0,5);

  generatedNotes = sentences.join(".") + "...";

  quizData = sentences.map(s => ({
    q: s,
    answer: s
  }));

  displayOutput();
}

// OUTPUT 
function displayOutput() {
  let html = "";

  if (mode === "notes") {
    html = `<h3>🧠 Notes</h3><p>${generatedNotes}</p>`;
  }

  if (mode === "quiz") {
    html = `<h3>❓ Quiz</h3>`;

    quizData.forEach((q, i) => {
      html += `
        <p>${i+1}. ${q.q}</p>
        <button onclick="check(${i})">✅ Correct</button>
        <button onclick="wrong()">❌ Wrong</button>
      `;
    });
  }

  document.getElementById("output").innerHTML = html;
}

// SCORE
function check(i) {
  score++;
  document.getElementById("score").innerText = score;
}

function wrong() {
  alert("Wrong!");
}

// SAVE GENERATED
function saveGeneratedNotes() {
  if (!generatedNotes) return alert("No notes generated!");

  notes.unshift({
    title:"Generated",
    text:generatedNotes,
    summary:generatedNotes
  });

  localStorage.setItem("notes", JSON.stringify(notes));
  displayNotes();
}

// DOWNLOAD PDF
function downloadGeneratedPDF() {
  if (!generatedNotes) return alert("No notes!");

  const { jsPDF } = window.jspdf;
  let doc = new jsPDF();

  let text = doc.splitTextToSize(generatedNotes, 180);
  doc.text(text, 10, 10);

  doc.save("notes.pdf");
}

// INIT
display();
displayNotes();