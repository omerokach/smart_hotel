// routes/rooms.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');

// CRITICAL FIX: The table name in Supabase is 'Room' (Title Case)
// It must match the case exactly to avoid fetching an empty set.
const TABLE_NAME = 'Room';

// GET /api/rooms - get all rooms
router.get('/', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME) // Using 'Room'
        .select('*');
  
      if (error) {
        console.error('Error fetching rooms:', error);
        return res.status(500).json({ error: error.message });
      }
  
      return res.json(data);
    } catch (err) {
      console.error('Unexpected error in GET /api/rooms:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

// GET /api/rooms/:room_number - get a specific room by room_number
router.get('/:room_number', async (req, res) => {
  const roomNumber = parseInt(req.params.room_number, 10);

  if (Number.isNaN(roomNumber)) {
    return res.status(400).json({ error: 'room_number must be a number' });
  }

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME) // Using 'Room'
      .select('*')
      .eq('room_number', roomNumber)
      .single();

    if (error) {
      console.error('Error fetching room:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Room not found' });
    }

    return res.json(data);
  } catch (err) {
    console.error('Unexpected error in GET /api/rooms/:room_number:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/rooms/:room_number - update room status/flags/dates
router.patch('/:room_number', async (req, res) => {
  const roomNumber = parseInt(req.params.room_number, 10);

  if (Number.isNaN(roomNumber)) {
    return res.status(400).json({ error: 'room_number must be a number' });
  }

  const {
    is_active,
    is_vacant,
    room_status,
    last_cleaned_at,
    last_maintenance_at,
  } = req.body;

  const fieldsToUpdate = {};

  if (typeof is_active === 'boolean') {
    fieldsToUpdate.is_active = is_active;
  }
  if (typeof is_vacant === 'boolean') {
    fieldsToUpdate.is_vacant = is_vacant;
  }
  if (typeof room_status === 'string') {
    fieldsToUpdate.room_status = room_status;
  }
  if (typeof last_cleaned_at === 'string') {
    fieldsToUpdate.last_cleaned_at = last_cleaned_at;
  }
  if (typeof last_maintenance_at === 'string') {
    fieldsToUpdate.last_maintenance_at = last_maintenance_at;
  }

  if (Object.keys(fieldsToUpdate).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME) // Using 'Room'
      .update(fieldsToUpdate)
      .eq('room_number', roomNumber)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating room:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error('Unexpected error in PATCH /api/rooms/:room_number:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;