const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // prevent duplicates (clean 409 error instead of 500)
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ error: 'Username or email already in use' });

    const user = await User.create({ username, email, password });
    const token = signToken(user);
    return res.status(201).json({ message: 'User created', token, user: user.toJSON() });
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ error: 'Username or email already in use' });
    }
    console.error('[register] error:', e);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // IMPORTANT: include password (schema has select:false)
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({ token, user: user.toJSON() });
  } catch (e) {
    console.error('[login] error:', e);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
