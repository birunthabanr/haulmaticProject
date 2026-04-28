// In-memory todo store. In a real app this would be a database.
// Each todo has: { id, title, body, description, subtasks, completed, createdAt }

let todos = [
  {
    id: 1,
    title: 'Welcome! This is a sample todo',
    body: 'This task now supports richer content.',
    description: 'Use this todo to test editing details and subtasks.',
    subtasks: [
      { id: 1, text: 'Open the app', completed: true },
      { id: 2, text: 'Try editing this todo', completed: false },
    ],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'You can implement create, update, delete, and complete',
    body: 'Roles and auth are enabled too.',
    description: 'Only admins can delete todos.',
    subtasks: [
      { id: 1, text: 'Login as user', completed: true },
      { id: 2, text: 'Login as admin', completed: true },
    ],
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

let nextId = 3;

function getAll() {
  return todos;
}

function getById(id) {
  return todos.find((t) => t.id === id);
}

function create(data) {
  const todo = {
    id: nextId++,
    title: data.title,
    body: data.body || '',
    description: data.description || '',
    subtasks: data.subtasks || [],
    completed: false,
    createdAt: new Date().toISOString(),
  };
  todos.push(todo);
  return todo;
}

function update(id, updates) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return null;
  Object.assign(todo, updates);
  return todo;
}

function remove(id) {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return false;
  todos.splice(index, 1);
  return true;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
