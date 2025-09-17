// server/services/chatService.js
const ChatMessage = require('../models/ChatMessage');

async function createMessage({ room = 'public', userId, username, message }) {
  return ChatMessage.create({ room, user: userId, username, message });
}

async function fetchRecent(room = 'public', limit = 50) {
  return ChatMessage.find({ room }).sort({ createdAt: 1 }).limit(limit).lean();
}

module.exports = { createMessage, fetchRecent };
