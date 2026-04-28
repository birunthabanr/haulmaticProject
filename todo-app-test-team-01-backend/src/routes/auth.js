const express = require('express');
const authStore = require('../authStore');

const router = express.Router();

function getErrorStatus(error) {
  return Number.isInteger(error?.status) ? error.status : 500;
}

function handleAuthError(res, error) {
  return res.status(getErrorStatus(error)).json({ error: error.message || 'Authentication failed' });
}

router.post('/register', (req, res) => {
  try {
    const result = authStore.register(req.body || {});
    return res.status(201).json(result);
  } catch (error) {
    return handleAuthError(res, error);
  }
});

router.post('/login', (req, res) => {
  try {
    const result = authStore.login(req.body || {});
    return res.json(result);
  } catch (error) {
    return handleAuthError(res, error);
  }
});

module.exports = router;

