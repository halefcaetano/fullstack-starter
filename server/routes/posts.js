// server/routes/posts.js
const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

/**
 * GET /api/posts
 * Public: return published posts for the homepage feed
 */
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

/**
 * GET /api/posts/:id
 * Public: return a single post by id
 * (Keep this *after* any more specific routes like /search to avoid conflicts.)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const post = await Post.findById(id)
      .populate('author', 'username email')
      .lean();

    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json(post);
  } catch (e) {
    console.error('[GET /api/posts/:id] error:', e);
    res.status(500).json({ error: 'Failed to load post' });
  }
});

/**
 * POST /api/posts
 * Private: create a post (requires auth)
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content, tags, published } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'title and content required' });
    }

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
