const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');
const todosRouter = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
app.use('/auth', authRouter);

// Todo routes
app.use('/todos', todosRouter);

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
