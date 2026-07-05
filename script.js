let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let notes = JSON.parse(localStorage.getItem("notes")) || [];

let generatedNotes = "";
let quizData = [];
let score = 0;

let mode = "notes"; // default mode

// MODE
function setMode(m) {
  mode = m;

  // highlight active mode button
  document.querySelectorAll(".mode-select button").forEach(btn => {
    btn.classList.remove("active-mode");
  });
  event.target.classList.add("active-mode");
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

  // CLEAN TEXT
  text = text.replace(/\s+/g, " ").trim();

  let sentences = text.split(".").filter(s => s.length > 20);

  //  NOTES
  generatedNotes = sentences.slice(0, 5).join(".") + ".";

  // QUIZ
  quizData = [];

  for (let i = 0; i < 3; i++) {

    let correct = sentences[i];

    // wrong options
    let options = [
      correct,
      sentences[i+1] || correct,
      sentences[i+2] || correct,
      "None of the above"
    ];

    // shuffle
    options = options.sort(() => Math.random() - 0.5);

    quizData.push({
      q: "What is correct about:",
      options: options,
      answer: correct
    });
  }

  displayOutput();
}
// OUTPUT
function displayOutput() {

  let html = "";

  if (mode === "notes") {
    html = `<h3>🧠 Notes from PDF</h3><p>${generatedNotes}</p>`;
  }

  if (mode === "quiz") {
    html = `<h3>🎯 Quiz from PDF</h3>`;

    quizData.forEach((q, i) => {
      html += `<p>${i+1}. ${q.q}</p>`;

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

// SCORE
let total = 0;
let correct = 0;

function checkAnswer(selected, answer) {
  total++;

  if (selected === answer) {
    correct++;
    alert("✅ Correct");
  } else {
    alert("❌ Wrong");
  }

  let percent = Math.round((correct / total) * 100);
  document.getElementById("score").innerText = percent + "%";
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