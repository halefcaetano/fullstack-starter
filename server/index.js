// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();

// ---- config
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI; // from server/.env

// ---- middleware (must be before routes)
app.use(cors());
app.use(express.json());

// ---- routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ---- db + server startup
(async () => {
  try {
    if (!MONGODB_URI) throw new Error('MONGODB_URI is missing. Add it to server/.env');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    app.listen(PORT, () => {
      console.log(`✅ Backend listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
})();
