const subjectList = document.getElementById("subjectList");
const subjectTitle = document.getElementById("subjectTitle");
const attendanceValue = document.getElementById("attendanceValue");
const modal = document.getElementById("subjectModal");
const openAddSubject = document.getElementById("openAddSubject");
const closeAddSubject = document.getElementById("closeAddSubject");
const subjectForm = document.getElementById("subjectForm");
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

const subjects = [
  { name: "الرياضيات", color: "#60a5fa", attendance: "18 / 24" },
  { name: "العلوم", color: "#34d399", attendance: "20 / 22" },
  { name: "اللغة الإنجليزية", color: "#fbbf24", attendance: "16 / 20" },
  { name: "الفلسفة", color: "#a78bfa", attendance: "14 / 18" }
];

function renderSubjects() {
  subjectList.innerHTML = "";

  subjects.forEach((subject) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "subject-chip";
    item.innerHTML = `
      <div class="meta-side">
        <span class="color-badge" style="background:${subject.color};"></span>
        <span>${subject.name}</span>
      </div>
      <span class="subject-count">${subject.attendance}</span>
    `;

    item.addEventListener("click", () => {
      subjectTitle.textContent = subject.name;
      attendanceValue.textContent = subject.attendance;
    });

    subjectList.appendChild(item);
  });
}

openAddSubject.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

closeAddSubject.addEventListener("click", () => {
  modal.classList.add("hidden");
});

subjectForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("subjectName").value.trim();
  const day = document.getElementById("subjectDay").value;
  const time = document.getElementById("subjectTime").value;

  if (!name) return;

  const newSubject = {
    name,
    color: ["#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#f472b6"][subjects.length % 5],
    attendance: "12 / 18"
  };

  subjects.push(newSubject);
  renderSubjects();

  subjectTitle.textContent = name;
  attendanceValue.textContent = newSubject.attendance;

  const scheduleRow = document.createElement("div");
  scheduleRow.className = "schedule-row";
  scheduleRow.innerHTML = `
    <span>${day}</span>
    <span>${time}</span>
    <span>${name}</span>
  `;

  const scheduleTable = document.querySelector(".schedule-table");
  scheduleTable.appendChild(scheduleRow);

  modal.classList.add("hidden");
  subjectForm.reset();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;

    tabs.forEach((btn) => btn.classList.toggle("active", btn === tab));
    tabContents.forEach((content) => {
      content.classList.toggle("active", content.id === target);
    });
  });
});

renderSubjects();
