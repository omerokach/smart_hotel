// messages.js
let lastConversations = [];

const API_BASE = "https://smart-hotel-tasks-api.onrender.com";

let activeTaskId = null;
let pollingInterval = null;

// Load conversations on page load
document.addEventListener("DOMContentLoaded", () => {
  loadConversations();
  setupSendButton();

  // Poll for new conversations
  setInterval(loadConversations, 3000);
});

/* ----------------------------------------------------------
   Load list of open conversations (tasks with escalation=true)
----------------------------------------------------------- */
async function loadConversations() {
  const listEl = document.getElementById("conversations-list");

  try {
    const res = await fetch(`${API_BASE}/api/tasks?escalation=true`);
    const data = await res.json();
    const tasks = data.tasks;

    if (!Array.isArray(tasks)) return;

    // Check if list changed
    const changed = JSON.stringify(tasks) !== JSON.stringify(lastConversations);
    if (!changed) return; // No update → don't re-render

    lastConversations = tasks;

    listEl.innerHTML = "";

    tasks.forEach(task => {
      const item = document.createElement("div");
      item.classList.add("conversation-item");
      item.dataset.taskId = task.task_id;

      item.innerHTML = `
        <div class="conversation-room">Room ${task.room_number}</div>
        <div class="conversation-meta">Task #${task.task_id}</div>
      `;

      item.addEventListener("click", () => selectConversation(task));

      listEl.appendChild(item);
    });

    highlightActiveConversation(activeTaskId);

  } catch (err) {
    console.error("Failed loading tasks:", err);
  }
}

/* ----------------------------------------------------------
   Select a conversation & load chat messages
----------------------------------------------------------- */
function selectConversation(task) {
  activeTaskId = task.task_id;

  document.getElementById("messages-client-name").textContent =
    `Room ${task.room_number}`;
  document.getElementById("messages-status").textContent = "";

  document.getElementById("messages-input").disabled = false;
  document.getElementById("send-btn").disabled = false;

  loadMessages(activeTaskId);

  if (pollingInterval) clearInterval(pollingInterval);

  pollingInterval = setInterval(() => {
    loadMessages(activeTaskId, true);
  }, 3000);

  highlightActiveConversation(task.task_id);
}

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

    box.innerHTML = "";

    messages.forEach(msg => {
      const div = document.createElement("div");
      div.classList.add("msg");
      div.classList.add(msg.sender === "staff" ? "msg-staff" : "msg-client");

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
function setupSendButton() {
  document.getElementById("send-btn").addEventListener("click", sendMessage);
  document.getElementById("messages-input").addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });
}

async function sendMessage() {
  const input = document.getElementById("messages-input");
  const text = input.value.trim();

  if (!text || !activeTaskId) return;

  const payload = {
    sender: "staff",
    message: text
  };

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
   Helpers
----------------------------------------------------------- */
function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
