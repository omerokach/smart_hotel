const ctx = document.getElementById('occupancyChart');

const occupied = 34;  // חדרים תפוסים
const total = 40;     // סה"כ חדרים
const available = total - occupied;
const percent = Math.round((occupied / total) * 100);

new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Occupied', 'Available'],
    datasets: [{
      data: [occupied, available],
      backgroundColor: ['#116DFF', '#E9EEFF'],
      borderWidth: 0
    }]
  },
  options: {
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    }
  },
  plugins: [{
  id: 'centerText',
  afterDraw(chart) {
    const { ctx, chartArea: { width, height } } = chart;
    ctx.save();
    ctx.font = 'bold 16px "Wix Madefor Text"';
    ctx.fillStyle = '#000624';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${percent}%`, width / 2, height / 2 - 5);
    ctx.font = '12px "Wix Madefor Text"';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText(`(${occupied}/${total})`, width / 2, height / 2 + 14);
  }
}]

});

// הוספת מקרא מותאם אישית מתחת לגרף
document.querySelector('#occupancyChart').insertAdjacentHTML(
  'afterend',
  `
  <div class="chart-legend">
    <div><span class="dot blue"></span> Occupied Rooms: <strong>${occupied}</strong></div>
    <div><span class="dot light"></span> Available Rooms: <strong>${available}</strong></div>
  </div>
  `
);
