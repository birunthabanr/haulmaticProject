// API client for talking to the backend.
// One method is already implemented as a reference pattern.

const API_BASE = 'http://localhost:3001';

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

// ============================================================
// 🔨 TODO: Implement this — call POST /todos with the title
// Should return the created todo
// ============================================================
export async function createTodo(title) {
  // TODO: implement
  throw new Error('createTodo not implemented');
}

// ============================================================
// 🔨 TODO: Implement this — call PATCH /todos/:id with updates
// Updates can include { title } or { completed }
// Should return the updated todo
// ============================================================
export async function updateTodo(id, updates) {
  // TODO: implement
  throw new Error('updateTodo not implemented');
}

// ============================================================
// 🔨 TODO: Implement this — call DELETE /todos/:id
// Returns nothing on success
// ============================================================
export async function deleteTodo(id) {
  // TODO: implement
  throw new Error('deleteTodo not implemented');
}
