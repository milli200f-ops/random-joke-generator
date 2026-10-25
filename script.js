const STORAGE_KEY = "darsi-app-data-v1";

const DAYS = ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

const defaultData = {
  selectedSubjectId: null,
  subjects: [
    {
      id: "sub-1",
      name: "الرياضيات",
      day: "الاثنين",
      time: "08:30",
      attendance: 18,
      total: 24,
      color: "#60a5fa"
    },
    {
      id: "sub-2",
      name: "العلوم",
      day: "الثلاثاء",
      time: "10:00",
      attendance: 20,
      total: 22,
      color: "#34d399"
    },
    {
      id: "sub-3",
      name: "اللغة الإنجليزية",
      day: "الأربعاء",
      time: "09:15",
      attendance: 16,
      total: 20,
      color: "#fbbf24"
    }
  ],
  assignments: [
    { id: "a1", subjectId: "sub-1", title: "حل صفحة 44", dueDate: "2026-10-27", dueTime: "08:00", status: "قيد الإنجاز" },
    { id: "a2", subjectId: "sub-2", title: "ملخص الفصل", dueDate: "2026-10-29", dueTime: "15:00", status: "مكتمل" }
  ],
  lessons: [
    { id: "l1", subjectId: "sub-1", title: "درس الجبر", notes: "تم شرح المعادلات الخطية ومراجعة التمارين الأساسية.", date: "2026-10-24" },
    { id: "l2", subjectId: "sub-2", title: "درس الكائنات الحية", notes: "مراجعة الخلايا والهياكل الأساسية.", date: "2026-10-25" }
  ],
  exams: [
    { id: "e1", subjectId: "sub-1", title: "اختبار منتصف الفصل", date: "2026-11-02", time: "10:00", reminder: "يوم واحد" },
    { id: "e2", subjectId: "sub-3", title: "اختبار مفردات", date: "2026-11-04", time: "09:30", reminder: "3 ساعات" }
  ]
};

const state = loadData();

const subjectTitle = document.getElementById("subjectTitle");
const attendanceValue = document.getElementById("attendanceValue");
const subjectList = document.getElementById("subjectList");
const scheduleList = document.getElementById("scheduleList");
const upcomingList = document.getElementById("upcomingList");
const assignmentsList = document.getElementById("assignmentsList");
const lessonsList = document.getElementById("lessonsList");
const examsList = document.getElementById("examsList");

const subjectModal = document.getElementById("subjectModal");
const itemModal = document.getElementById("itemModal");
const subjectModalTitle = document.getElementById("subjectModalTitle");
const itemModalTitle = document.getElementById("itemModalTitle");
const itemFields = document.getElementById("itemFields");
const itemTypeInput = document.getElementById("itemType");
const itemIdInput = document.getElementById("itemId");

const subjectForm = document.getElementById("subjectForm");
const itemForm = document.getElementById("itemForm");

const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");
const addButtons = document.querySelectorAll(".ghost-btn");

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return structuredClone(defaultData);
  }

  try {
    const parsed = JSON.parse(stored);
    if (!parsed.subjects) parsed.subjects = [];
    if (!parsed.assignments) parsed.assignments = [];
    if (!parsed.lessons) parsed.lessons = [];
    if (!parsed.exams) parsed.exams = [];
    return parsed;
  } catch {
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureSelectedSubject() {
  if (!state.subjects.length) {
    state.selectedSubjectId = null;
    return null;
  }

  if (!state.selectedSubjectId || !state.subjects.some((s) => s.id === state.selectedSubjectId)) {
    state.selectedSubjectId = state.subjects[0].id;
  }

  return state.selectedSubjectId;
}

function getSelectedSubject() {
  const id = ensureSelectedSubject();
  return state.subjects.find((s) => s.id === id) || null;
}

function getSubjectById(id) {
  return state.subjects.find((subject) => subject.id === id) || null;
}

function formatAttendance(subject) {
  const total = Number(subject.total || 0);
  const attendance = Number(subject.attendance || 0);
  return `${attendance} / ${total}`;
}

function renderStats() {
  const subjectsCount = state.subjects.length;
  const completed = state.assignments.filter((a) => a.status === "مكتمل").length;
  const inProgress = state.assignments.filter((a) => a.status === "قيد الإنجاز").length;
  const upcoming = state.assignments.filter((a) => a.status !== "مكتمل").length;

  document.getElementById("statSubjects").textContent = subjectsCount;
  document.getElementById("statCompleted").textContent = completed;
  document.getElementById("statProgress").textContent = inProgress;
  document.getElementById("statUpcoming").textContent = upcoming;

  document.getElementById("welcomeText").textContent = `${upcoming} واجبات قريبة`;
  document.getElementById("welcomeExam").textContent = state.exams.length ? `لديك ${state.exams.length} امتحان قادم` : "لا يوجد امتحان قريب";
}

function renderSubjectList() {
  subjectList.innerHTML = "";

  if (!state.subjects.length) {
    subjectList.innerHTML = '<p class="empty-state">لا توجد مواد بعد</p>';
    return;
  }

  state.subjects.forEach((subject) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `subject-chip ${subject.id === state.selectedSubjectId ? "selected" : ""}`;
    button.innerHTML = `
      <div class="meta-side">
        <span class="color-badge" style="background:${subject.color};"></span>
        <span>${subject.name}</span>
      </div>
      <span class="subject-count">${formatAttendance(subject)}</span>
    `;

    button.addEventListener("click", () => {
      state.selectedSubjectId = subject.id;
      saveData();
      renderAll();
    });

    subjectList.appendChild(button);
  });
}

function renderSchedule() {
  scheduleList.innerHTML = "";

  const header = document.createElement("div");
  header.className = "schedule-row header-row";
  header.innerHTML = "<span>اليوم</span><span>الوقت</span><span>المادة</span>";
  scheduleList.appendChild(header);

  state.subjects.forEach((subject) => {
    const row = document.createElement("div");
    row.className = "schedule-row";
    row.innerHTML = `<span>${subject.day}</span><span>${subject.time}</span><span>${subject.name}</span>`;
    scheduleList.appendChild(row);
  });
}

function renderUpcoming() {
  upcomingList.innerHTML = "";

  const upcomingItems = [];

  state.assignments.forEach((assignment) => {
    if (assignment.status !== "مكتمل") {
      const subject = getSubjectById(assignment.subjectId);
      upcomingItems.push({
        type: "assignment",
        title: `${subject ? subject.name : "مادة"} - ${assignment.title}`,
        text: `يُسلم ${assignment.dueDate} ${assignment.dueTime}`,
        kind: "warning"
      });
    }
  });

  state.exams.forEach((exam) => {
    const subject = getSubjectById(exam.subjectId);
    upcomingItems.push({
      type: "exam",
      title: `${subject ? subject.name : "مادة"} - ${exam.title}`,
      text: `${exam.date} | ${exam.time}`,
      kind: "danger"
    });
  });

  if (!upcomingItems.length) {
    upcomingList.innerHTML = '<div class="alert-item"><div class="dot success"></div><div><strong>لا توجد تنبيهات</strong><small>كل شيء على ما يرام</small></div></div>';
    return;
  }

  upcomingItems.slice(0, 4).forEach((item) => {
    const box = document.createElement("div");
    box.className = `alert-item ${item.kind === "danger" ? "danger" : "warning"}`;
    const statusDot = item.kind === "danger" ? "danger" : "warning";
    box.innerHTML = `
      <div class="dot ${statusDot}"></div>
      <div>
        <strong>${item.title}</strong>
        <small>${item.text}</small>
      </div>
    `;
    upcomingList.appendChild(box);
  });
}

function renderAssignments() {
  assignmentsList.innerHTML = "";
  const subject = getSelectedSubject();
  if (!subject) {
    assignmentsList.innerHTML = '<p class="empty-state">لا توجد مواد</p>';
    return;
  }

  const items = state.assignments.filter((item) => item.subjectId === subject.id);

  if (!items.length) {
    assignmentsList.innerHTML = '<p class="empty-state">لا توجد واجبات حتى الآن</p>';
    return;
  }

  items.forEach((item) => {
    const task = document.createElement("div");
    task.className = "task-item";
    task.innerHTML = `
      <div class="task-copy">
        <h4>${item.title}</h4>
        <small>يُسلم: ${item.dueDate} | ${item.dueTime}</small>
      </div>
      <div class="item-actions">
        <span class="status ${item.status === "مكتمل" ? "done" : "in-progress"}">${item.status}</span>
        <button class="action-btn edit" data-action="edit-assignment" data-id="${item.id}">تعديل</button>
        <button class="action-btn delete" data-action="delete-assignment" data-id="${item.id}">حذف</button>
      </div>
    `;
    assignmentsList.appendChild(task);
  });
}

function renderLessons() {
  lessonsList.innerHTML = "";
  const subject = getSelectedSubject();
  if (!subject) {
    lessonsList.innerHTML = '<p class="empty-state">لا توجد مواد</p>';
    return;
  }

  const items = state.lessons.filter((item) => item.subjectId === subject.id);

  if (!items.length) {
    lessonsList.innerHTML = '<p class="empty-state">لا توجد دروس مسجلة</p>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <div>
        <h4>${item.title}</h4>
        <p>${item.notes}</p>
        <small>${item.date}</small>
      </div>
      <div class="item-actions">
        <button class="action-btn edit" data-action="edit-lesson" data-id="${item.id}">تعديل</button>
        <button class="action-btn delete" data-action="delete-lesson" data-id="${item.id}">حذف</button>
      </div>
    `;
    lessonsList.appendChild(card);
  });
}

function renderExams() {
  examsList.innerHTML = "";
  const subject = getSelectedSubject();
  if (!subject) {
    examsList.innerHTML = '<p class="empty-state">لا توجد مواد</p>';
    return;
  }

  const items = state.exams.filter((item) => item.subjectId === subject.id);

  if (!items.length) {
    examsList.innerHTML = '<p class="empty-state">لا توجد امتحانات</p>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "task-item";
    card.innerHTML = `
      <div class="task-copy">
        <h4>${item.title}</h4>
        <small>التاريخ: ${item.date} | ${item.time} | ${item.reminder}</small>
      </div>
      <div class="item-actions">
        <span class="status reminder">${item.reminder}</span>
        <button class="action-btn edit" data-action="edit-exam" data-id="${item.id}">تعديل</button>
        <button class="action-btn delete" data-action="delete-exam" data-id="${item.id}">حذف</button>
      </div>
    `;
    examsList.appendChild(card);
  });
}

function renderSelectedSubject() {
  const subject = getSelectedSubject();
  if (!subject) {
    subjectTitle.textContent = "لا توجد مواد";
    attendanceValue.textContent = "0";
    return;
  }

  subjectTitle.textContent = subject.name;
  attendanceValue.textContent = formatAttendance(subject);
}

function renderAll() {
  ensureSelectedSubject();
  renderStats();
  renderSubjectList();
  renderSelectedSubject();
  renderSchedule();
  renderUpcoming();
  renderAssignments();
  renderLessons();
  renderExams();
}

function openSubjectModal(subject = null) {
  subjectModal.classList.remove("hidden");
  if (subject) {
    subjectModalTitle.textContent = "تعديل مادة";
    document.getElementById("subjectId").value = subject.id;
    document.getElementById("subjectName").value = subject.name;
    document.getElementById("subjectDay").value = subject.day;
    document.getElementById("subjectTime").value = subject.time;
    document.getElementById("subjectAttendance").value = subject.attendance;
    document.getElementById("subjectTotal").value = subject.total;
  } else {
    subjectModalTitle.textContent = "إضافة مادة";
    document.getElementById("subjectForm").reset();
    document.getElementById("subjectId").value = "";
    document.getElementById("subjectAttendance").value = 0;
    document.getElementById("subjectTotal").value = 20;
    document.getElementById("subjectDay").value = DAYS[0];
  }
}

function closeSubjectModal() {
  subjectModal.classList.add("hidden");
}

function openItemModal(type, item = null) {
  itemModal.classList.remove("hidden");
  itemTypeInput.value = type;
  itemIdInput.value = item ? item.id : "";

  const subject = getSelectedSubject();
  const fields = [];

  if (type === "assignment") {
    itemModalTitle.textContent = item ? "تعديل واجب" : "إضافة واجب";
    fields.push(`
      <label>
        اسم الواجب
        <input type="text" name="title" value="${item ? item.title : ""}" required />
      </label>
      <label>
        تاريخ التسليم
        <input type="date" name="dueDate" value="${item ? item.dueDate : ""}" required />
      </label>
      <label>
        وقت التسليم
        <input type="time" name="dueTime" value="${item ? item.dueTime : "08:00"}" required />
      </label>
      <label>
        الحالة
        <select name="status">
          <option value="قيد الإنجاز" ${item && item.status === "قيد الإنجاز" ? "selected" : ""}>قيد الإنجاز</option>
          <option value="مكتمل" ${item && item.status === "مكتمل" ? "selected" : ""}>مكتمل</option>
        </select>
      </label>
    `);
  }

  if (type === "lesson") {
    itemModalTitle.textContent = item ? "تعديل درس" : "تسجيل درس";
    fields.push(`
      <label>
        عنوان الدرس
        <input type="text" name="title" value="${item ? item.title : ""}" required />
      </label>
      <label>
        التاريخ
        <input type="date" name="date" value="${item ? item.date : new Date().toISOString().slice(0, 10)}" required />
      </label>
      <label>
        ملاحظاتك
        <textarea name="notes">${item ? item.notes : ""}</textarea>
      </label>
    `);
  }

  if (type === "exam") {
    itemModalTitle.textContent = item ? "تعديل امتحان" : "إضافة امتحان";
    fields.push(`
      <label>
        اسم الامتحان
        <input type="text" name="title" value="${item ? item.title : ""}" required />
      </label>
      <label>
        التاريخ
        <input type="date" name="date" value="${item ? item.date : ""}" required />
      </label>
      <label>
        الوقت
        <input type="time" name="time" value="${item ? item.time : "10:00"}" required />
      </label>
      <label>
        تذكير قبل الموعد
        <select name="reminder">
          <option value="30 دقيقة" ${item && item.reminder === "30 دقيقة" ? "selected" : ""}>30 دقيقة</option>
          <option value="3 ساعات" ${item && item.reminder === "3 ساعات" ? "selected" : ""}>3 ساعات</option>
          <option value="يوم واحد" ${item && item.reminder === "يوم واحد" ? "selected" : ""}>يوم واحد</option>
        </select>
      </label>
    `);
  }

  if (!subject) {
    itemFields.innerHTML = '<p class="empty-state">يجب اختيار مادة أولاً</p>';
    return;
  }

  itemFields.innerHTML = fields.join("");
}

function closeItemModal() {
  itemModal.classList.add("hidden");
  itemFields.innerHTML = "";
}

subjectForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = document.getElementById("subjectId").value;
  const name = document.getElementById("subjectName").value.trim();
  const day = document.getElementById("subjectDay").value;
  const time = document.getElementById("subjectTime").value;
  const attendance = Number(document.getElementById("subjectAttendance").value || 0);
  const total = Number(document.getElementById("subjectTotal").value || 20);

  if (!name) return;

  if (id) {
    const subject = state.subjects.find((s) => s.id === id);
    if (subject) {
      subject.name = name;
      subject.day = day;
      subject.time = time;
      subject.attendance = attendance;
      subject.total = total;
    }
  } else {
    const colors = ["#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#f472b6"];
    const newSubject = {
      id: `sub-${Date.now()}`,
      name,
      day,
      time,
      attendance,
      total,
      color: colors[state.subjects.length % colors.length]
    };
    state.subjects.push(newSubject);
    state.selectedSubjectId = newSubject.id;
  }

  saveData();
  closeSubjectModal();
  renderAll();
});

itemForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const type = itemTypeInput.value;
  const id = itemIdInput.value;
  const subject = getSelectedSubject();
  if (!subject) return;

  const formData = new FormData(itemForm);
  const values = Object.fromEntries(formData.entries());

  if (type === "assignment") {
    if (id) {
      const item = state.assignments.find((x) => x.id === id);
      if (item) {
        item.title = values.title;
        item.dueDate = values.dueDate;
        item.dueTime = values.dueTime;
        item.status = values.status;
      }
    } else {
      state.assignments.push({
        id: `a-${Date.now()}`,
        subjectId: subject.id,
        title: values.title,
        dueDate: values.dueDate,
        dueTime: values.dueTime,
        status: values.status
      });
    }
  }

  if (type === "lesson") {
    if (id) {
      const item = state.lessons.find((x) => x.id === id);
      if (item) {
        item.title = values.title;
        item.date = values.date;
        item.notes = values.notes;
      }
    } else {
      state.lessons.push({
        id: `l-${Date.now()}`,
        subjectId: subject.id,
        title: values.title,
        date: values.date,
        notes: values.notes
      });
    }
  }

  if (type === "exam") {
    if (id) {
      const item = state.exams.find((x) => x.id === id);
      if (item) {
        item.title = values.title;
        item.date = values.date;
        item.time = values.time;
        item.reminder = values.reminder;
      }
    } else {
      state.exams.push({
        id: `e-${Date.now()}`,
        subjectId: subject.id,
        title: values.title,
        date: values.date,
        time: values.time,
        reminder: values.reminder
      });
    }
  }

  saveData();
  closeItemModal();
  renderAll();
});

function deleteSubject(subjectId) {
  const confirmed = window.confirm("هل تريد حذف هذه المادة؟");
  if (!confirmed) return;

  state.subjects = state.subjects.filter((s) => s.id !== subjectId);
  state.assignments = state.assignments.filter((a) => a.subjectId !== subjectId);
  state.lessons = state.lessons.filter((l) => l.subjectId !== subjectId);
  state.exams = state.exams.filter((e) => e.subjectId !== subjectId);
  ensureSelectedSubject();
  saveData();
  renderAll();
}

function deleteItem(type, id) {
  const confirmed = window.confirm("هل تريد حذف هذا العنصر؟");
  if (!confirmed) return;

  if (type === "assignment") {
    state.assignments = state.assignments.filter((x) => x.id !== id);
  }
  if (type === "lesson") {
    state.lessons = state.lessons.filter((x) => x.id !== id);
  }
  if (type === "exam") {
    state.exams = state.exams.filter((x) => x.id !== id);
  }

  saveData();
  renderAll();
}

document.getElementById("openAddSubject").addEventListener("click", () => openSubjectModal());
document.getElementById("closeSubjectModal").addEventListener("click", closeSubjectModal);
document.getElementById("closeItemModal").addEventListener("click", closeItemModal);
document.getElementById("openItemModal").addEventListener("click", () => openItemModal("assignment"));

document.querySelector(".ghost-btn[data-item-type='assignment']").addEventListener("click", () => openItemModal("assignment"));
document.querySelector(".ghost-btn[data-item-type='lesson']").addEventListener("click", () => openItemModal("lesson"));
document.querySelector(".ghost-btn[data-item-type='exam']").addEventListener("click", () => openItemModal("exam"));

subjectModal.addEventListener("click", (event) => {
  if (event.target === subjectModal) closeSubjectModal();
});

itemModal.addEventListener("click", (event) => {
  if (event.target === itemModal) closeItemModal();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((btn) => btn.classList.toggle("active", btn === tab));
    tabContents.forEach((content) => {
      content.classList.toggle("active", content.id === `${tab.dataset.tab}Tab`);
    });
  });
});

function bindItemActions() {
  document.querySelectorAll("[data-action='edit-assignment']").forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.assignments.find((x) => x.id === button.dataset.id);
      if (item) openItemModal("assignment", item);
    });
  });

  document.querySelectorAll("[data-action='delete-assignment']").forEach((button) => {
    button.addEventListener("click", () => deleteItem("assignment", button.dataset.id));
  });

  document.querySelectorAll("[data-action='edit-lesson']").forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.lessons.find((x) => x.id === button.dataset.id);
      if (item) openItemModal("lesson", item);
    });
  });

  document.querySelectorAll("[data-action='delete-lesson']").forEach((button) => {
    button.addEventListener("click", () => deleteItem("lesson", button.dataset.id));
  });

  document.querySelectorAll("[data-action='edit-exam']").forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.exams.find((x) => x.id === button.dataset.id);
      if (item) openItemModal("exam", item);
    });
  });

  document.querySelectorAll("[data-action='delete-exam']").forEach((button) => {
    button.addEventListener("click", () => deleteItem("exam", button.dataset.id));
  });
}

const observer = new MutationObserver(() => {
  bindItemActions();
});

observer.observe(document.body, { childList: true, subtree: true });

renderAll();

setInterval(() => {
  renderAll();
}, 60000);


















































