// server/index.js
require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('Mongo error:', err); process.exit(1); });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/events', require('./routes/events'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ================================
// === Socket + History (Mongo) ===
// ================================
const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST"] },
  path: "/socket.io",
});

const Message = require('./models/Message');

// REST: history so reload shows previous messages (works across multiple ports/tabs)
app.get('/api/chat/history', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '200', 10), 500);
  const docs = await Message.find({})
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
  res.json(docs);
});

io.on('connection', (socket) => {
  socket.join('global');

  socket.on('chat:message', async (payload = {}) => {
    const text = String(payload.text || '').trim().slice(0, 2000);
    if (!text) return;
    const username = String(payload.username || 'Anonymous').slice(0, 80);

    // 1) persist
    const doc = await Message.create({ text, username });

    // 2) broadcast to everyone (all tabs / all frontend ports)
    const msg = {
      _id: String(doc._id),
      text: doc.text,
      username: doc.username,
      createdAt: doc.createdAt,
    };
    io.to('global').emit('chat:message', msg);
    console.log('💬', username, text);
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Backend listening on http://localhost:${PORT}`));
