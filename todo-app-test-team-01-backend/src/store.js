// In-memory todo store. In a real app this would be a database.
// Each todo has: { id, title, completed, createdAt }

let todos = [
  {
    id: 1,
    title: 'Welcome! This is a sample todo',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'You can implement create, update, delete, and complete',
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

function create(title) {
  const todo = {
    id: nextId++,
    title,
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
