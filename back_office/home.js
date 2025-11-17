let lastTaskCount = null;

document.addEventListener("DOMContentLoaded", () => {
  loadRoomStats();
  loadPendingRequests();
  monitorNewTasks();               // בדיקה מיידית
  setInterval(monitorNewTasks, 5000); // כל 5 שניות
});

/* ========= טוען סטטוס חדרים לגרף ========= */
async function loadRoomStats() {
  try {
    const res = await fetch("https://smart-hotel-tasks-api.onrender.com/api/rooms");
    const rooms = await res.json();

    let occupied = 0;
    let available = 0;

    rooms.forEach(room => {
      const status = room.room_status ? room.room_status.toLowerCase() : "available";
      if (status === "occupied") occupied++;
      else available++;
    });

    drawOccupancyChart({ occupied, available });

  } catch (err) {
    console.error("Error loading room stats:", err);
  }
}

/* ========= מצייר גרף Chart.js ========= */
function drawOccupancyChart(counts) {
  const ctx = document.getElementById("occupancyChart").getContext("2d");

  // Plugin – מספר באמצע הגרף
  const centerTextPlugin = {
    id: "centerText",
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      const totalOccupied = chart.config.data.datasets[0].data[0];

      ctx.save();
      ctx.font = "600 28px 'Wix Madefor Text'";
      ctx.fillStyle = "#000624";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(totalOccupied, chartArea.width / 2, chartArea.height / 2);
      ctx.restore();
    }
  };

  new Chart(ctx, {
    type: "doughnut",
    plugins: [centerTextPlugin],
    data: {
      labels: ["Occupied", "Available"],
      datasets: [{
        data: [counts.occupied, counts.available],
        backgroundColor: [
          "#3A47D5", // Occupied
          "#A6D6A9"  // Available
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

/* ========= טוען מספר בקשות פתוחות ========= */
async function loadPendingRequests() {
  try {
    const res = await fetch("https://smart-hotel-tasks-api.onrender.com/api/tasks");
    const data = await res.json();

    // משימות פתוחות
    const pending = data.tasks.filter(t => t.status !== "done").length;

    document.querySelector(".big-number").textContent = pending;

    return pending;
  } catch (err) {
    console.error("Error loading pending requests:", err);
    return 0;
  }
}



let lastPendingCount = null;
let firstRun = true; // 👈 כדי שלא נקפיץ התראה בטעינה הראשונה

async function monitorNewTasks() {
  try {
    const res = await fetch("https://smart-hotel-tasks-api.onrender.com/api/tasks");
    const data = await res.json();

    const currentPending = data.tasks.filter(t => t.status !== "done").length;

    console.log("Monitoring → current:", currentPending, "last:", lastPendingCount);

    // דילוג על הריצה הראשונה כדי לא לקפוץ התראה סתם
    if (firstRun) {
      lastPendingCount = currentPending;
      firstRun = false;
      return;
    }

    // ✔ זיהוי משימה חדשה (pending עלה)
    if (currentPending > lastPendingCount) {
      showNewTaskToast();
    }

    // ✔ עדכון בכל מקרה
    document.querySelector(".big-number").textContent = currentPending;

    // ✔ שמירה לעתיד
    lastPendingCount = currentPending;

  } catch (err) {
    console.error("Error monitoring tasks:", err);
  }
}




/* ========= Toast ========= */
function showNewTaskToast() {
  const toast = document.getElementById("new-task-toast");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}
