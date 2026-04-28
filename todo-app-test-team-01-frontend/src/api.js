// API client for talking to the backend.
// One method is already implemented as a reference pattern.

const API_BASE = 'http://localhost:3001';

function getAuthToken() {
  return localStorage.getItem('authToken') || '';
}

function getAuthHeaders(includeJson = false) {
  const token = getAuthToken();
  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ============================================================
// ✅ Already implemented as a reference pattern
// ============================================================
export async function fetchTodos() {
  const res = await fetch(`${API_BASE}/todos`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Failed to fetch todos'));
  }
  return res.json();
}

async function readErrorMessage(res, fallback) {
  try {
    const data = await res.json();
    if (data && typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }
  } catch {
    // ignore JSON parsing errors
  }
  return fallback;
}

// ============================================================
// 🔨 TODO: Implement this — call POST /todos with the title
// Should return the created todo
// ============================================================
export async function createTodo(payload) {
  const res = await fetch(`${API_BASE}/todos`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Failed to create todo'));
  }

  return res.json();
}

// ============================================================
// 🔨 TODO: Implement this — call PATCH /todos/:id with updates
// Updates can include { title } or { completed }
// Should return the updated todo
// ============================================================
export async function updateTodo(id, updates) {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(true),
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Failed to update todo'));
  }

  return res.json();
}

// ============================================================
// 🔨 TODO: Implement this — call DELETE /todos/:id
// Returns nothing on success
// ============================================================
export async function deleteTodo(id) {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Failed to delete todo'));
  }
}

export async function signupUser({ username, password, role }) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Failed to sign up'));
  }
  return res.json();
}

export async function loginUser({ username, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Failed to login'));
  }
  return res.json();
}

export async function fetchMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Failed to fetch current user'));
  }
  return res.json();
}

export async function logoutUser() {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Failed to logout'));
  }
}
