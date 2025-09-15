// server/models/Recipe.js
const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    // store ingredients as an array of strings
    ingredients: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one ingredient is required'
      }
    },
    imageUrl: { type: String, trim: true, default: '' },
    instructions: { type: String, trim: true, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recipe', RecipeSchema);
