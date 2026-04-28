import { useEffect, useState } from 'react';
import {
  createTodo,
  deleteTodo,
  fetchMe,
  fetchTodos,
  loginUser,
  logoutUser,
  signupUser,
  updateTodo,
} from './api';
import TodoItem from './components/TodoItem';

function normalizeAndValidateTitle(title) {
  const trimmed = String(title ?? '').trim();
  if (trimmed.length < 1 || trimmed.length > 200) {
    return { ok: false, error: 'Title must be 1-200 characters' };
  }
  return { ok: true, value: trimmed };
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signupRole, setSignupRole] = useState('user');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [pendingIds, setPendingIds] = useState(() => new Set());

  useEffect(() => {
    const existingToken = localStorage.getItem('authToken');
    if (!existingToken) {
      setAuthLoading(false);
      return;
    }
    fetchMe()
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('authToken');
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setActionError(null);
    fetchTodos()
      .then((data) => {
        setTodos(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [user]);

  const isPending = (id) => pendingIds.has(id);
  const markPending = (id, pending) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  };

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

  const submitAuth = async (e) => {
    e.preventDefault();
    setAuthError(null);

    const cleanUsername = username.trim();
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      setAuthError('Username must be 3-30 characters');
      return;
    }
    if (password.length < 4 || password.length > 100) {
      setAuthError('Password must be 4-100 characters');
      return;
    }

    setAuthSubmitting(true);
    try {
      const payload =
        authMode === 'signup'
          ? await signupUser({ username: cleanUsername, password, role: signupRole })
          : await loginUser({ username: cleanUsername, password });
      localStorage.setItem('authToken', payload.token);
      setUser(payload.user);
      setUsername('');
      setPassword('');
    } catch (e) {
      setAuthError(e?.message || 'Authentication failed');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore failures and clear local session anyway.
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
      setTodos([]);
      setError(null);
      setActionError(null);
      setLoading(true);
    }
  };

  if (authLoading) return <div className="container"><p>Checking session...</p></div>;

  if (!user) {
    return (
      <div className="container">
        <h1>Todo App</h1>
        <h2 style={{ marginTop: 0 }}>{authMode === 'login' ? 'Login' : 'Sign up'}</h2>
        <form onSubmit={submitAuth} style={{ display: 'grid', gap: 10 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={authSubmitting}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={authSubmitting}
          />
          {authMode === 'signup' ? (
            <select
              value={signupRole}
              onChange={(e) => setSignupRole(e.target.value)}
              disabled={authSubmitting}
              aria-label="Signup role"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          ) : null}
          <button type="submit" disabled={authSubmitting}>
            {authSubmitting ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
        {authError ? <p className="error" style={{ marginTop: 12 }}>Error: {authError}</p> : null}
        <p style={{ marginTop: 12 }}>
          {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setAuthError(null);
              setAuthMode((prev) => (prev === 'login' ? 'signup' : 'login'));
            }}
            disabled={authSubmitting}
          >
            {authMode === 'login' ? 'Sign up' : 'Login'}
          </button>
        </p>
        <p style={{ color: '#666', fontSize: 13 }}>
          Seed users: <code>admin / admin123</code>, <code>user / user123</code>
        </p>
      </div>
    );
  }

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><p className="error">Error: {error}</p></div>;

  return (
    <div className="container">
      <h1>Todo App</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ margin: 0 }}>
          Signed in as <strong>{user.username}</strong> ({user.role})
        </p>
        <button type="button" onClick={handleLogout}>Logout</button>
      </div>

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
            placeholder="Add a todo..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={isCreating}
            aria-label="New todo title"
          />
          <button type="submit" disabled={isCreating}>
            {isCreating ? 'Adding...' : 'Add'}
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
            canDelete={user.role === 'admin'}
          />
        ))}
      </ul>
    </div>
  );
}
