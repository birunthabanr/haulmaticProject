import { useEffect, useMemo, useState } from 'react';

export default function TodoItem({ todo, onUpdate, onDelete, isBusy = false, canDelete = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editBody, setEditBody] = useState(todo.body || '');
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editSubtasksText, setEditSubtasksText] = useState(
    (todo.subtasks || []).map((subtask) => subtask.text).join('\n')
  );

  useEffect(() => {
    if (!isEditing) {
      setEditTitle(todo.title);
      setEditBody(todo.body || '');
      setEditDescription(todo.description || '');
      setEditSubtasksText((todo.subtasks || []).map((subtask) => subtask.text).join('\n'));
    }
  }, [todo.title, todo.body, todo.description, todo.subtasks, isEditing]);

  useEffect(() => {
    if (todo.completed && isEditing) {
      setIsEditing(false);
      setEditTitle(todo.title);
    }
  }, [todo.completed, todo.title, isEditing]);

  const canSave = useMemo(() => {
    const trimmed = editTitle.trim();
    return trimmed.length >= 1 && trimmed.length <= 200;
  }, [editTitle]);

  const save = async () => {
    const trimmed = editTitle.trim();
    const subtasks = editSubtasksText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((text, index) => {
        const existing = (todo.subtasks || []).find((subtask) => subtask.text === text);
        return {
          id: existing?.id || index + 1,
          text,
          completed: Boolean(existing?.completed),
        };
      });
    await onUpdate(todo.id, {
      title: trimmed,
      body: editBody.trim(),
      description: editDescription.trim(),
      subtasks,
    });
    setIsEditing(false);
  };

  const toggleComplete = async () => {
    await onUpdate(todo.id, { completed: !todo.completed });
  };

  const toggleSubtask = async (subtaskId) => {
    const nextSubtasks = (todo.subtasks || []).map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
    );
    await onUpdate(todo.id, { subtasks: nextSubtasks });
  };

  const remove = async () => {
    await onDelete(todo.id);
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {isEditing ? (
        <div className="todo-content">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsEditing(false);
                setEditTitle(todo.title);
              }
            }}
            className="edit-input"
            disabled={isBusy}
          />
          <input
            type="text"
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            placeholder="Body"
            disabled={isBusy}
          />
          <input
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description"
            disabled={isBusy}
          />
          <textarea
            value={editSubtasksText}
            onChange={(e) => setEditSubtasksText(e.target.value)}
            placeholder="Subtasks (one per line)"
            disabled={isBusy}
            rows={3}
          />
        </div>
      ) : (
        <div className="todo-content">
          <span className="todo-title">{todo.title}</span>
          {todo.body ? <p className="todo-body">{todo.body}</p> : null}
          {todo.description ? <p className="todo-description">{todo.description}</p> : null}
          {todo.subtasks?.length ? (
            <ul className="subtask-list">
              {todo.subtasks.map((subtask) => (
                <li key={subtask.id}>
                  <label className={subtask.completed ? 'subtask-completed' : ''}>
                    <input
                      type="checkbox"
                      checked={Boolean(subtask.completed)}
                      onChange={() => toggleSubtask(subtask.id)}
                      disabled={isBusy || todo.completed}
                    />
                    <span>{subtask.text}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}

      <div className="todo-actions">
        <button className="btn btn-muted" onClick={toggleComplete} disabled={isBusy}>
          {todo.completed ? 'Undo' : 'Complete'}
        </button>
        {!todo.completed ? (
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
        ) : null}
        {canDelete ? <button className="btn btn-danger" onClick={remove} disabled={isBusy}>Delete</button> : null}
      </div>
    </li>
  );
}
