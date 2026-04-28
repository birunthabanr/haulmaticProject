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
  const { title } = req.body || {};
  const validated = normalizeAndValidateTitle(title);
  if (!validated.ok) {
    return res.status(400).json({ error: validated.error });
  }

  const created = store.create(validated.value);
  return res.status(201).json(created);
});

// ============================================================
// PATCH /todos/:id — Update todo (title and/or completed)
// ============================================================
router.patch('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });

  const body = req.body || {};
  const allowedKeys = new Set(['title', 'completed']);
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
