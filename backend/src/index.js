require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./db');

const authRoutes = require('./routes/auth');
const githubRoutes = require('./routes/github');
const userRoutes = require('./routes/user');
const githubDataRoutes = require('./routes/githubData');
const wakatimeRoutes = require('./routes/wakatime');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'ok', db: 'disconnected', error: err.message });
  }
});

app.use('/auth', authRoutes);
app.use('/auth', githubRoutes);
app.use('/auth', wakatimeRoutes);
app.use('/user', userRoutes);
app.use('/github', githubDataRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Dev Dashboard API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});