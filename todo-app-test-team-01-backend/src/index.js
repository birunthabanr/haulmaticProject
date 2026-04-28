const express = require('express');
const cors = require('cors');
const todosRouter = require('./routes/todos');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Todo routes
app.use('/todos', todosRouter);

// Auth routes
app.use('/api/v1/auth', authRouter);

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
