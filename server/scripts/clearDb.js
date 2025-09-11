// server/scripts/clearDb.js
require('dotenv').config();            // loads server/.env when you run from server/
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('✅ Cleared users and posts');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing DB', err);
    process.exit(1);
  }
})();
