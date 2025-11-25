// messages.js
const API_BASE = "https://smart-hotel-tasks-api.onrender.com";

let activeTaskId = null;
let pollingMessages = null;

let lastSeenTimestamp = {};   // { taskId: timestamp }
let taskLastMessage = {};     // { taskId: timestamp }

/* ----------------------------------------------------------
   Load page
----------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  loadConversations();
  setupSendButton();

  // Refresh conversation list continuously
  setInterval(loadConversations, 3000);
});

/* ----------------------------------------------------------
   Load list of conversations
----------------------------------------------------------- */
async function loadConversations() {
  const listEl = document.getElementById("conversations-list");

  try {
    const res = await fetch(`${API_BASE}/api/tasks?escalation=true`);
    const data = await res.json();
    const tasks = data.tasks;

    if (!Array.isArray(tasks)) return;

    // Filter out closed tasks
    const openTasks = tasks.filter(t => t.status !== "closed");

    // Always re-render (otherwise new ones לא יופיעו)
    listEl.innerHTML = "";

    openTasks.forEach(task => {
      const item = document.createElement("div");
      item.classList.add("conversation-item");
      item.dataset.taskId = task.task_id;

      // Save latest msg timestamp from API (if provided)
      if (task.last_message_time) {
        taskLastMessage[task.task_id] = task.last_message_time;
      }

      item.innerHTML = `
        <div class="conversation-room">Room ${task.room_number}</div>
        <div class="conversation-meta">Task #${task.task_id}</div>
      `;

      // NEW badge logic
      const lastSeen = lastSeenTimestamp[task.task_id];
      const newest = taskLastMessage[task.task_id];
      const isNew = newest && (!lastSeen || newest > lastSeen);

      if (isNew) {
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
  document.getElementById("messages-input").disabled = false;
  document.getElementById("send-btn").disabled = false;

  loadMessages(activeTaskId);

  if (pollingMessages) clearInterval(pollingMessages);
  pollingMessages = setInterval(() => loadMessages(activeTaskId, true), 2000);

  highlightActiveConversation(task.task_id);

  // Mark NEW as seen — remove from memory
  lastSeenTimestamp[task.task_id] = new Date().toISOString();
  delete taskLastMessage[task.task_id]; 
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

    // Save latest timestamp
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
   Helpers
----------------------------------------------------------- */
function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
