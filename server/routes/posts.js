const express = require('express');
const Post = require('../models/Post');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// GET /api/posts  -> homepage feed (no auth needed)
router.get('/', async (_req, res) => {
  try {
    const posts = await Post.find({ published: true })
      .sort({ createdAt: -1 })
      .populate('author', 'username email')
      .lean();
    res.json(posts);
  } catch (e) {
    console.error('[GET /api/posts] error:', e);
    res.status(500).json({ error: 'Failed to load posts' });
  }
});

// POST /api/posts -> create a recipe (auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content, tags, published } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title and content required' });

    const post = await Post.create({
      title,
      content,
      tags: Array.isArray(tags) ? tags : [],
      published: published !== undefined ? !!published : true,
      author: req.user.id,
    });

    const populated = await post.populate('author', 'username email');
    res.status(201).json(populated);
  } catch (e) {
    console.error('[POST /api/posts] error:', e);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

module.exports = router;
