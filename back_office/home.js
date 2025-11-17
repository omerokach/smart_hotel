document.addEventListener("DOMContentLoaded", () => {
  loadRoomStats();
});

/* ========= טוען את החדרים מה-API ========= */
async function loadRoomStats() {
  try {
    const res = await fetch("https://smart-hotel-tasks-api.onrender.com/api/rooms");
    const rooms = await res.json();

    console.log("Rooms loaded:", rooms);

    let occupied = 0;
    let available = 0;

    rooms.forEach(room => {
      const status = room.room_status ? room.room_status.toLowerCase() : "available";

      if (status === "occupied") {
        occupied++;
      } else {
        available++;
      }
    });

    drawOccupancyChart({ occupied, available });

  } catch (err) {
    console.error("Error loading room stats:", err);
  }
}


/* ========= מצייר גרף Chart.js ========= */
function drawOccupancyChart(counts) {
  const ctx = document.getElementById("occupancyChart").getContext("2d");

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Occupied", "Available"],
      datasets: [{
        data: [counts.occupied, counts.available],
        backgroundColor: [
          "#3A47D5", // Occupied — כחול כהה
          "#A6D6A9"  // Available — ירוק בהיר ונקי
        ],
        borderWidth: 0
      }]
    },
    options: {
      cutout: "60%",
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: { font: { size: 14 } }
        }
      }
    }
  });
}
