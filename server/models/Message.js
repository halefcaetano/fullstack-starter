const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    username: { type: String, required: true },
  },
  { timestamps: true }
);

MessageSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);
