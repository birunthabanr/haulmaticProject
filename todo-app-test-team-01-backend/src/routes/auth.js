const express = require('express');
const { authenticate, login, logout, signup } = require('../auth');

const router = express.Router();

router.post('/signup', (req, res) => {
  const { username, password, role } = req.body || {};
  const result = signup({ username, password, role });
  if (!result.ok) return res.status(400).json({ error: result.error });
  return res.status(201).json({ token: result.token, user: result.user });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const result = login({ username, password });
  if (!result.ok) return res.status(401).json({ error: result.error });
  return res.json({ token: result.token, user: result.user });
});

router.get('/me', authenticate, (req, res) => {
  return res.json({ user: req.auth.user });
});

router.post('/logout', authenticate, (req, res) => {
  logout(req.auth.token);
  return res.status(204).send();
});

module.exports = router;

