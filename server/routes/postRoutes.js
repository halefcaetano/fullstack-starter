const router = require('express').Router();
const { createPost, listPosts } = require('../services/postService');

router.get('/', async (_req, res) => {
  try {
    const posts = await listPosts();
    res.json(posts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const post = await createPost(req.body);
    res.status(201).json(post);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
