// routes/tasks.js
const express = require('express');
const { supabase } = require('../supabaseClient');

const router = express.Router();

/**
 * GET /api/tasks
 * ?status=...&assignedTo=...&limit=...&offset=...
 */
router.get('/', async (req, res) => {
  try {
    const { status, assignedTo, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('task')
      .select('*', { count: 'exact' })
      .range(Number(offset), Number(offset) + Number(limit) - 1)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching task:', error);
      return res.status(500).json({ error: 'Failed to fetch task' });
    }

    res.json({ tasks: data, total: count });
  } catch (err) {
    console.error('Unexpected error in GET /task:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

/**
 * GET /api/task/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('task')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Task not found:', error);
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('Unexpected error in GET /task/:id:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

/**
 * POST /api/tasks
 * body: { title, description, status, priority, hotel_id, guest_id, due_at, assigned_to }
 */
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      status = 'pending',
      priority = 3,
      hotel_id,
      guest_id,
      due_at,
      assigned_to
    } = req.body;

    if (!title || !hotel_id) {
      return res.status(400).json({ error: 'title and hotel_id are required' });
    }

    const { data, error } = await supabase
      .from('task')
      .insert([
        {
          title,
          description,
          status,
          priority,
          hotel_id,
          guest_id,
          due_at,
          assigned_to
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({ error: 'Failed to create task' });
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Unexpected error in POST /tasks:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

/**
 * PATCH /api/tasks/:id
 * body: שדות לעדכון (status, description, assigned_to, וכו')
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // כאן אפשר לסנן שדות שמותר לעדכן (אם תרצה אבטחה חזקה יותר)

    const { data, error } = await supabase
      .from('task')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating task:', error);
      return res.status(500).json({ error: 'Failed to update task' });
    }

    res.json(data);
  } catch (err) {
    console.error('Unexpected error in PATCH /tasks/:id:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

/**
 * DELETE /api/tasks/:id
 * (אם תרצה soft delete – תשנה פה ל-update status)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('task')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({ error: 'Failed to delete task' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Unexpected error in DELETE /tasks/:id:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

module.exports = router;
