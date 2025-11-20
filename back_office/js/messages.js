const btn = document.getElementById("send-btn");
const input = document.getElementById("messages-input");
const messagesBox = document.getElementById("messages-box");

btn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const msg = document.createElement("div");
  msg.className = "msg msg-staff";

  msg.innerHTML = `
    <p>${text}</p>
    <span>${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
  `;

  messagesBox.appendChild(msg);

  input.value = "";
  messagesBox.scrollTop = messagesBox.scrollHeight;
}
