// API client for talking to the backend.
// One method is already implemented as a reference pattern.

const API_BASE = 'http://localhost:3003';

// ============================================================
// ✅ Already implemented as a reference pattern
// ============================================================
export async function fetchTodos() {
  const res = await fetch(`${API_BASE}/todos`);
  if (!res.ok) {
    throw new Error('Failed to fetch todos');
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
export async function createTodo(title) {
  const res = await fetch(`${API_BASE}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
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
    headers: { 'Content-Type': 'application/json' },
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
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Failed to delete todo'));
  }
}
