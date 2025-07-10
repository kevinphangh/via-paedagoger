const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email')
      .lean();
    
    if (!user) {
      return res.status(404).json({ msg: 'Bruger ikke fundet' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Bruger ikke fundet' });
    }
    res.status(500).send('Server fejl');
  }
});

router.put('/profile', auth, async (req, res) => {
  const { bio, avatar, semester } = req.body;

  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'Bruger ikke fundet' });
    }

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (semester !== undefined) user.semester = semester;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server fejl');
  }
});

router.get('/', async (req, res) => {
  try {
    const { sort = 'karma', order = 'desc', limit = 20, page = 1 } = req.query;
    
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    const users = await User.find({ isDeleted: { $ne: true } })
      .select('-password -email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await User.countDocuments({ isDeleted: { $ne: true } });

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server fejl');
  }
});

module.exports = router;