// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { supabase } = require('./supabaseClient');
const tasksRouter = require('./routes/tasks');
const roomsRouter = require('./routes/rooms');
const reservationsRouter = require('./routes/reservations');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'tasks-api' });
});

// Primary API Routes:
app.use('/api/tasks', tasksRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/reservations', reservationsRouter);

// Potential future endpoint for bot interaction:
// app.post('/api/tasks/handle', handleTaskAction);

app.listen(PORT, () => {
  console.log(`Tasks API listening on port ${PORT}`);
});
