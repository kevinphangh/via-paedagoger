const express = require('express');
const router = express.Router();
const Thread = require('../models/Thread');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

router.post('/thread/:id/:voteType', auth, async (req, res) => {
  try {
    const { id, voteType } = req.params;
    
    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ msg: 'Ugyldig stem type' });
    }

    const thread = await Thread.findById(id);
    if (!thread || thread.isDeleted) {
      return res.status(404).json({ msg: 'Tråd ikke fundet' });
    }

    const userId = req.user.id;
    const hasUpvoted = thread.upvotes.includes(userId);
    const hasDownvoted = thread.downvotes.includes(userId);

    if (voteType === 'upvote') {
      if (hasUpvoted) {
        thread.upvotes = thread.upvotes.filter(id => id.toString() !== userId);
      } else {
        if (hasDownvoted) {
          thread.downvotes = thread.downvotes.filter(id => id.toString() !== userId);
        }
        thread.upvotes.push(userId);
        
        const author = await User.findById(thread.author);
        if (author) {
          await author.updateKarma(1);
        }
      }
    } else {
      if (hasDownvoted) {
        thread.downvotes = thread.downvotes.filter(id => id.toString() !== userId);
      } else {
        if (hasUpvoted) {
          thread.upvotes = thread.upvotes.filter(id => id.toString() !== userId);
        }
        thread.downvotes.push(userId);
        
        const author = await User.findById(thread.author);
        if (author) {
          await author.updateKarma(-1);
        }
      }
    }

    await thread.save();

    res.json({
      upvotes: thread.upvotes.length,
      downvotes: thread.downvotes.length,
      score: thread.score,
      userVote: thread.upvotes.includes(userId) ? 'upvote' : 
                thread.downvotes.includes(userId) ? 'downvote' : null
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server fejl');
  }
});

router.post('/comment/:id/:voteType', auth, async (req, res) => {
  try {
    const { id, voteType } = req.params;
    
    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ msg: 'Ugyldig stem type' });
    }

    const comment = await Comment.findById(id);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ msg: 'Kommentar ikke fundet' });
    }

    const userId = req.user.id;
    const hasUpvoted = comment.upvotes.includes(userId);
    const hasDownvoted = comment.downvotes.includes(userId);

    if (voteType === 'upvote') {
      if (hasUpvoted) {
        comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId);
      } else {
        if (hasDownvoted) {
          comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId);
        }
        comment.upvotes.push(userId);
        
        const author = await User.findById(comment.author);
        if (author) {
          await author.updateKarma(1);
        }
      }
    } else {
      if (hasDownvoted) {
        comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId);
      } else {
        if (hasUpvoted) {
          comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId);
        }
        comment.downvotes.push(userId);
        
        const author = await User.findById(comment.author);
        if (author) {
          await author.updateKarma(-1);
        }
      }
    }

    await comment.save();

    res.json({
      upvotes: comment.upvotes.length,
      downvotes: comment.downvotes.length,
      score: comment.score,
      userVote: comment.upvotes.includes(userId) ? 'upvote' : 
                comment.downvotes.includes(userId) ? 'downvote' : null
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server fejl');
  }
});

module.exports = router;