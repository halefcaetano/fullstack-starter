// server/routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const requireAuth = require('../middleware/requireAuth');

// Create a post (requires login)
router.post('/', requireAuth, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body must be JSON' });
    }

    const { title, content, tags = [], published = true } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required' });
    }

    // normalize tags: accept array or comma-separated string
    const tagsArr = Array.isArray(tags)
      ? tags
      : (typeof tags === 'string'
          ? tags.split(',').map(t => t.trim()).filter(Boolean)
          : []);

    const post = await Post.create({
      title,
      content,
      tags: tagsArr,
      published,
      author: req.user.id, // set by requireAuth
    });

    const populated = await post.populate('author', 'username email');
    res.status(201).json({ message: 'Post created', post: populated });
  } catch (err) {
    console.error('POST /api/posts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
