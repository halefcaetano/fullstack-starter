// server/routes/recipes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const Recipe = require('../models/Recipe');
const requireAuth = require('../middleware/requireAuth'); // strict auth (401 if missing)

// --- Optional auth: decode JWT if present, ignore otherwise ---
function optionalAuth(req, _res, next) {
  try {
    const hdr = req.headers?.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return next();

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // normalize shape similar to requireAuth
    req.user = { id: payload.id || payload._id || payload.userId, _id: payload.id || payload._id || payload.userId };
  } catch (_e) {
    // If token invalid/expired, just proceed unauthenticated
  }
  next();
}

// ===================== List all recipes (supports sorting) =====================
// GET /api/recipes?sort=likes  (default: newest)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const sort = String(req.query.sort || '').toLowerCase(); // 'likes' or ''
    const docs = await Recipe.find({})
      .populate('author', 'username') // show only username for author
      .lean();

    const userId = req.user?._id?.toString() || req.user?.id?.toString();

    // decorate with like meta
    const withLikeMeta = docs.map((r) => {
      const likedBy = Array.isArray(r.likedBy) ? r.likedBy.map((x) => x.toString()) : [];
      const likesCount = likedBy.length;
      const liked = userId ? likedBy.includes(userId) : false;
      return { ...r, likesCount, liked };
    });

    // sort
    if (sort === 'likes') {
      withLikeMeta.sort((a, b) => b.likesCount - a.likesCount || new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      withLikeMeta.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(withLikeMeta);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============================== List my recipes ===============================
router.get('/mine', requireAuth, async (req, res) => {
  const recipes = await Recipe.find({ author: req.user.id })
    .sort({ createdAt: -1 })
    .populate('author', 'username')
    .lean();

  const withLikeMeta = recipes.map((r) => ({
    ...r,
    likesCount: Array.isArray(r.likedBy) ? r.likedBy.length : 0,
    liked: Array.isArray(r.likedBy) ? r.likedBy.some((u) => u.toString() === req.user.id) : false,
  }));

  res.json(withLikeMeta);
});

// =============================== Get one recipe ===============================
router.get('/:id', optionalAuth, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id)
    .populate('author', 'username')
    .lean();
  if (!recipe) return res.status(404).json({ error: 'Not found' });

  const userId = req.user?._id?.toString() || req.user?.id?.toString();
  const likedBy = Array.isArray(recipe.likedBy) ? recipe.likedBy.map((x) => x.toString()) : [];
  const likesCount = likedBy.length;
  const liked = userId ? likedBy.includes(userId) : false;

  res.json({ ...recipe, likesCount, liked });
});

// ================================ Create recipe ===============================
router.post('/', requireAuth, async (req, res) => {
  const { title, ingredients, imageUrl, instructions } = req.body;

  const ing = Array.isArray(ingredients)
    ? ingredients
    : String(ingredients || '')
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);

  try {
    const recipe = await Recipe.create({
      title,
      ingredients: ing,
      imageUrl: imageUrl || '',
      instructions: instructions || '',
      author: req.user.id,
    });

    // Emit socket event for new recipe
    const io = req.app.get('io');
    if (io) {
      io.emit('recipe:new', {
        _id: recipe._id,
        title: recipe.title,
        ingredients: recipe.ingredients,
        imageUrl: recipe.imageUrl,
        instructions: recipe.instructions,
        author: req.user.id,
      });
    }

    const json = recipe.toJSON?.() || recipe;
    res.status(201).json({ ...json, likesCount: 0, liked: false });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ================================ Update recipe ===============================
router.put('/:id', requireAuth, async (req, res) => {
  const r = await Recipe.findById(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  if (String(r.author) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const { title, ingredients, imageUrl, instructions } = req.body;
  const ing = Array.isArray(ingredients)
    ? ingredients
    : typeof ingredients === 'string'
      ? ingredients.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean)
      : r.ingredients;

  r.title = title ?? r.title;
  r.ingredients = ing ?? r.ingredients;
  r.imageUrl = imageUrl ?? r.imageUrl;
  r.instructions = instructions ?? r.instructions;

  await r.save();
  const json = r.toJSON?.() || r;
  res.json({ ...json, likesCount: Array.isArray(r.likedBy) ? r.likedBy.length : 0 });
});

// ================================= Delete recipe ==============================
router.delete('/:id', requireAuth, async (req, res) => {
  const r = await Recipe.findById(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  if (String(r.author) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  await r.deleteOne();
  res.json({ ok: true });
});

// ============================== Toggle like (NEW) =============================
// POST /api/recipes/:id/like
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const already = recipe.likedBy.some((u) => u.toString() === userId);
    if (already) {
      recipe.likedBy.pull(userId);
    } else {
      recipe.likedBy.push(userId);
    }
    await recipe.save();

    res.json({ liked: !already, likes: recipe.likedBy.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
