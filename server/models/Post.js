// server/models/Post.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    published: { type: Boolean, default: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
