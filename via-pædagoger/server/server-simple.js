const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db/inMemoryDb');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'hemmelignøgle123';

app.use(cors());
app.use(express.json());

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'Ingen token, adgang nægtet' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token er ikke gyldig' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Valider påkrævede felter
    if (!username || !email || !password) {
      return res.status(400).json({ msg: 'Brugernavn, email og password er påkrævet' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password skal være mindst 6 tegn' });
    }
    
    const existingUser = await db.findUserByEmail(email) || await db.findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ msg: 'Bruger eksisterer allerede' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.createUser({
      username, 
      email, 
      password: hashedPassword
    });
    
    const token = jwt.sign({ user: { id: user._id } }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username, email } });
  } catch (err) {
    res.status(500).json({ msg: 'Server fejl' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.findUserByUsername(username) || await db.findUserByEmail(username);
    
    if (!user) {
      return res.status(400).json({ msg: 'Ugyldige login oplysninger' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Ugyldige login oplysninger' });
    }
    
    const token = jwt.sign({ user: { id: user._id } }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { id: user._id, username: user.username, email: user.email, karma: user.karma }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server fejl' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  const user = await db.findUserById(req.user.id);
  if (!user) return res.status(404).json({ msg: 'Bruger ikke fundet' });
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Categories routes
app.get('/api/categories', async (req, res) => {
  const categories = await db.getCategories();
  res.json(categories);
});

app.get('/api/categories/:slug', async (req, res) => {
  const category = await db.getCategoryBySlug(req.params.slug);
  if (!category) return res.status(404).json({ msg: 'Kategori ikke fundet' });
  res.json(category);
});

// Threads routes
app.get('/api/threads', async (req, res) => {
  try {
    const { category, sort = 'hot', page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (category) {
      const cat = await db.getCategoryBySlug(category);
      if (cat) query.category = cat._id;
    }
    
    const threads = await db.getThreads({ ...query, sort });
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedThreads = threads.slice(startIndex, endIndex);
    
    res.json({
      threads: paginatedThreads,
      totalPages: Math.ceil(threads.length / limit),
      currentPage: parseInt(page),
      total: threads.length
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server fejl' });
  }
});

app.get('/api/threads/:id', async (req, res) => {
  const thread = await db.getThreadById(req.params.id);
  if (!thread) return res.status(404).json({ msg: 'Tråd ikke fundet' });
  await db.updateThread(req.params.id, { viewCount: thread.viewCount + 1 });
  res.json(thread);
});

app.post('/api/threads', auth, async (req, res) => {
  try {
    const { title, content, category, tags = [] } = req.body;
    
    const categoryExists = await db.getCategoryById(category);
    if (!categoryExists) {
      return res.status(400).json({ msg: 'Ugyldig kategori' });
    }
    
    const thread = await db.createThread({
      title, content, author: req.user.id, category, tags
    });
    
    const threadWithRelations = await db.getThreadById(thread._id);
    res.json(threadWithRelations);
  } catch (err) {
    res.status(500).json({ msg: 'Server fejl' });
  }
});

// Comments routes
app.get('/api/comments/thread/:threadId', async (req, res) => {
  const comments = await db.getCommentsByThread(req.params.threadId);
  
  // Build comment tree
  const commentMap = {};
  const roots = [];
  
  comments.forEach(comment => {
    comment.replies = [];
    commentMap[comment._id] = comment;
  });
  
  comments.forEach(comment => {
    if (comment.parentComment) {
      const parent = commentMap[comment.parentComment];
      if (parent) parent.replies.push(comment);
    } else {
      roots.push(comment);
    }
  });
  
  res.json(roots);
});

app.post('/api/comments', auth, async (req, res) => {
  try {
    const { content, threadId, parentCommentId } = req.body;
    
    const thread = await db.getThreadById(threadId);
    if (!thread) return res.status(404).json({ msg: 'Tråd ikke fundet' });
    
    const comment = await db.createComment({
      content,
      author: req.user.id,
      thread: threadId,
      parentComment: parentCommentId || null
    });
    
    const commentWithAuthor = {
      ...comment,
      author: await db.findUserById(comment.author)
    };
    
    res.json(commentWithAuthor);
  } catch (err) {
    res.status(500).json({ msg: 'Server fejl' });
  }
});

// Votes routes
app.post('/api/votes/thread/:id/:voteType', auth, async (req, res) => {
  const thread = await db.voteOnThread(req.params.id, req.user.id, req.params.voteType);
  if (!thread) return res.status(404).json({ msg: 'Tråd ikke fundet' });
  
  res.json({
    upvotes: thread.upvotes.length,
    downvotes: thread.downvotes.length,
    score: thread.score,
    userVote: thread.upvotes.includes(req.user.id) ? 'upvote' : 
              thread.downvotes.includes(req.user.id) ? 'downvote' : null
  });
});

app.post('/api/votes/comment/:id/:voteType', auth, async (req, res) => {
  const comment = await db.voteOnComment(req.params.id, req.user.id, req.params.voteType);
  if (!comment) return res.status(404).json({ msg: 'Kommentar ikke fundet' });
  
  res.json({
    upvotes: comment.upvotes.length,
    downvotes: comment.downvotes.length,
    score: comment.score,
    userVote: comment.upvotes.includes(req.user.id) ? 'upvote' : 
              comment.downvotes.includes(req.user.id) ? 'downvote' : null
  });
});

// Users routes
app.get('/api/users', async (req, res) => {
  const users = db.collections.users.map(u => {
    const { password, email, ...publicUser } = u;
    return publicUser;
  });
  res.json({ users, totalPages: 1, currentPage: 1, total: users.length });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║   VIA Pædagoger Forum er klar!     ║
╠════════════════════════════════════╣
║   Backend: http://localhost:${PORT}   ║
║   Frontend: http://localhost:3000  ║
╚════════════════════════════════════╝

Kører med in-memory database (data gemmes ikke)
`);
});