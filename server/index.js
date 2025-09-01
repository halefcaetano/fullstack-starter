require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI ||
  'mongodb://root:example@127.0.0.1:27017/blog?authSource=admin';

async function start() {
  await mongoose.connect(MONGODB_URI);
  console.log('Mongo connected');

  app.use('/api/posts', require('./routes/postRoutes'));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

start().catch((e) => {
  console.error('Startup error:', e);
  process.exit(1);
});
