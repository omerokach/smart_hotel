// messages.js
const API_BASE = "https://smart-hotel-tasks-api.onrender.com";

let activeTaskId = null;
let activeRoomNumber = null;
let pollingMessages = null;

let lastSeenTimestamp = {};   // { taskId: timestamp }
let taskLastMessage = {};     // { taskId: timestamp }

/* ----------------------------------------------------------
   On page load
----------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  loadConversations();
  setupSendButton();
  setupCreateTaskButton();

  // Refresh conversations list every 3 seconds
  setInterval(() => loadConversations(true), 3000);
});

/* ----------------------------------------------------------
   Load conversations (only escalation + open tasks)
----------------------------------------------------------- */
async function loadConversations(silent = false) {
  const listEl = document.getElementById("conversations-list");
  if (!listEl) return;

  if (!silent) showLoader();

  try {
    const res = await fetch(`${API_BASE}/api/tasks?escalation=true`);
    const data = await res.json();
    const tasks = data.tasks;

    if (!Array.isArray(tasks)) return;

    const openTasks = tasks.filter(t => t.status !== "closed");

    listEl.innerHTML = "";
    openTasks.forEach(task => {
      const item = document.createElement("div");
      item.classList.add("conversation-item");
      item.dataset.taskId = task.task_id;

      item.innerHTML = `
        <div class="conversation-title">
          <span class="room">Room ${task.room_number}</span>
          <span class="task">Task #${task.task_id}</span>
        </div>
      `;

      const lastSeen = lastSeenTimestamp[task.task_id];
      const info = taskLastMessage[task.task_id];
      const isNew = info && info.sender === "guest" &&
        (!lastSeen || info.timestamp > lastSeen);

      if (isNew) {
        const badge = document.createElement("div");
        badge.classList.add("new-badge");
        item.appendChild(badge);
      }

      item.addEventListener("click", () => selectConversation(task));
      listEl.appendChild(item);
    });

    highlightActiveConversation(activeTaskId);

  } catch (err) {
    console.error("Failed loading tasks:", err);
  } finally {
    if (!silent) hideLoader();
  }
}

/* ----------------------------------------------------------
   Select conversation
----------------------------------------------------------- */
function selectConversation(task) {
  activeTaskId = task.task_id;
  activeRoomNumber = task.room_number;

  document.getElementById("messages-client-name").textContent =
    `Room ${task.room_number}`;

  document.getElementById("messages-input").disabled = false;
  document.getElementById("send-btn").disabled = false;
  document.getElementById("create-task-btn").classList.add("visible");

  loadMessages(activeTaskId);

  if (pollingMessages) clearInterval(pollingMessages);
  pollingMessages = setInterval(() => loadMessages(activeTaskId, true), 2000);

  highlightActiveConversation(task.task_id);

  // Mark as seen
  lastSeenTimestamp[task.task_id] = new Date().toISOString();
}

/* ----------------------------------------------------------
   Highlight active conversation
----------------------------------------------------------- */
function highlightActiveConversation(taskId) {
  document.querySelectorAll(".conversation-item").forEach(item => {
    item.classList.toggle(
      "active",
      Number(item.dataset.taskId) === Number(taskId)
    );
  });
}

/* ----------------------------------------------------------
   Load messages
----------------------------------------------------------- */
async function loadMessages(taskId, silent = false) {
  if (!taskId) return;

  const box = document.getElementById("messages-box");
  if (!silent) box.innerHTML = "<p class='loading'>Loading...</p>";

  try {
    const res = await fetch(`${API_BASE}/api/tasks/${taskId}/messages`);
    const messages = await res.json();

    if (!Array.isArray(messages)) return;

   if (messages.length > 0) {
     const lastMsg = messages[messages.length - 1];
     taskLastMessage[taskId] = {
       timestamp: lastMsg.timestamp,
       sender: lastMsg.sender
     };
   }

    box.innerHTML = "";

    messages.forEach(msg => {
      const div = document.createElement("div");
      div.classList.add("msg", msg.sender === "staff" ? "msg-staff" : "msg-client");

      div.innerHTML = `
        <p>${msg.message}</p>
        <span>${formatTime(msg.timestamp)}</span>
      `;

      box.appendChild(div);
    });

    box.scrollTop = box.scrollHeight;

  } catch (err) {
    console.error("Failed loading messages:", err);
    box.innerHTML = "<p>Error loading messages.</p>";
  }
}

/* ----------------------------------------------------------
   Send message
----------------------------------------------------------- */
async function sendMessage() {
  const input = document.getElementById("messages-input");
  const text = input.value.trim();

  if (!text || !activeTaskId) return;

  const payload = { sender: "staff", message: text };

  try {
    await fetch(`${API_BASE}/api/tasks/${activeTaskId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    input.value = "";
    loadMessages(activeTaskId);

  } catch (err) {
    console.error("Failed sending message:", err);
  }
}

/* ----------------------------------------------------------
   Setup enter + send button
----------------------------------------------------------- */
function setupSendButton() {
  document.getElementById("send-btn").addEventListener("click", sendMessage);

  document.getElementById("messages-input")
    .addEventListener("keypress", e => {
      if (e.key === "Enter") sendMessage();
    });
}

/* ----------------------------------------------------------
   Format time
----------------------------------------------------------- */
function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ----------------------------------------------------------
   Setup Create Task Button
----------------------------------------------------------- */
function setupCreateTaskButton() {
  const createBtn = document.getElementById("create-task-btn");
  const closeBtn = document.getElementById("popup-close");
  const form = document.getElementById("create-task-form");
  const popup = document.getElementById("create-task-popup");

  if (createBtn) {
    createBtn.addEventListener("click", openCreateTaskPopup);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeCreateTaskPopup);
  }

  if (popup) {
    popup.addEventListener("click", (e) => {
      if (e.target === popup) closeCreateTaskPopup();
    });
  }

  if (form) {
    form.addEventListener("submit", createTask);
  }
}

/* ----------------------------------------------------------
   Open Create Task Popup
----------------------------------------------------------- */
function openCreateTaskPopup() {
  const popup = document.getElementById("create-task-popup");
  const roomInput = document.getElementById("task-room");

  if (roomInput && activeRoomNumber) {
    roomInput.value = activeRoomNumber;
  }

  // Clear other fields
  document.getElementById("task-title").value = "";
  document.getElementById("task-department").value = "";
  document.getElementById("task-notes").value = "";

  popup.classList.add("active");
}

/* ----------------------------------------------------------
   Close Create Task Popup
----------------------------------------------------------- */
function closeCreateTaskPopup() {
  const popup = document.getElementById("create-task-popup");
  popup.classList.remove("active");
}

/* ----------------------------------------------------------
   Create Task via API
----------------------------------------------------------- */
async function createTask(e) {
  e.preventDefault();

  const room = document.getElementById("task-room").value;
  const title = document.getElementById("task-title").value.trim();
  const department = document.getElementById("task-department").value;
  const notes = document.getElementById("task-notes").value.trim();

  if (!room || !title || !department) {
    alert("Please fill in all required fields.");
    return;
  }

  const payload = {
    room_number: room,
    request_type: title,
    assigned_department: department,
    internal_notes: notes || null,
    status: "open",
    priority: "Normal",
    opening_channel: "backoffice"
  };

  console.log("Creating task with payload:", payload);
  console.log("Notes value:", notes);

  try {
    const res = await fetch(`${API_BASE}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error("Failed to create task");
    }

    const result = await res.json();
    console.log("Task created:", result);

    closeCreateTaskPopup();
    showSuccessModal(`Task #${result.task_id || result.id} created successfully!`);

  } catch (err) {
    console.error("Failed to create task:", err);
    showSuccessModal("Failed to create task. Please try again.");
  }
}

/* ----------------------------------------------------------
   Success Modal
----------------------------------------------------------- */
function showSuccessModal(message) {
  const modal = document.getElementById("success-modal");
  const messageEl = document.getElementById("modal-message");
  
  messageEl.textContent = message;
  modal.classList.add("active");
}

function closeSuccessModal() {
  const modal = document.getElementById("success-modal");
  modal.classList.remove("active");
}

// Setup modal close button
document.addEventListener("DOMContentLoaded", () => {
  const modalOkBtn = document.getElementById("modal-ok-btn");
  if (modalOkBtn) {
    modalOkBtn.addEventListener("click", closeSuccessModal);
  }
});
