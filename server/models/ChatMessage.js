// server/models/ChatMessage.js
const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema(
  {
    room: { type: String, default: 'public', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ChatMessageSchema.index({ room: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
