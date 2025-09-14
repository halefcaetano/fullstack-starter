// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// ---- config
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI; // set in server/.env

// If deploying behind a proxy (e.g., Cloud Run/Heroku), trust it
app.set('trust proxy', 1);

// ---- middleware (must be before routes)
app.use(cors());
app.use(express.json()); // <-- must be before routes

// ---- routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/events', require('./routes/events'));       // ensure events route exists
app.use('/api/analytics', require('./routes/analytics')); // ensure analytics route exists

// health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ---- db + server startup
(async () => {
  try {
    if (!MONGODB_URI) throw new Error('MONGODB_URI is missing. Add it to server/.env');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Backend listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
})();
