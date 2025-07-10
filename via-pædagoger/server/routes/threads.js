const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Thread = require('../models/Thread');
const Category = require('../models/Category');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      category, 
      sort = 'hot', 
      page = 1, 
      limit = 20,
      tag 
    } = req.query;

    const query = { isDeleted: false };
    
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }
    
    if (tag) {
      query.tags = tag;
    }

    let sortOptions = {};
    switch (sort) {
      case 'new':
        sortOptions = { createdAt: -1 };
        break;
      case 'top':
        sortOptions = { score: -1 };
        break;
      case 'hot':
        sortOptions = { lastActivity: -1, score: -1 };
        break;
      default:
        sortOptions = { isPinned: -1, lastActivity: -1 };
    }

    const threads = await Thread.find(query)
      .populate('author', 'username avatar karma')
      .populate('category', 'name slug color')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Thread.countDocuments(query);

    res.json({
      threads,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server fejl');
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate('author', 'username avatar karma bio')
      .populate('category', 'name slug color');

    if (!thread || thread.isDeleted) {
      return res.status(404).json({ msg: 'Tråd ikke fundet' });
    }

    await thread.addView();

    res.json(thread);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Tråd ikke fundet' });
    }
    res.status(500).send('Server fejl');
  }
});

router.post('/', [
  auth,
  body('title').isLength({ min: 5, max: 200 }).trim().escape(),
  body('content').isLength({ min: 10 }),
  body('category').not().isEmpty(),
  body('tags').optional().isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, content, category, tags } = req.body;

    const categoryExists = await Category.findById(category);
    if (!categoryExists || !categoryExists.isActive) {
      return res.status(400).json({ msg: 'Ugyldig kategori' });
    }

    const thread = new Thread({
      title,
      content,
      author: req.user.id,
      category,
      tags: tags || []
    });

    await thread.save();

    categoryExists.threadCount += 1;
    await categoryExists.save();

    await thread.populate('author', 'username avatar karma');
    await thread.populate('category', 'name slug color');

    res.json(thread);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server fejl');
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    
    if (!thread || thread.isDeleted) {
      return res.status(404).json({ msg: 'Tråd ikke fundet' });
    }

    if (thread.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Ikke autoriseret' });
    }

    if (thread.isLocked) {
      return res.status(403).json({ msg: 'Tråd er låst' });
    }

    const { content, tags } = req.body;

    if (content) thread.content = content;
    if (tags) thread.tags = tags;

    await thread.save();
    res.json(thread);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server fejl');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    
    if (!thread || thread.isDeleted) {
      return res.status(404).json({ msg: 'Tråd ikke fundet' });
    }

    const user = await User.findById(req.user.id);
    
    if (thread.author.toString() !== req.user.id && !user.isAdmin) {
      return res.status(403).json({ msg: 'Ikke autoriseret' });
    }

    thread.isDeleted = true;
    thread.content = '[Slettet]';
    await thread.save();

    const category = await Category.findById(thread.category);
    if (category) {
      category.threadCount -= 1;
      await category.save();
    }

    res.json({ msg: 'Tråd slettet' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server fejl');
  }
});

module.exports = router;