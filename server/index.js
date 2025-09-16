// server/index.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

/**
 * ----- CORS (single place, no other headers anywhere) -----
 * Allow Codespaces (app.github.dev) + localhost.
 */
const ALLOW = [
  /\.app\.github\.dev$/,             // any Codespaces app host
  /^https?:\/\/localhost:\d+$/,      // localhost:*
  /^https?:\/\/127\.0\.0\.1:\d+$/,   // 127.0.0.1:*
];

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // same-origin / curl
    const ok = ALLOW.some(re => re.test(origin));
    cb(null, ok);
  },
  credentials: false, // IMPORTANT: no creds with wildcard-ish CORS
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
}));

// ----- Basics -----
app.use(morgan('dev'));
app.use(express.json());

// ----- Mongo -----
const MONGO_URI =
  process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fullstack-starter';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('Mongo error:', err);
    process.exit(1);
  });

// ----- Models -----
const Message = require('./models/Message');

// ----- Your existing REST routes (keep these) -----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/events', require('./routes/events'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Chat history for refresh (both 5173 & 5174 will call this)
app.get('/api/chat/history', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '200', 10), 500);
  const docs = await Message.find({}).sort({ createdAt: 1 }).limit(limit).lean();
  res.json(docs);
});

// ----- Socket.IO on the SAME HTTP server -----
const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      const ok = ALLOW.some(re => re.test(origin));
      cb(null, ok);
    },
    methods: ['GET','POST'],
    credentials: false,
  },
  path: '/socket.io',
});

io.on('connection', (socket) => {
  socket.join('global');

  socket.on('chat:message', async (payload = {}) => {
    const text = String(payload.text || '').trim().slice(0, 2000);
    if (!text) return;
    const username = String(payload.username || 'Anonymous').slice(0, 80);

    // Persist to Mongo
    const doc = await Message.create({ text, username });

    // Broadcast to everyone (all tabs/ports)
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

// ----- Listen (IMPORTANT: server.listen, not app.listen) -----
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
});
