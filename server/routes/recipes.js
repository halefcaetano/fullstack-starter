// server/routes/recipes.js
const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const requireAuth = require('../middleware/requireAuth'); // adjust path if different

// List all recipes (latest first)
router.get('/', async (req, res) => {
  const recipes = await Recipe.find()
    .sort({ createdAt: -1 })
    .populate('author', 'username'); // ⬅️ only username now
  res.json(recipes);
});

// List my recipes
router.get('/mine', requireAuth, async (req, res) => {
  const recipes = await Recipe.find({ author: req.user.id })
    .sort({ createdAt: -1 })
    .populate('author', 'username'); // optional if you also want it here
  res.json(recipes);
});

// Get one recipe
router.get('/:id', async (req, res) => {
  const recipe = await Recipe.findById(req.params.id)
    .populate('author', 'username'); // ⬅️ only username now
  if (!recipe) return res.status(404).json({ error: 'Not found' });
  res.json(recipe);
});

// Create recipe
router.post('/', requireAuth, async (req, res) => {
  const { title, ingredients, imageUrl, instructions } = req.body;
  const ing = Array.isArray(ingredients)
    ? ingredients
    : String(ingredients || '')
        .split(/\r?\n|,/)
        .map(s => s.trim())
        .filter(Boolean);

  try {
    const recipe = await Recipe.create({
      title,
      ingredients: ing,
      imageUrl: imageUrl || '',
      instructions: instructions || '',
      author: req.user.id,
    });
    res.status(201).json(recipe);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Update (owner only)
router.put('/:id', requireAuth, async (req, res) => {
  const r = await Recipe.findById(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  if (String(r.author) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const { title, ingredients, imageUrl, instructions } = req.body;
  const ing = Array.isArray(ingredients)
    ? ingredients
    : typeof ingredients === 'string'
      ? ingredients.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean)
      : r.ingredients;

  r.title = title ?? r.title;
  r.ingredients = ing ?? r.ingredients;
  r.imageUrl = imageUrl ?? r.imageUrl;
  r.instructions = instructions ?? r.instructions;
  await r.save();
  res.json(r);
});

// Delete (owner only)
router.delete('/:id', requireAuth, async (req, res) => {
  const r = await Recipe.findById(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  if (String(r.author) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  await r.deleteOne();
  res.json({ ok: true });
});

module.exports = router;
