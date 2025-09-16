const router = require('express').Router();
const { recordView } = require('../services/eventsService');

// Public endpoint; uses JWT user if middleware attaches req.user (optional)
router.post('/view', async (req, res) => {
  try {
    const { postId, sessionId } = req.body || {};
    if (!postId) return res.status(400).json({ error: 'postId required' });
    const userAgent = req.get('user-agent');
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress;
    const user = req.user?._id;
    const ev = await recordView({ post: postId, user, sessionId, userAgent, ip });
    res.status(201).json({ ok: true, id: ev._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to record view' });
  }
});

module.exports = router;
