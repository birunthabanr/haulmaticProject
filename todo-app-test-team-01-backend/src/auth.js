const crypto = require('crypto');

let nextUserId = 3;

// In-memory users for the exercise only.
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'user', password: 'user123', role: 'user' },
];

// token -> userId
const sessions = new Map();

function createToken() {
  return crypto.randomBytes(24).toString('hex');
}

function sanitizeUser(user) {
  return { id: user.id, username: user.username, role: user.role };
}

function findUserByUsername(username) {
  return users.find((u) => u.username.toLowerCase() === String(username).toLowerCase());
}

function signup({ username, password, role }) {
  const cleanUsername = String(username || '').trim();
  const cleanPassword = String(password || '');
  const cleanRole = role === 'admin' ? 'admin' : 'user';

  if (cleanUsername.length < 3 || cleanUsername.length > 30) {
    return { ok: false, error: 'Username must be 3–30 characters' };
  }
  if (cleanPassword.length < 4 || cleanPassword.length > 100) {
    return { ok: false, error: 'Password must be 4–100 characters' };
  }
  if (findUserByUsername(cleanUsername)) {
    return { ok: false, error: 'Username already exists' };
  }

  const user = {
    id: nextUserId++,
    username: cleanUsername,
    password: cleanPassword,
    role: cleanRole,
  };
  users.push(user);

  const token = createToken();
  sessions.set(token, user.id);
  return { ok: true, token, user: sanitizeUser(user) };
}

function login({ username, password }) {
  const user = findUserByUsername(username);
  if (!user || user.password !== password) {
    return { ok: false, error: 'Invalid username or password' };
  }

  const token = createToken();
  sessions.set(token, user.id);
  return { ok: true, token, user: sanitizeUser(user) };
}

function getTokenFromReq(req) {
  const authHeader = req.header('Authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  // Backward compatibility with previous header.
  return req.header('X-Auth-Token') || '';
}

function authenticate(req, res, next) {
  const token = getTokenFromReq(req);
  if (!token) return res.status(401).json({ error: 'Missing auth token' });

  const userId = sessions.get(token);
  if (!userId) return res.status(401).json({ error: 'Invalid auth token' });

  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ error: 'Invalid auth token' });

  req.auth = { token, user: sanitizeUser(user) };
  return next();
}

function authorize(allowedRoles) {
  const allowed = new Set(allowedRoles);
  return (req, res, next) => {
    const role = req.auth?.user?.role;
    if (!role) return res.status(401).json({ error: 'Unauthenticated' });
    if (!allowed.has(role)) return res.status(403).json({ error: 'Forbidden' });
    return next();
  };
}

function logout(token) {
  sessions.delete(token);
}

module.exports = {
  authenticate,
  authorize,
  login,
  logout,
  signup,
};

