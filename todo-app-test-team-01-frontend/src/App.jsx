import { useEffect, useState } from 'react';
import { fetchTodos } from './api';
import TodoItem from './components/TodoItem';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // ============================================================
  // 🔨 TODO: Implement handleCreate
  // Should:
  //   1. Call createTodo(title) from api.js
  //   2. Add the new todo to the list
  //   3. Validate title is 1–200 chars before sending
  // ============================================================
  const handleCreate = async (title) => {
    // TODO: implement
    console.log('TODO: handleCreate', title);
  };

  // ============================================================
  // 🔨 TODO: Implement handleUpdate
  // Should:
  //   1. Call updateTodo(id, updates) from api.js
  //   2. Update the todo in the list with the response
  // Used for both editing the title AND marking complete
  // ============================================================
  const handleUpdate = async (id, updates) => {
    // TODO: implement
    console.log('TODO: handleUpdate', id, updates);
  };

  // ============================================================
  // 🔨 TODO: Implement handleDelete
  // Should:
  //   1. Call deleteTodo(id) from api.js
  //   2. Remove the todo from the list
  // ============================================================
  const handleDelete = async (id) => {
    // TODO: implement
    console.log('TODO: handleDelete', id);
  };

  if (loading) return <div className="container"><p>Loading…</p></div>;
  if (error) return <div className="container"><p className="error">Error: {error}</p></div>;

  return (
    <div className="container">
      <h1>Todo App</h1>
      <div className="create-section">
        <p style={{ color: '#888', fontStyle: 'italic' }}>
          TODO: Add a create form here
        </p>
      </div>

      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
}
