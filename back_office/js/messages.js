// messages.js
const API_BASE = "https://smart-hotel-tasks-api.onrender.com";

let activeTaskId = null;
let pollingMessages = null;

let lastSeenTimestamp = {};   // { taskId: timestamp }
let taskLastMessage = {};     // { taskId: timestamp }

/* ----------------------------------------------------------
   On page load
----------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  loadConversations();
  setupSendButton();

  // Refresh every 3 seconds
  setInterval(loadConversations, 3000);
});

/* ----------------------------------------------------------
   Load list of conversations
----------------------------------------------------------- */
async function loadConversations() {
  const listEl = document.getElementById("conversations-list");
  if (!listEl) return;

  try {
    const res = await fetch(`${API_BASE}/api/tasks?escalation=true`);
    const data = await res.json();
    const tasks = data.tasks;

    if (!Array.isArray(tasks)) return;

    // Keep only open tasks
    const openTasks = tasks.filter(t => t.status !== "closed");

    // Always re-render (פשוט, יציב, עובד תמיד)
    listEl.innerHTML = "";

    openTasks.forEach(task => {
      // Latest message timestamp (if provided from API)
      if (task.last_message_time) {
        taskLastMessage[task.task_id] = task.last_message_time;
      }

      const item = document.createElement("div");
      item.classList.add("conversation-item");
      item.dataset.taskId = task.task_id;

      item.innerHTML = `
        <div class="conversation-room">Room ${task.room_number}</div>
        <div class="conversation-meta">Task #${task.task_id}</div>
      `;

      // NEW badge
      const lastSeen = lastSeenTimestamp[task.task_id];
      const newest = taskLastMessage[task.task_id];

      if (newest && (!lastSeen || newest > lastSeen)) {
        const badge = document.createElement("div");
        badge.classList.add("new-badge");
        badge.textContent = "NEW";
        item.appendChild(badge);
      }

      item.addEventListener("click", () => selectConversation(task));

      listEl.appendChild(item);
    });

    highlightActiveConversation(activeTaskId);

  } catch (err) {
    console.error("Failed loading tasks:", err);
  }
}

/* ----------------------------------------------------------
   Select conversation
----------------------------------------------------------- */
function selectConversation(task) {
  activeTaskId = task.task_id;

  document.getElementById("messages-client-name").textContent =
    `Room ${task.room_number}`;

  // Enable chat
  document.getElementById("messages-input").disabled = false;
  document.getElementById("send-btn").disabled = false;

  loadMessages(activeTaskId);

  // Restart live polling
  if (pollingMessages) clearInterval(pollingMessages);
  pollingMessages = setInterval(() => loadMessages(activeTaskId, true), 2000);

  highlightActiveConversation(task.task_id);

  // Mark conversation as read
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
   Load messages for selected task
----------------------------------------------------------- */
async function loadMessages(taskId, silent = false) {
  if (!taskId) return;

  const box = document.getElementById("messages-box");

  if (!silent) box.innerHTML = "<p class='loading'>Loading...</p>";

  try {
    const res = await fetch(`${API_BASE}/api/tasks/${taskId}/messages`);
    const messages = await res.json();

    if (!Array.isArray(messages)) return;

    // Save newest message timestamp
    if (messages.length > 0) {
      taskLastMessage[taskId] = messages[messages.length - 1].timestamp;
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
   Setup send button and Enter key
----------------------------------------------------------- */
function setupSendButton() {
  document.getElementById("send-btn").addEventListener("click", sendMessage);

  document.getElementById("messages-input")
    .addEventListener("keypress", e => {
      if (e.key === "Enter") sendMessage();
    });
}

/* ----------------------------------------------------------
   Helpers
----------------------------------------------------------- */
function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
