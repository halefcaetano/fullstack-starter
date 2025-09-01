const Post = require('../models/Post');

async function createPost(data) {
  const { title, content, author } = data || {};
  if (!title || !content) throw new Error('title and content are required');
  return await Post.create({ title, content, author });
}

async function listPosts() {
  return await Post.find().sort({ createdAt: -1 }).lean();
}

module.exports = { createPost, listPosts };
