/* GET TASK ID FROM URL */

const params = new URLSearchParams(window.location.search);
const taskId = params.get("id");


/* LOAD TASK FROM API */

async function loadTask() {
  showLoader();
  try {
    const res = await fetch(`https://smart-hotel-tasks-api.onrender.com/api/tasks/${taskId}`);
    const task = await res.json();

    console.log("Loaded task:", task);

    // אם אין משימה
    if (!task || !task.task_id) {
      document.getElementById("task-title").textContent = "Task not found";
      return;
    }

    /* Title */
    document.getElementById("task-title").textContent =
      `${task.assigned_department} — Room ${task.room_number}`;

    /* Status Pill */
    updateStatusPill(task.status);

    /* Department */
    document.getElementById("department").value =
      task.assigned_department || "Housekeeping";

    /* Urgency */
    document.getElementById("urgency").value =
      task.priority || "Normal";

    /* Status */
    document.getElementById("status").value =
      task.status || "open";

    /* Guest Description (not editable) */
    document.getElementById("request-description").textContent =
      task.request_details || "No description provided.";

    /* Internal notes */
    const notesField = document.getElementById("notes");

    if (task.internal_notes && task.internal_notes.trim() !== "") {
      // יש הערות — מציגים אותן
      notesField.value = task.internal_notes;
      notesField.placeholder = "";
    } else {
      // אין internal_notes — מציגים placeholder
      notesField.value = "";
      notesField.placeholder = "Write any clarifications if needed";
    }

  } catch (err) {
    console.error("Error loading task:", err);
    document.getElementById("task-title").textContent = "Task not found";
  }
  hideLoader()
}


/* UPDATE TASK */

async function updateTask() {
  showLoader()
  const updates = {
    assigned_department: document.getElementById("department").value,
    priority: document.getElementById("urgency").value,
    status: document.getElementById("status").value,
    internal_notes: document.getElementById("notes").value
  };

  console.log("Sending updates:", updates);

  const res = await fetch(
    `https://smart-hotel-tasks-api.onrender.com/api/tasks/${taskId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    }
  );

  const result = await res.json();
  console.log("PATCH result:", result);

  if (res.ok) {
    updateStatusPill(updates.status);
    showSuccess("Task updated successfully!");
  } else {
    showError(result.error || "Failed updating task");
  }
  hideLoader()
}


/* STATUS PILL UI */

function updateStatusPill(status) {
  const pill = document.getElementById("task-status-pill");

  pill.textContent = status;

  pill.style.background = "";
  pill.style.color = "";

  if (status === "done") {
    pill.style.background = "#d2f8d2";
    pill.style.color = "#207520";
  } else if (status === "in_progress") {
    pill.style.background = "#fff3cd";
    pill.style.color = "#856404";
  } else if (status === "manager_approval") {
    pill.style.background = "#d8e9ff";
    pill.style.color = "#0052cc";
  } else {
    pill.style.background = "#e9eeff";
    pill.style.color = "#000";
  }
}

/* SUCCESS MODAL */

function showSuccess(message) {
  document.getElementById("modal-message").textContent = message;
  document.getElementById("success-modal").classList.remove("hidden");
}

function showError(message) {
  document.getElementById("modal-message").textContent = message;
  document.getElementById("success-modal").classList.remove("hidden");
}

document.getElementById("modal-close").addEventListener("click", () => {
  document.getElementById("success-modal").classList.add("hidden");
});


/* RETURN BUTTON */

document.getElementById("btn-return")?.addEventListener("click", () => {
  window.location.href = "tasks.html";
});


/* INIT */

document.addEventListener("DOMContentLoaded", () => {
  loadTask();
  document.getElementById("btn-update").addEventListener("click", updateTask);
});
