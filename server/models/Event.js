const mongoose = require('mongoose');

const PostViewEventSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional if logged in
    sessionId: { type: String }, // anonymous session fingerprint from frontend
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PostViewEventSchema.index({ createdAt: 1 });
PostViewEventSchema.index({ post: 1, createdAt: 1 });

module.exports = mongoose.model('PostViewEvent', PostViewEventSchema);
