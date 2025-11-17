// routes/reservations.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');

// The name of the reservation table in Supabase
const TABLE_NAME = 'Reservation';

// --- POST /api/reservations ---
// Create a new reservation
router.post('/', async (req, res) => {
  const newReservation = req.body;

  // Basic validation for required fields
  if (!newReservation.guest_full_name || !newReservation.check_in_date_plan || !newReservation.check_out_date_plan) {
    return res.status(400).json({ error: 'Missing required fields: guest_full_name, check_in_date_plan, and check_out_date_plan are mandatory.' });
  }

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([newReservation])
      .select('*')
      .single();

    if (error) {
      console.error(`[DB ERROR - POST ${TABLE_NAME}]`, error);
      return res.status(500).json({ error: error.message });
    }

    // Returns the newly created reservation object
    return res.status(201).json(data);
  } catch (err) {
    console.error('Unexpected error in POST /api/reservations:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// --- GET /api/reservations ---
// Retrieve all reservations
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*');

    if (error) {
      console.error(`[DB ERROR - GET ALL ${TABLE_NAME}]`, error);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error('Unexpected error in GET /api/reservations:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// --- GET /api/reservations/:reservation_id ---
// Retrieve a specific reservation by ID
router.get('/:reservation_id', async (req, res) => {
  const reservationId = parseInt(req.params.reservation_id, 10);

  if (Number.isNaN(reservationId)) {
    return res.status(400).json({ error: 'reservation_id must be a number' });
  }

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('reservation_id', reservationId)
      .single();

    if (error) {
      console.error(`[DB ERROR - GET ID ${TABLE_NAME}]`, error);
      // Supabase returns an error if .single() finds no rows, we treat this as 404
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: `Reservation with ID ${reservationId} not found` });
      }
      return res.status(500).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error('Unexpected error in GET /api/reservations/:reservation_id:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Note: PATCH/PUT endpoint for updating reservations can be added later if needed.

module.exports = router;