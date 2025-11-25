// messages.js
const API_BASE = "https://smart-hotel-tasks-api.onrender.com";

let activeTaskId = null;
let pollingMessages = null;
let lastSeenTimestamp = {};   // { taskId: timestamp }
let taskLastMessage = {};     // { taskId: timestamp }

// Load conversations + start polling
document.addEventListener("DOMContentLoaded", () => {
  loadConversations();
  setupSendButton();

  // Poll for NEW conversations & updates
  setInterval(loadConversations, 3000);
});

/* ----------------------------------------------------------
   Load list of conversations (escalation only)
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

    // Detect if there was any change
    if (JSON.stringify(openTasks) === JSON.stringify(lastConversations)) {
      return; // No changes → no re-render
    }

    // Save new list
    lastConversations = openTasks;

    // Clear UI and rebuild
    listEl.innerHTML = "";

    openTasks.forEach(task => {
      const item = document.createElement("div");
      item.classList.add("conversation-item");
      item.dataset.taskId = task.task_id;

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

  // Mark as seen
  lastSeenTimestamp[task.task_id] = new Date().toISOString();
}

/* ----------------------------------------------------------
   Highlight selected chat
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

    // Save latest message timestamp
    if (messages.length > 0) {
      const latest = messages[messages.length - 1].timestamp;
      taskLastMessage[taskId] = latest;
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
