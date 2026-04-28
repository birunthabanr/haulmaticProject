import { useEffect, useState } from 'react';
import { createTodo, deleteTodo, fetchTodos, updateTodo } from './api';
import TodoItem from './components/TodoItem';

function normalizeAndValidateTitle(title) {
  const trimmed = String(title ?? '').trim();
  if (trimmed.length < 1 || trimmed.length > 200) {
    return { ok: false, error: 'Title must be 1–200 characters' };
  }
  return { ok: true, value: trimmed };
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [pendingIds, setPendingIds] = useState(() => new Set());

  // Load todos on mount
  useEffect(() => {
    fetchTodos()
      .then((data) => {
        setTodos(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const isPending = (id) => pendingIds.has(id);
  const markPending = (id, pending) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // ============================================================
  // 🔨 TODO: Implement handleCreate
  // Should:
  //   1. Call createTodo(title) from api.js
  //   2. Add the new todo to the list
  //   3. Validate title is 1–200 chars before sending
  // ============================================================
  const handleCreate = async (title) => {
    setActionError(null);
    const validated = normalizeAndValidateTitle(title);
    if (!validated.ok) {
      setActionError(validated.error);
      return;
    }

    if (isCreating) return;
    setIsCreating(true);
    try {
      const created = await createTodo(validated.value);
      setTodos((prev) => [created, ...prev]);
      setNewTitle('');
    } catch (e) {
      setActionError(e?.message || 'Failed to create todo');
    } finally {
      setIsCreating(false);
    }
  };

  // ============================================================
  // 🔨 TODO: Implement handleUpdate
  // Should:
  //   1. Call updateTodo(id, updates) from api.js
  //   2. Update the todo in the list with the response
  // Used for both editing the title AND marking complete
  // ============================================================
  const handleUpdate = async (id, updates) => {
    setActionError(null);
    if (isPending(id)) return;

    const payload = { ...updates };
    if (Object.prototype.hasOwnProperty.call(payload, 'title')) {
      const validated = normalizeAndValidateTitle(payload.title);
      if (!validated.ok) {
        setActionError(validated.error);
        return;
      }
      payload.title = validated.value;
    }

    markPending(id, true);
    try {
      const updated = await updateTodo(id, payload);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e) {
      setActionError(e?.message || 'Failed to update todo');
      throw e;
    } finally {
      markPending(id, false);
    }
  };

  // ============================================================
  // 🔨 TODO: Implement handleDelete
  // Should:
  //   1. Call deleteTodo(id) from api.js
  //   2. Remove the todo from the list
  // ============================================================
  const handleDelete = async (id) => {
    setActionError(null);
    if (isPending(id)) return;

    markPending(id, true);
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setActionError(e?.message || 'Failed to delete todo');
    } finally {
      markPending(id, false);
    }
  };

  if (loading) return <div className="container"><p>Loading…</p></div>;
  if (error) return <div className="container"><p className="error">Error: {error}</p></div>;

  return (
    <div className="container">
      <h1>Todo App</h1>
      <div className="create-section">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate(newTitle);
          }}
          style={{ display: 'flex', gap: 8, width: '100%' }}
        >
          <input
            type="text"
            placeholder="Add a todo…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={isCreating}
            aria-label="New todo title"
          />
          <button type="submit" disabled={isCreating}>
            {isCreating ? 'Adding…' : 'Add'}
          </button>
        </form>
      </div>

      {actionError ? <p className="error">Error: {actionError}</p> : null}

      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            isBusy={isPending(todo.id)}
          />
        ))}
      </ul>
    </div>
  );
}
