const mongoose = require('mongoose');
const PostViewEvent = require('../models/Event');

async function recordView({ post, user, sessionId, userAgent, ip }) {
  return PostViewEvent.create({ post, user, sessionId, userAgent, ip });
}

async function dailyViewsByPost(postId, { days = 14, tz = 'UTC' } = {}) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const pipeline = [
    { $match: { post: new mongoose.Types.ObjectId(postId), createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { date: '$createdAt', format: '%Y-%m-%d', timezone: tz } },
        count: { $sum: 1 },
      },
    },
    { $project: { _id: 0, date: '$_id', count: 1 } },
    { $sort: { date: 1 } },
  ];

  const rows = await PostViewEvent.aggregate(pipeline);

  // Fill missing days with zeros
  const byDate = new Map(rows.map(r => [r.date, r.count]));
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: byDate.get(key) || 0 });
  }
  return out;
}

module.exports = { recordView, dailyViewsByPost };
