// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { supabase } = require('./supabaseClient');
const tasksRouter = require('./routes/tasks');
const roomsRouter = require('./routes/rooms');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'tasks-api' });
});

// כל הראוטים של המשימות
app.use('/api/tasks', tasksRouter);
app.use('/api/rooms', roomsRouter);

// אם תרצה בהמשך endpoint אחד לבוט:
// app.post('/api/tasks/handle', handleTaskAction);

app.listen(PORT, () => {
  console.log(`Tasks API listening on port ${PORT}`);
});
