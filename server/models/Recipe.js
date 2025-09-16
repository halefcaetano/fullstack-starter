// server/models/Recipe.js
const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    // store ingredients as an array of strings
    ingredients: {
      type: [String],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length > 0 && arr.every((s) => typeof s === 'string' && s.trim().length > 0),
        message: 'At least one ingredient is required',
      },
    },

    imageUrl: { type: String, trim: true, default: '' },
    instructions: { type: String, trim: true, default: '' },

    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // NEW: likes (list of User IDs who liked this recipe)
    likedBy: { type: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: likesCount
RecipeSchema.virtual('likesCount').get(function () {
  return Array.isArray(this.likedBy) ? this.likedBy.length : 0;
});

module.exports = mongoose.model('Recipe', RecipeSchema);
