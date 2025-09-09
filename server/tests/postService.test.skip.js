const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Post = require('../models/Post');
const { createPost, listPosts } = require('../services/postService');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Post.deleteMany({});
});

test('createPost inserts and listPosts returns it', async () => {
  await createPost({ title: 'Hello', content: 'World', author: 'Halef' });
  const list = await listPosts();
  expect(list).toHaveLength(1);
  expect(list[0].title).toBe('Hello');
  expect(list[0].content).toBe('World');
  expect(list[0].author).toBe('Halef');
});
