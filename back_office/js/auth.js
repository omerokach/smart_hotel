// ===============================
// Guest Authentication Logic
// ===============================

// Get form and message elements
const form = document.getElementById("guest-auth-form");
const messageEl = document.getElementById("auth-message");

// Helpers to manage message state
function clearMessage() {
  messageEl.textContent = "";
  messageEl.className = "auth-message";
}

function showError(text) {
  messageEl.textContent = text;
  messageEl.className = "auth-message error";
}

function showSuccess(text) {
  messageEl.textContent = text;
  messageEl.className = "auth-message success";
}

// Attach submit listener
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage();

    const room = document.getElementById("room_number").value.trim();
    const phone = document.getElementById("phone_number").value.trim();

    if (!room || !phone) {
      showError("Please fill in both fields.");
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
        showError("Unexpected server response. Please try again.");
        return;
      }

      if (!response.ok || !result.success) {
        showError(result.message || "Room or phone number not found. Please try again.");
        return;
      }

      // SUCCESS
      showSuccess("Authentication successful. Redirecting...");

      setTimeout(() => {
        window.location.href = "https://smart-hotel-concierge.onrender.com/";
      }, 900);

    } catch (err) {
      console.error("Auth request error:", err);
      showError("Server error. Please try again.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
