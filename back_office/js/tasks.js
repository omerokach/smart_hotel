let allTasks = []; 
let sortDirection = 'asc';

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task page loaded successfully");
  loadTasks();
});

/* ===============================
   LOAD TASKS FROM API
================================ */

async function loadTasks() {
  showLoader();
  const status = document.getElementById("filter-status").value;
  const urgency = document.getElementById("filter-urgency").value;
  const department = document.getElementById("filter-department").value;

  let url = "https://smart-hotel-tasks-api.onrender.com/api/tasks";

  const params = new URLSearchParams();

  if (status !== "all") params.append("status", status);
  if (urgency !== "all") params.append("priority", urgency);
  if (department !== "all") params.append("assigned_department", department);

  if (params.toString()) url += "?" + params.toString();

  console.log("Fetching:", url);

  const response = await fetch(url);
  const data = await response.json();

  // API מחזיר { tasks: [...] }
  allTasks = data.tasks || [];
  renderTasks(allTasks);
  hideLoader()
}

/* ===============================
   RENDER TABLE
================================ */

function renderTasks(tasks) {
  const tbody = document.querySelector(".task-table tbody");
  if (!tbody) {
    console.error("Error: .task-table tbody not found");
    return;
  }

  tbody.innerHTML = "";

  tasks.forEach(task => {
    console.log("Rendering task:", task.task_id, task);
    tbody.innerHTML += `
      <tr>
        <td><input type="checkbox"></td>

        <!-- Department במקום Task type -->
        <td>${task.assigned_department || "-"}</td>
            
        <td>${task.request_type || '-'}</td>

        <td>${task.room_number}</td>

        <td>${formatDate(task.created_at)}</td>

        <td>
          <span class="status ${mapStatus(task.status)}">
            ${formatStatus(task.status)}
          </span>
        </td>

        <td>${task.priority || "Normal"}</td>

        <td>
          <button class="view-btn" onclick="openTask(${task.task_id})">
            View Task
          </button>
        </td>
      </tr>
    `;
  });
}

/* ===============================
   HELPERS
================================ */

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function mapStatus(status) {
  if (status === "done") return "done";
  if (status === "in_progress") return "progress";
  if (status === "manager_approval") return "manager";
  return "open";
}

function formatStatus(status) {
  if (status === "done") return "Done";
  if (status === "in_progress") return "In Progress";
  if (status === "manager_approval") return "Manager Approval";
  return "Open";
}

/* ===============================
   OPEN TASK DETAILS
================================ */

function openTask(id) {
  console.log("Opening task with ID:", id);
  if (!id || id === "undefined" || id === "null") {
    alert("Invalid task ID: " + id);
    return;
  }
  window.location.href = `task-details.html?id=${id}`;
}

/* ===============================
   FILTER EVENTS
================================ */

document.getElementById("filter-status").addEventListener("change", loadTasks);
document.getElementById("filter-urgency").addEventListener("change", loadTasks);
document.getElementById("filter-department").addEventListener("change", loadTasks);

function sortByTime() {
  allTasks.sort((a, b) => {
    const da = new Date(a.created_at);
    const db = new Date(b.created_at);

    return sortDirection === 'asc' ? da - db : db - da;
  });
}

document.getElementById("sort-time").addEventListener("click", () => {
  sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  sortByTime();
  renderTasks(allTasks);
});
