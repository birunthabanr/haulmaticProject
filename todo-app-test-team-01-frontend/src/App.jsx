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

function parseSubtasksInput(raw) {
  return String(raw || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text, index) => ({ id: index + 1, text, completed: false }));
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
  const [newBody, setNewBody] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSubtasksText, setNewSubtasksText] = useState('');
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

  const handleCreate = async ({ title, body, description, subtasksText }) => {
    setActionError(null);
    const validated = normalizeAndValidateTitle(title);
    if (!validated.ok) {
      setActionError(validated.error);
      return;
    }

    if (isCreating) return;
    setIsCreating(true);
    try {
      const created = await createTodo({
        title: validated.value,
        body: String(body || '').trim(),
        description: String(description || '').trim(),
        subtasks: parseSubtasksInput(subtasksText),
      });
      setTodos((prev) => [created, ...prev]);
      setNewTitle('');
      setNewBody('');
      setNewDescription('');
      setNewSubtasksText('');
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
        <header className="app-header">
          <h1>TaskTide</h1>
          <p className="subtitle">Plan your day with a clean, focused workflow.</p>
        </header>
        <section className="auth-card">
          <h2 className="section-title">{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <form className="auth-form" onSubmit={submitAuth}>
            <label className="field-label">
              <span>Username</span>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={authSubmitting}
              />
            </label>
            <label className="field-label">
              <span>Password</span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={authSubmitting}
              />
            </label>
            {authMode === 'signup' ? (
              <label className="field-label">
                <span>Role</span>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  disabled={authSubmitting}
                  aria-label="Signup role"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            ) : null}
            <button className="btn btn-primary btn-block" type="submit" disabled={authSubmitting}>
              {authSubmitting ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>
          {authError ? <p className="error">Error: {authError}</p> : null}
          <p className="auth-switch-text">
            {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              className="btn btn-link"
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
          {/* <p className="seed-users">
            Seed users: <code>admin / admin123</code>, <code>user / user123</code>
          </p> */}
        </section>
      </div>
    );
  }

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><p className="error">Error: {error}</p></div>;

  return (
    <div className="container">
      <header className="app-header app-header-row">
        <div>
          <h1>TaskTide</h1>
          <p className="subtitle">
            Signed in as <strong>{user.username}</strong> ({user.role})
          </p>
        </div>
        <button className="btn btn-muted" type="button" onClick={handleLogout}>Logout</button>
      </header>

      <div className="create-section">
        <form
          className="create-form create-form-extended"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate({
              title: newTitle,
              body: newBody,
              description: newDescription,
              subtasksText: newSubtasksText,
            });
          }}
        >
          <div className="create-fields">
            <input
              type="text"
              placeholder="Add a todo title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={isCreating}
              aria-label="New todo title"
            />
            <input
              type="text"
              placeholder="Body (optional)"
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              disabled={isCreating}
              aria-label="New todo body"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              disabled={isCreating}
              aria-label="New todo description"
            />
            <textarea
              placeholder="Subtasks (one per line)"
              value={newSubtasksText}
              onChange={(e) => setNewSubtasksText(e.target.value)}
              disabled={isCreating}
              aria-label="New todo subtasks"
              rows={3}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={isCreating}>
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
