// server/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Helper to sign JWTs
const sign = (u) =>
  jwt.sign({ id: u._id, email: u.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

// ----- POST /api/auth/signup -----
router.post(
  '/signup',
  [
    body('username').isLength({ min: 3 }).withMessage('username too short'),
    body('email').isEmail().withMessage('invalid email'),
    body('password').isLength({ min: 6 }).withMessage('password too short'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    try {
      // Check conflicts first for nicer error messages
      const exists = await User.findOne({ $or: [{ email }, { username }] });
      if (exists)
        return res
          .status(409)
          .json({ error: 'Email or username already in use' });

      // Pre-save hook in the model will hash the password
      const user = await User.create({ username, email, password });
      const token = sign(user);
      return res.status(201).json({
        message: 'User created',
        token,
        user, // password removed by toJSON()
      });
    } catch (err) {
      // Handle unique-index races gracefully
      if (err && err.code === 11000) {
        return res
          .status(409)
          .json({ error: 'Email or username already in use' });
      }
      return res.status(500).json({ error: 'Signup failed' });
    }
  }
);

// ----- POST /api/auth/login -----
router.post(
  '/login',
  [body('email').isEmail(), body('password').isString()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    // Need password for comparison, so select it explicitly
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = sign(user);
    // convert to safe JSON (no password)
    const safe = user.toJSON();
    return res.json({ message: 'Login successful', token, user: safe });
  }
);

// ----- GET /api/auth/me (requires Bearer token) -----
router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const payload = jwt.verify(token, process.env.JWT_SECRET); // { id, email }
    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({ user });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
