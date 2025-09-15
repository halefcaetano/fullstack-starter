// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('Mongo error:', err); process.exit(1); });

// Routes (required)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes')); // <-- keep this

// Your other routes (optional, kept)
app.use('/api/events', require('./routes/events'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Start server
app.listen(process.env.PORT || 4000, () =>
  console.log(`✅ Backend listening on http://localhost:${process.env.PORT || 4000}`)
);
