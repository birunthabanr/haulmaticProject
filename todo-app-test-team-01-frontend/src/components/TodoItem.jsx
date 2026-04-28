import { useState } from 'react';

export default function TodoItem({ todo, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="edit-input"
        />
      ) : (
        <span className="todo-title">{todo.title}</span>
      )}

      <div className="todo-actions">
        <button onClick={() => console.log('TODO: complete')}>
          {todo.completed ? 'Undo' : 'Complete'}
        </button>
        <button onClick={() => console.log('TODO: edit')}>
          {isEditing ? 'Save' : 'Edit'}
        </button>
        <button onClick={() => console.log('TODO: delete')}>
          Delete
        </button>
      </div>
    </li>
  );
}
