document.addEventListener("DOMContentLoaded", () => {
  loadRooms();
});

async function loadRooms() {
  showLoader(); // 👈 מפעיל לואדר גלובלי

  try {
    const res = await fetch("https://smart-hotel-tasks-api.onrender.com/api/rooms");
    const rooms = await res.json();

    console.log("Loaded rooms:", rooms);
    renderRooms(rooms);

  } catch (err) {
    console.error("Error loading rooms:", err);
  }

  hideLoader(); // 👈 מכבה לואדר
}

function renderRooms(rooms) {
  const tbody = document.querySelector("table tbody");

  tbody.innerHTML = "";

  rooms.forEach(room => {
    tbody.innerHTML += `
      <tr>
        <td>${room.room_number}</td>
        <td>${room.room_type || "N/A"}</td>
        <td>
          <span class="room-status ${mapRoomStatus(room.room_status)}">
            ${formatRoomStatus(room.room_status)}
          </span>
        </td>
      </tr>
    `;
  });
}



function mapRoomStatus(status) {
  if (!status) return "ready";

  switch (status.toLowerCase()) {
    case "ready":
    case "available":
    case "vacant":
      return "ready";
    case "dirty":
      return "dirty";
    case "maintenance":
      return "maintenance";
    case "occupied":
      return "occupied";
    default:
      return "ready";
  }
}



function formatRoomStatus(status) {
  if (!status) return "-";
  return status.charAt(0).toUpperCase() + status.slice(1);
}
