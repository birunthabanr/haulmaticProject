import { useEffect, useMemo, useState } from 'react';

export default function TodoItem({ todo, onUpdate, onDelete, isBusy = false, canDelete = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  useEffect(() => {
    if (!isEditing) setEditTitle(todo.title);
  }, [todo.title, isEditing]);

  const canSave = useMemo(() => {
    const trimmed = editTitle.trim();
    return trimmed.length >= 1 && trimmed.length <= 200;
  }, [editTitle]);

  const save = async () => {
    const trimmed = editTitle.trim();
    await onUpdate(todo.id, { title: trimmed });
    setIsEditing(false);
  };

  const toggleComplete = async () => {
    await onUpdate(todo.id, { completed: !todo.completed });
  };

  const remove = async () => {
    await onDelete(todo.id);
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canSave && !isBusy) save();
            if (e.key === 'Escape') {
              setIsEditing(false);
              setEditTitle(todo.title);
            }
          }}
          className="edit-input"
          disabled={isBusy}
        />
      ) : (
        <span className="todo-title">{todo.title}</span>
      )}

      <div className="todo-actions">
        <button className="btn btn-muted" onClick={toggleComplete} disabled={isBusy}>
          {todo.completed ? 'Undo' : 'Complete'}
        </button>
        <button
          className="btn btn-muted"
          onClick={() => {
            if (!isEditing) {
              setIsEditing(true);
              return;
            }
            if (canSave && !isBusy) save();
          }}
          disabled={isBusy || (isEditing && !canSave)}
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
        {canDelete ? <button className="btn btn-danger" onClick={remove} disabled={isBusy}>Delete</button> : null}
      </div>
    </li>
  );
}
