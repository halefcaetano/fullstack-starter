require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Post = require('../models/Post');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      throw new Error('Missing MONGODB_URI/MONGO_URI in server/.env');
    }
    await mongoose.connect(uri);
    console.log('✅ Connected to Mongo');

    const post = await Post.findOne({ published: true }).lean();
    if (!post) {
      console.log('No posts found. Create some posts first.');
      process.exit(0);
    }

    const postId = post._id;
    console.log('Seeding views for post:', String(postId), '-', post.title);

    const eventsCol = mongoose.connection.collection('events');
    const today = new Date();

    // Insert view events for the last 10 days
    const docs = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - i);
      d.setUTCHours(12, 0, 0, 0); // mid-day UTC to be consistent

      // 1–5 views per day
      const viewsToday = 1 + Math.floor(Math.random() * 5);
      for (let k = 0; k < viewsToday; k++) {
        const sessionId =
          (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) ||
          Math.random().toString(36).slice(2);

        docs.push({
          type: 'view',
          postId: new ObjectId(postId),
          sessionId,
          createdAt: new Date(d.getTime() + k * 60000) // space events a bit
        });
      }
    }

    if (docs.length) {
      const { insertedCount } = await eventsCol.insertMany(docs);
      console.log(`✅ Inserted ${insertedCount} view events`);
    } else {
      console.log('Nothing to insert.');
    }

    await mongoose.disconnect();
    console.log('✅ Done');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
})();
