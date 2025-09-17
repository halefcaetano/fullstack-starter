// server/index.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

/**
 * REST CORS — allow Codespaces + localhost (single place only)
 */
const ALLOW = [
  /\.app\.github\.dev$/,             // Codespaces wildcard
  /^https?:\/\/localhost:\d+$/,      // localhost:any
  /^https?:\/\/127\.0\.0\.1:\d+$/,   // 127.0.0.1:any
];

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // non-browser or same-origin
    const ok = ALLOW.some(re => re.test(origin));
    cb(null, ok);
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(morgan('dev'));
app.use(express.json());

/** MongoDB */
const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/fullstack-starter';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('Mongo error:', err);
    process.exit(1);
  });

/** REST routes */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/events', require('./routes/events'));
app.use('/api/analytics', require('./routes/analytics'));

/** Health check */
app.get('/api/health', (_req, res) => res.json({ ok: true }));

/**
 * Chat history for refresh (optional)
 * GET /api/chat/history?room=public&limit=50
 * Returns chronological (oldest→newest)
 */
const { fetchRecent } = require('./services/chatService');
app.get('/api/chat/history', async (req, res) => {
  try {
    const room = String(req.query.room || 'public');
    const limit = Math.min(parseInt(req.query.limit || '200', 10), 500);
    const recent = await fetchRecent(room, limit);
    res.json(recent);
  } catch (e) {
    console.error('history error', e);
    res.status(500).json({ error: 'History fetch failed' });
  }
});

/* ------------------------------------------------------------------ */
/* --- Socket.IO setup (paste this once) ---------------------------- */
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { createMessage } = require('./services/chatService');

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      /https?:\/\/.*\-5173\.app\.github\.dev$/,  // Codespaces Vite URLs
    ],
    credentials: true,
  },
});

// Auth guard for sockets (JWT taken from auth field)
io.use((socket, next) => {
  try {
    const token =
      socket.handshake?.auth?.token ||
      socket.handshake?.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
      socket.handshake?.query?.token;

    console.log('[SOCKET AUTH] handshake.auth:', socket.handshake?.auth);
    console.log('[SOCKET AUTH] handshake.headers:', socket.handshake?.headers);
    console.log('[SOCKET AUTH] handshake.query:', socket.handshake?.query);
    console.log('[SOCKET AUTH] extracted token:', token);

    if (!token) {
      console.error('[SOCKET AUTH] No token found in handshake:', socket.handshake);
      return next(new Error('NO_AUTH'));
    }
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  // Fallback: if username missing, use email
  socket.user = { id: payload.id, username: payload.username || payload.email || payload.email?.split('@')[0] || 'user' };
  console.log('[SOCKET AUTH] Authenticated user:', socket.user);
  next();
  } catch (e) {
    console.error('[SOCKET AUTH] JWT error', e?.message, 'handshake:', socket.handshake);
    next(new Error('BAD_AUTH'));
  }
});

io.on('connection', async (socket) => {
  console.log('🔌 socket connected', socket.id, socket.user);
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });

  // On connect, send public chat history
  try {
    const history = await fetchRecent('public', 50);
    for (const m of history) {
      socket.emit('chat:message', {
        room: 'public',
        username: m.username,
        message: m.message,
        replayed: true,
        ts: new Date(m.createdAt).getTime(),
      });
    }
  } catch (e) {
    console.error('history error', e.message);
  }

  // broadcast a new chat message
  socket.on('chat:message', async ({ message }) => {
    if (!message || typeof message !== 'string') return;
    const payload = {
      room: 'public',
      username: socket.user.username,
      message,
      replayed: false,
      ts: Date.now(),
    };
    io.emit('chat:message', payload);
    try {
      await createMessage({
        room: 'public',
        userId: socket.user.id,
        username: socket.user.username,
        message,
      });
    } catch (e) {
      console.error('store chat error', e.message);
    }
  });

  // return rooms list (ack)
  socket.on('chat:userinfo', (cb) => {
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    cb?.({ rooms, user: socket.user, socketId: socket.id });
  });

  // join/switch rooms
  socket.on('chat:join', async ({ room }) => {
    if (!room || typeof room !== 'string') return;
    for (const r of socket.rooms) if (r !== socket.id) socket.leave(r);
    socket.join(room);
    io.to(room).emit('chat:message', {
      room,
      username: null,
      message: `${socket.user.username} joined ${room}`,
      replayed: false,
      ts: Date.now(),
    });
    const history = await fetchRecent(room, 50);
    for (const m of history) {
      socket.emit('chat:message', {
        room: m.room,
        username: m.username,
        message: m.message,
        replayed: true,
        ts: new Date(m.createdAt).getTime(),
      });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 socket disconnected', socket.id, reason);
  });
});
/* ------------------------------------------------------------------ */

/** ✅ Listen on httpServer (not app) */
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
});
