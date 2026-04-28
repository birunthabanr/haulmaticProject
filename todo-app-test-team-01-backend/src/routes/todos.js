const express = require('express');
const store = require('../store');
const { authenticate, authorize } = require('../auth');

const router = express.Router();

// Require auth for all /todos endpoints
router.use(authenticate);

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function normalizeAndValidateTitle(title) {
  if (typeof title !== 'string') return { ok: false, error: 'Title must be a string' };
  const trimmed = title.trim();
  if (trimmed.length < 1 || trimmed.length > 200) {
    return { ok: false, error: 'Title must be 1–200 characters' };
  }
  return { ok: true, value: trimmed };
}

function normalizeOptionalText(value, field) {
  if (value === undefined) return { ok: true, value: undefined };
  if (typeof value !== 'string') return { ok: false, error: `${field} must be a string` };
  if (value.length > 1000) return { ok: false, error: `${field} must be at most 1000 characters` };
  return { ok: true, value: value.trim() };
}

function normalizeAndValidateSubtasks(subtasks) {
  if (subtasks === undefined) return { ok: true, value: undefined };
  if (!Array.isArray(subtasks)) return { ok: false, error: 'Subtasks must be an array' };

  const normalized = [];
  for (const [index, subtask] of subtasks.entries()) {
    if (!subtask || typeof subtask !== 'object') {
      return { ok: false, error: `Subtask #${index + 1} is invalid` };
    }
    const text = String(subtask.text || '').trim();
    if (text.length < 1 || text.length > 200) {
      return { ok: false, error: `Subtask #${index + 1} text must be 1–200 characters` };
    }
    normalized.push({
      id: Number.isInteger(subtask.id) ? subtask.id : index + 1,
      text,
      completed: Boolean(subtask.completed),
    });
  }
  return { ok: true, value: normalized };
}

// ============================================================
// GET /todos — List all todos
// ✅ Already implemented as a reference pattern
// ============================================================
router.get('/', (req, res) => {
  const todos = store.getAll();
  res.json(todos);
});

// ============================================================
// POST /todos — Create a new todo
// ============================================================
router.post('/', (req, res) => {
  const { title, body, description, subtasks } = req.body || {};

  const validatedTitle = normalizeAndValidateTitle(title);
  if (!validatedTitle.ok) {
    return res.status(400).json({ error: validatedTitle.error });
  }
  const validatedBody = normalizeOptionalText(body, 'Body');
  if (!validatedBody.ok) return res.status(400).json({ error: validatedBody.error });
  const validatedDescription = normalizeOptionalText(description, 'Description');
  if (!validatedDescription.ok) return res.status(400).json({ error: validatedDescription.error });
  const validatedSubtasks = normalizeAndValidateSubtasks(subtasks);
  if (!validatedSubtasks.ok) return res.status(400).json({ error: validatedSubtasks.error });

  const created = store.create({
    title: validatedTitle.value,
    body: validatedBody.value || '',
    description: validatedDescription.value || '',
    subtasks: validatedSubtasks.value || [],
  });
  return res.status(201).json(created);
});

// ============================================================
// PATCH /todos/:id — Update todo (title and/or completed)
// ============================================================
router.patch('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });

  const body = req.body || {};
  const allowedKeys = new Set(['title', 'body', 'description', 'subtasks', 'completed']);
  const keys = Object.keys(body);
  if (keys.length === 0) {
    return res.status(400).json({ error: 'No updates provided' });
  }
  for (const key of keys) {
    if (!allowedKeys.has(key)) {
      return res.status(400).json({ error: `Unknown field: ${key}` });
    }
  }

  const updates = {};

  if (Object.prototype.hasOwnProperty.call(body, 'title')) {
    const validated = normalizeAndValidateTitle(body.title);
    if (!validated.ok) {
      return res.status(400).json({ error: validated.error });
    }
    updates.title = validated.value;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'completed')) {
    if (typeof body.completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean' });
    }
    updates.completed = body.completed;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'body')) {
    const validated = normalizeOptionalText(body.body, 'Body');
    if (!validated.ok) return res.status(400).json({ error: validated.error });
    updates.body = validated.value || '';
  }

  if (Object.prototype.hasOwnProperty.call(body, 'description')) {
    const validated = normalizeOptionalText(body.description, 'Description');
    if (!validated.ok) return res.status(400).json({ error: validated.error });
    updates.description = validated.value || '';
  }

  if (Object.prototype.hasOwnProperty.call(body, 'subtasks')) {
    const validated = normalizeAndValidateSubtasks(body.subtasks);
    if (!validated.ok) return res.status(400).json({ error: validated.error });
    updates.subtasks = validated.value;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid updates provided' });
  }

  const updated = store.update(id, updates);
  if (!updated) return res.status(404).json({ error: 'Todo not found' });
  return res.json(updated);
});

// ============================================================
// DELETE /todos/:id — Remove a todo
// ============================================================
router.delete('/:id', authorize(['admin']), (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });

  const removed = store.remove(id);
  if (!removed) return res.status(404).json({ error: 'Todo not found' });
  return res.status(204).send();
});

module.exports = router;
