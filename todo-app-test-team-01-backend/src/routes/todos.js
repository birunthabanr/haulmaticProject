const express = require('express');
const store = require('../store');

const router = express.Router();

// ============================================================
// GET /todos — List all todos
// ✅ Already implemented as a reference pattern
// ============================================================
router.get('/', (req, res) => {
  const todos = store.getAll();
  res.json(todos);
});

module.exports = router;
