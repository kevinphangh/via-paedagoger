const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Thread = require('../models/Thread');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/thread/:threadId', optionalAuth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.threadId);
    if (!thread || thread.isDeleted) {
      return res.status(404).json({ msg: 'Tråd ikke fundet' });
    }

    const comments = await Comment.find({ 
      thread: req.params.threadId,
      isDeleted: false 
    })
    .populate('author', 'username avatar karma')
    .sort({ createdAt: 1 })
    .lean();

    const commentTree = buildCommentTree(comments);

    res.json(commentTree);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server fejl');
  }
});

function buildCommentTree(comments) {
  const commentMap = {};
  const roots = [];

  comments.forEach(comment => {
    comment.replies = [];
    commentMap[comment._id] = comment;
  });

  comments.forEach(comment => {
    if (comment.parentComment) {
      const parent = commentMap[comment.parentComment];
      if (parent) {
        parent.replies.push(comment);
      }
    } else {
      roots.push(comment);
    }
  });

  return roots;
}

router.post('/', [
  auth,
  body('content').isLength({ min: 1, max: 10000 }),
  body('threadId').not().isEmpty(),
  body('parentCommentId').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { content, threadId, parentCommentId } = req.body;

    const thread = await Thread.findById(threadId);
    if (!thread || thread.isDeleted) {
      return res.status(404).json({ msg: 'Tråd ikke fundet' });
    }

    if (thread.isLocked) {
      return res.status(403).json({ msg: 'Tråd er låst' });
    }

    const commentData = {
      content,
      author: req.user.id,
      thread: threadId
    };

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment || parentComment.isDeleted) {
        return res.status(404).json({ msg: 'Forældre kommentar ikke fundet' });
      }
      commentData.parentComment = parentCommentId;
    }

    const comment = new Comment(commentData);
    await comment.save();

    thread.commentCount += 1;
    thread.lastActivity = Date.now();
    await thread.save();

    await comment.populate('author', 'username avatar karma');

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server fejl');
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ msg: 'Kommentar ikke fundet' });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Ikke autoriseret' });
    }

    const { content } = req.body;

    if (!content || content.length < 1) {
      return res.status(400).json({ msg: 'Indhold er påkrævet' });
    }

    comment.content = content;
    await comment.save();

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server fejl');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ msg: 'Kommentar ikke fundet' });
    }

    const user = await User.findById(req.user.id);
    
    if (comment.author.toString() !== req.user.id && !user.isAdmin) {
      return res.status(403).json({ msg: 'Ikke autoriseret' });
    }

    comment.isDeleted = true;
    comment.content = '[Slettet]';
    await comment.save();

    const thread = await Thread.findById(comment.thread);
    if (thread) {
      thread.commentCount -= 1;
      await thread.save();
    }

    res.json({ msg: 'Kommentar slettet' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server fejl');
  }
});

module.exports = router;