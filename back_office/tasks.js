document.addEventListener("DOMContentLoaded", () => {
  console.log("task page loaded successfully ✅");
  loadtask();   // מפעיל את הפונקציה
});

async function loadtask() {
  const { data: task, error } = await supabase
    .from('task')
    .select('*')
    .order('task_id', { ascending: true });

  if (error) {
    console.error("Error loading task:", error);
    return;
  }

  console.log("Loaded task:", task);

  const tbody = document.querySelector(".task-table tbody");
  if (!tbody) {
    console.error("Error: .task-table tbody not found");
    return;
  }

  tbody.innerHTML = "";

  task.forEach(task => {
    tbody.innerHTML += `
      <tr>
        <td><input type="checkbox"></td>
        <td>${task.request_type}</td>
        <td>${task.room_number}</td>
        <td>${formatDate(task.created_at)}</td>
        <td>
          <span class="status ${mapStatus(task.status)}">
            ${formatStatus(task.status)}
          </span>
        </td>
        <td>${task.priority || "Medium"}</td>
        <td>
          <button class="view-btn" onclick="openTask(${task.task_id})">
            View Task
          </button>
        </td>
      </tr>
    `;
  });
}

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

function openTask(id) {
  window.location.href = `task-details.html?id=${id}`;
}
