// ===============================
// Guest Authentication Logic
// ===============================

// Get form and message elements
const form = document.getElementById("guest-auth-form");
const messageEl = document.getElementById("auth-message");

// Helpers
function clearMessage() {
  messageEl.textContent = "";
  messageEl.className = "auth-message";
}

function showErrorBubble(text = "Error") {
  const bubble = document.getElementById("error-bubble");
  if (!bubble) return;

  bubble.querySelector(".bubble-text").textContent = text;
  bubble.classList.add("show");

  setTimeout(() => {
    bubble.classList.remove("show");
  }, 4000);
}

function showSuccessBubble(text = "Success") {
  const bubble = document.getElementById("success-bubble");
  if (!bubble) return;

  bubble.querySelector(".bubble-text").textContent = text;
  bubble.classList.add("show");

  setTimeout(() => {
    bubble.classList.remove("show");
  }, 1300);
}


// Submit Listener
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage();

    const room = document.getElementById("room_number").value.trim();
    const phone = document.getElementById("phone_number").value.trim();

    if (!room || !phone) {
      showErrorBubble("Please fill in both fields.");
      return;
    }

    const submitBtn = form.querySelector(".auth-button");
    if (submitBtn) submitBtn.disabled = true;

    try {
      const response = await fetch(
        "https://smart-hotel-tasks-api.onrender.com/api/reservations/verify-guest",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_number: room,
            phone_number: phone
          })
        }
      );

      let result;
      try {
        result = await response.json();
      } catch {
        showErrorBubble("Unexpected server response. Please try again.");
        return;
      }

      if (!response.ok || !result.success) {
        showErrorBubble(result.message || "Room or phone number not found. Please try again.");
        return;
      }

      // SUCCESS
      showSuccessBubble("Authentication successful");

      // SAVE DETAILS → LocalStorage
      console.log("API RESULT:", result);
      localStorage.setItem("guest_room_number", result.room_number);
      localStorage.setItem("guest_name", result.guest_full_name || "");

      // Debug logs
      console.log("Saved room:", localStorage.getItem("guest_room_number"));
      console.log("Saved name:", localStorage.getItem("guest_name"));

      setTimeout(() => {
        window.location.href = "/concierge.html";
      }, 900);

    } catch (err) {
      console.error("Auth request error:", err);
      showErrorBubble("Server error. Please try again.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
