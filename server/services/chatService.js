// server/services/chatService.js
const ChatMessage = require('../models/ChatMessage');

async function createMessage({ room = 'public', userId, username, message }) {
  return ChatMessage.create({ user: userId, username, message });
}

async function fetchRecent(room = 'public', limit = 50) {
  return ChatMessage.find({}).sort({ createdAt: 1 }).limit(limit).lean();
}

async function clearAllMessages() {
  await ChatMessage.deleteMany({});
}

module.exports = { createMessage, fetchRecent, clearAllMessages };
