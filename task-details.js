const params = new URLSearchParams(window.location.search);
const taskId = params.get("id");

const tasks = {
  402: {
    title: "Cleaning Room 402",
    guest: "Yaniv Cohen",
    submitted: "12:58 Feb 12,2025",
    status: "Not Started",
    type: "Hotel Facilities",
    urgency: "Low",
    notes: ""
  }
};

function loadTask() {
  const task = tasks[taskId];

  if (!task) {
    document.getElementById("task-title").textContent = "Task not found";
    return;
  }

  document.getElementById("task-title").textContent =
    `${task.title} — ${task.guest}`;

  document.getElementById("status").value = task.status;
  document.getElementById("task-type").value = task.type;
  document.getElementById("urgency").value = task.urgency;
  document.getElementById("notes").value = task.notes;
}

window.onload = loadTask;
