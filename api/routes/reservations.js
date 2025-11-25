// routes/reservations.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');

// Supabase table name
const TABLE_NAME = 'Reservation';

/* ---------------------------------------------------
   NORMALIZE PHONE NUMBER
--------------------------------------------------- */
function normalizePhone(phone) {
  if (!phone) return '';
  return phone
    .replace(/[^\d]/g, '')   // remove everything except digits
    .replace(/^0+/, '0');    // ensure only one leading zero
}

/* ---------------------------------------------------
   VERIFY GUEST (IMPORTANT: MUST COME BEFORE :reservation_id)
   POST /api/reservations/verify-guest
--------------------------------------------------- */
router.post('/verify-guest', async (req, res) => {
  try {
    const { room_number, phone_number } = req.body || {};

    if (!room_number || !phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Room number and phone number are required.'
      });
    }

    const normalizedPhone = normalizePhone(phone_number);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('reservation_id, room_number, phone_number, guest_full_name')
      .eq('room_number', room_number)
      .eq('phone_number', normalizedPhone)
      .maybeSingle();

    if (error) {
      console.error(`[DB ERROR - VERIFY GUEST ${TABLE_NAME}]`, error);
      return res.status(500).json({
        success: false,
        message: 'Server error. Please try again.'
      });
    }

    if (!data) {
      return res.status(401).json({
        success: false,
        message: 'Room or phone number not found. Please try again.'
      });
    }

    return res.json({
      success: true,
      guest_full_name: data.guest_full_name || null,
      room_number: data.room_number
    });

  } catch (err) {
    console.error('Unexpected error in POST /verify-guest:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.'
    });
  }
});

/* ---------------------------------------------------
   CREATE RESERVATION
   POST /api/reservations
--------------------------------------------------- */
router.post('/', async (req, res) => {
  const newReservation = req.body;

  if (!newReservation.guest_full_name ||
      !newReservation.check_in_date_plan ||
      !newReservation.check_out_date_plan) {
    return res.status(400).json({
      error: 'Missing required fields: guest_full_name, check_in_date_plan, and check_out_date_plan are mandatory.'
    });
  }

  if (newReservation.phone_number) {
    newReservation.phone_number = normalizePhone(newReservation.phone_number);
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

    return res.status(201).json(data);

  } catch (err) {
    console.error('Unexpected error in POST /api/reservations:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/* ---------------------------------------------------
   GET ALL RESERVATIONS
   GET /api/reservations
--------------------------------------------------- */
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

/* ---------------------------------------------------
   GET RESERVATION BY ID
   GET /api/reservations/:reservation_id
--------------------------------------------------- */
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

module.exports = router;
