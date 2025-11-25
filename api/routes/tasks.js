// routes/tasks.js
const express = require('express');
const { supabase } = require('../supabaseClient');

const router = express.Router();

const TABLE_NAME = 'task';

const ALLOWED_SORT_FIELDS = [
  'task_id',
  'room_number',
  'status',
  'priority',
  'assigned_department',
  'created_at',
  'updated_at',
  'closed_at'
];

function parseCsvParam(value) {
  if (!value || typeof value !== 'string') return null;
  const items = value
    .split(',')
    .map(v => v.trim())
    .filter(v => v.length > 0);
  return items.length ? items : null;
}

/* =====================================================================
   Messages API
   ===================================================================== */

/* 
 * GET /api/tasks/:task_id/messages
 * Returns all messages associated with a specific task
 */
router.get('/:task_id/messages', async (req, res) => {
  const taskId = Number(req.params.task_id);

  if (Number.isNaN(taskId)) {
    return res.status(400).json({ error: 'task_id must be a number' });
  }

  try {
    const { data, error } = await supabase
      .from('TaskMessages')
      .select('*')
      .eq('task_id', taskId)
      .order('timestamp', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

/*
 * POST /api/tasks/:task_id/messages
 * Adds a new message to the task
 */
router.post('/:task_id/messages', async (req, res) => {
  const taskId = Number(req.params.task_id);
  const { sender, message } = req.body;

  if (Number.isNaN(taskId)) {
    return res.status(400).json({ error: 'task_id must be a number' });
  }

  if (!sender || !message) {
    return res.status(400).json({ error: 'sender and message are required' });
  }

  try {
    const { data, error } = await supabase
      .from('TaskMessages')
      .insert([
        {
          task_id: taskId,
          sender,
          message,
          timestamp: new Date().toISOString()
        }
      ])
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create message' });
    }

    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

/* =====================================================================
   Tasks API 
   ===================================================================== */

/*
 * GET /api/tasks
 * Supports filters, search, sorting and pagination
 */
router.get('/', async (req, res) => {
  try {
    const {
      status,
      assigned_department,
      priority,
      room_number,
      request_type,
      status_in,
      priority_in,
      assigned_department_in,
      assigned_employee_id,
      unassigned,
      is_open,
      is_closed,
      created_from,
      created_to,
      updated_from,
      updated_to,
      closed_from,
      closed_to,
      search,
      sort_by = 'task_id',
      sort_dir = 'asc',
      limit = 100,
      offset = 0
    } = req.query;

    const parsedLimit = Number(limit);
    const parsedOffset = Number(offset);

    let query = supabase.from(TABLE_NAME).select('*', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (assigned_department) query = query.eq('assigned_department', assigned_department);
    if (priority) query = query.eq('priority', priority);
    if (room_number) query = query.eq('room_number', room_number);
    if (request_type) query = query.eq('request_type', request_type);

    const statusIn = parseCsvParam(status_in);
    if (statusIn) query = query.in('status', statusIn);

    const priorityIn = parseCsvParam(priority_in);
    if (priorityIn) query = query.in('priority', priorityIn);

    const deptIn = parseCsvParam(assigned_department_in);
    if (deptIn) query = query.in('assigned_department', deptIn);

    if (assigned_employee_id) query = query.eq('assigned_employee_id', assigned_employee_id);
    if (unassigned === 'true') query = query.is('assigned_employee_id', null);

    const hasExplicitStatus = status || statusIn;

    if (!hasExplicitStatus && is_open === 'true') {
      query = query.in('status', ['open', 'in_progress']);
    }

    if (!hasExplicitStatus && is_closed === 'true') {
      query = query.eq('status', 'done');
    }

    if (created_from) query = query.gte('created_at', created_from);
    if (created_to) query = query.lte('created_at', created_to);
    if (updated_from) query = query.gte('updated_at', updated_from);
    if (updated_to) query = query.lte('updated_at', updated_to);
    if (closed_from) query = query.gte('closed_at', closed_from);
    if (closed_to) query = query.lte('closed_at', closed_to);

    if (search) {
      const term = `%${search}%`;
      query = query.or(
        `request_details.ilike.${term},room_number.ilike.${term},request_type.ilike.${term}`
      );
    }

    const sortField = ALLOWED_SORT_FIELDS.includes(sort_by)
      ? sort_by
      : 'task_id';

    const sortAsc = String(sort_dir).toLowerCase() !== 'desc';

    query = query
      .order(sortField, { ascending: sortAsc })
      .range(parsedOffset, parsedOffset + parsedLimit - 1);

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }

    return res.json({ tasks: data, total: count });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

/*
 * GET /api/tasks/:task_id
 * Fetches a single task by ID
 */
router.get('/:task_id', async (req, res) => {
  try {
    const taskId = Number(req.params.task_id);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ error: 'task_id must be a number' });
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('task_id', taskId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

/*
 * POST /api/tasks
 * Creates new task
 */
router.post('/', async (req, res) => {
  try {
    const {
      room_number,
      request_type,
      assigned_department,
      internal_notes,
      status = 'open',
      priority = 'Normal',
      assigned_employee_id = null,
      request_details = null,
      opening_channel = null,
      created_at = null,
      updated_at = null,
      closed_at = null
    } = req.body;

    if (!room_number || !request_type || !assigned_department) {
      return res.status(400).json({
        error: 'room_number, request_type and assigned_department are required'
      });
    }

    const payload = {
      room_number,
      request_type,
      assigned_department,
      internal_notes,
      status,
      priority,
      assigned_employee_id,
      request_details,
      opening_channel,
      created_at,
      updated_at,
      closed_at
    };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([payload])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create task' });
    }

    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

/*
 * PATCH /api/tasks/:task_id
 * Updates fields for an existing task
 */
router.patch('/:task_id', async (req, res) => {
  try {
    const taskId = Number(req.params.task_id);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ error: 'task_id must be a number' });
    }

    const {
      room_number,
      request_type,
      assigned_department,
      status,
      priority,
      assigned_employee_id,
      request_details,
      opening_channel,
      closed_at,
      internal_notes
    } = req.body;

    const updatePayload = {};

    if (room_number !== undefined) updatePayload.room_number = room_number;
    if (request_type !== undefined) updatePayload.request_type = request_type;
    if (assigned_department !== undefined) updatePayload.assigned_department = assigned_department;
    if (internal_notes !== undefined) updatePayload.internal_notes = internal_notes;
    if (status !== undefined) updatePayload.status = status;
    if (priority !== undefined) updatePayload.priority = priority;
    if (assigned_employee_id !== undefined) updatePayload.assigned_employee_id = assigned_employee_id;
    if (request_details !== undefined) updatePayload.request_details = request_details;
    if (opening_channel !== undefined) updatePayload.opening_channel = opening_channel;
    if (closed_at !== undefined) updatePayload.closed_at = closed_at;

    updatePayload.updated_at = new Date().toISOString();

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updatePayload)
      .eq('task_id', taskId)
      .select()
      .single();

    if (error || !data) {
      return res.status(500).json({ error: 'Failed to update task' });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

/*
 * DELETE /api/tasks/:task_id
 * Deletes a task
 */
router.delete('/:task_id', async (req, res) => {
  try {
    const taskId = Number(req.params.task_id);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ error: 'task_id must be a number' });
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('task_id', taskId);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete task' });
    }

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

module.exports = router;
