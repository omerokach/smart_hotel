const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// בדיקה שהשרת עובד
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Concierge API is running' });
});

// דוגמה — תוסיפי פה ראוטים אמיתיים אחר כך
app.get('/hello', (req, res) => {
  res.json({ msg: "Server is alive" });
});

// הפעלה
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
