const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();
    
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server fejl');
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true 
    }).lean();
    
    if (!category) {
      return res.status(404).json({ msg: 'Kategori ikke fundet' });
    }

    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server fejl');
  }
});

router.post('/', [
  auth,
  body('name').not().isEmpty().trim().escape(),
  body('description').not().isEmpty().trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ msg: 'Ikke autoriseret' });
    }

    const { name, description, icon, color } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ msg: 'Kategori eksisterer allerede' });
    }

    const category = new Category({
      name,
      description,
      icon,
      color
    });

    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server fejl');
  }
});

router.put('/:id', [
  auth,
  body('name').optional().trim().escape(),
  body('description').optional().trim().escape()
], async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ msg: 'Ikke autoriseret' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: 'Kategori ikke fundet' });
    }

    const { name, description, icon, color, order, isActive } = req.body;

    if (name) category.name = name;
    if (description) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (color) category.color = color;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server fejl');
  }
});

module.exports = router;