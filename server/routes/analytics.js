const router = require('express').Router();
const { dailyViewsByPost } = require('../services/eventsService');

router.get('/posts/:postId/views/daily', async (req, res) => {
  try {
    const { postId } = req.params;
    const days = Math.min(parseInt(req.query.days || '14', 10), 365);
    const tz = req.query.tz || 'UTC';
    const data = await dailyViewsByPost(postId, { days, tz });
    res.json({ postId, days, tz, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to fetch analytics' });
  }
});

module.exports = router;
