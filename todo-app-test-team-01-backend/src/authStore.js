const crypto = require('crypto');

const users = [];
const sessions = new Map();
let nextUserId = 1;

function normalizeEmail(email) {
  if (typeof email !== 'string') return null;
  const normalized = email.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function normalizePassword(password) {
  if (typeof password !== 'string') return null;
  const trimmed = password.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  if (typeof storedPassword !== 'string') return false;
  const [salt, expectedHash] = storedPassword.split(':');
  if (!salt || !expectedHash) return false;

  const actualHash = crypto.scryptSync(password, salt, 64).toString('hex');
  const actualBuffer = Buffer.from(actualHash, 'hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');

  if (actualBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function issueToken(userId) {
  const token = crypto.randomUUID();
  sessions.set(token, {
    userId,
    createdAt: new Date().toISOString(),
  });
  return token;
}

function findUserByEmail(email) {
  return users.find((user) => user.email === email) || null;
}

function register({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    const error = new Error('Email is required');
    error.status = 400;
    throw error;
  }
  if (!validateEmail(normalizedEmail)) {
    const error = new Error('Email must be valid');
    error.status = 400;
    throw error;
  }

  const normalizedPassword = normalizePassword(password);
  if (!normalizedPassword) {
    const error = new Error('Password is required');
    error.status = 400;
    throw error;
  }
  if (normalizedPassword.length < 8) {
    const error = new Error('Password must be at least 8 characters');
    error.status = 400;
    throw error;
  }

  if (findUserByEmail(normalizedEmail)) {
    const error = new Error('Email is already registered');
    error.status = 409;
    throw error;
  }

  const user = {
    id: nextUserId++,
    email: normalizedEmail,
    passwordHash: hashPassword(normalizedPassword),
    createdAt: new Date().toISOString(),
  };

  users.push(user);

  return {
    user: publicUser(user),
    token: issueToken(user.id),
  };
}

function login({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    const error = new Error('Email is required');
    error.status = 400;
    throw error;
  }

  const normalizedPassword = normalizePassword(password);
  if (!normalizedPassword) {
    const error = new Error('Password is required');
    error.status = 400;
    throw error;
  }

  const user = findUserByEmail(normalizedEmail);
  if (!user || !verifyPassword(normalizedPassword, user.passwordHash)) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  return {
    user: publicUser(user),
    token: issueToken(user.id),
  };
}

module.exports = {
  register,
  login,
};


