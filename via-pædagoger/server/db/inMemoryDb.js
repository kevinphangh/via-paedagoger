// In-memory database til test uden MongoDB
class InMemoryDB {
  constructor() {
    this.collections = {
      users: [],
      categories: [],
      threads: [],
      comments: []
    };
    this.initializeDefaultData();
  }

  initializeDefaultData() {
    // Opret standard kategorier
    this.collections.categories = [
      {
        _id: '1',
        name: 'Generelt',
        description: 'Generelle diskussioner om pædagoguddannelsen',
        slug: 'generelt',
        color: '#3498db',
        threadCount: 0,
        isActive: true,
        createdAt: new Date()
      },
      {
        _id: '2',
        name: 'Praktik',
        description: 'Alt om praktikperioder og erfaringer',
        slug: 'praktik',
        color: '#27ae60',
        threadCount: 0,
        isActive: true,
        createdAt: new Date()
      },
      {
        _id: '3',
        name: 'Eksamen',
        description: 'Hjælp og tips til eksamener',
        slug: 'eksamen',
        color: '#e74c3c',
        threadCount: 0,
        isActive: true,
        createdAt: new Date()
      },
      {
        _id: '4',
        name: 'Studieliv',
        description: 'Det sociale liv på VIA',
        slug: 'studieliv',
        color: '#f39c12',
        threadCount: 0,
        isActive: true,
        createdAt: new Date()
      }
    ];
  }

  // User methods
  async createUser(userData) {
    const user = {
      _id: Date.now().toString(),
      ...userData,
      karma: 0,
      isVerified: false,
      isAdmin: false,
      createdAt: new Date(),
      lastActive: new Date()
    };
    this.collections.users.push(user);
    return user;
  }

  async findUserByEmail(email) {
    return this.collections.users.find(u => u.email === email);
  }

  async findUserByUsername(username) {
    return this.collections.users.find(u => u.username === username);
  }

  async findUserById(id) {
    return this.collections.users.find(u => u._id === id);
  }

  // Category methods
  async getCategories() {
    return this.collections.categories;
  }

  async getCategoryBySlug(slug) {
    return this.collections.categories.find(c => c.slug === slug);
  }

  async getCategoryById(id) {
    return this.collections.categories.find(c => c._id === id);
  }

  // Thread methods
  async createThread(threadData) {
    const thread = {
      _id: Date.now().toString(),
      ...threadData,
      upvotes: [],
      downvotes: [],
      score: 0,
      commentCount: 0,
      viewCount: 0,
      isPinned: false,
      isLocked: false,
      isDeleted: false,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.collections.threads.push(thread);
    
    // Update category thread count
    const category = this.collections.categories.find(c => c._id === threadData.category);
    if (category) {
      category.threadCount++;
    }
    
    return thread;
  }

  async getThreads(query = {}) {
    let threads = this.collections.threads.filter(t => !t.isDeleted);
    
    if (query.category) {
      threads = threads.filter(t => t.category === query.category);
    }
    
    // Add author and category info
    threads = threads.map(thread => ({
      ...thread,
      author: this.collections.users.find(u => u._id === thread.author),
      category: this.collections.categories.find(c => c._id === thread.category)
    }));
    
    // Sort
    if (query.sort === 'new') {
      threads.sort((a, b) => b.createdAt - a.createdAt);
    } else if (query.sort === 'top') {
      threads.sort((a, b) => b.score - a.score);
    } else {
      threads.sort((a, b) => b.lastActivity - a.lastActivity);
    }
    
    return threads;
  }

  async getThreadById(id) {
    const thread = this.collections.threads.find(t => t._id === id);
    if (!thread) return null;
    
    return {
      ...thread,
      author: this.collections.users.find(u => u._id === thread.author),
      category: this.collections.categories.find(c => c._id === thread.category)
    };
  }

  async updateThread(id, updates) {
    const thread = this.collections.threads.find(t => t._id === id);
    if (thread) {
      Object.assign(thread, updates);
      thread.updatedAt = new Date();
    }
    return thread;
  }

  // Comment methods
  async createComment(commentData) {
    const comment = {
      _id: Date.now().toString(),
      ...commentData,
      upvotes: [],
      downvotes: [],
      score: 0,
      isDeleted: false,
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.collections.comments.push(comment);
    
    // Update thread comment count
    const thread = this.collections.threads.find(t => t._id === commentData.thread);
    if (thread) {
      thread.commentCount++;
      thread.lastActivity = new Date();
    }
    
    return comment;
  }

  async getCommentsByThread(threadId) {
    const comments = this.collections.comments.filter(
      c => c.thread === threadId && !c.isDeleted
    );
    
    // Add author info
    return comments.map(comment => ({
      ...comment,
      author: this.collections.users.find(u => u._id === comment.author)
    }));
  }

  // Vote methods
  async voteOnThread(threadId, userId, voteType) {
    const thread = this.collections.threads.find(t => t._id === threadId);
    if (!thread) return null;
    
    const upvoteIndex = thread.upvotes.indexOf(userId);
    const downvoteIndex = thread.downvotes.indexOf(userId);
    
    if (voteType === 'upvote') {
      if (upvoteIndex > -1) {
        thread.upvotes.splice(upvoteIndex, 1);
      } else {
        if (downvoteIndex > -1) {
          thread.downvotes.splice(downvoteIndex, 1);
        }
        thread.upvotes.push(userId);
      }
    } else {
      if (downvoteIndex > -1) {
        thread.downvotes.splice(downvoteIndex, 1);
      } else {
        if (upvoteIndex > -1) {
          thread.upvotes.splice(upvoteIndex, 1);
        }
        thread.downvotes.push(userId);
      }
    }
    
    thread.score = thread.upvotes.length - thread.downvotes.length;
    return thread;
  }

  async voteOnComment(commentId, userId, voteType) {
    const comment = this.collections.comments.find(c => c._id === commentId);
    if (!comment) return null;
    
    const upvoteIndex = comment.upvotes.indexOf(userId);
    const downvoteIndex = comment.downvotes.indexOf(userId);
    
    if (voteType === 'upvote') {
      if (upvoteIndex > -1) {
        comment.upvotes.splice(upvoteIndex, 1);
      } else {
        if (downvoteIndex > -1) {
          comment.downvotes.splice(downvoteIndex, 1);
        }
        comment.upvotes.push(userId);
      }
    } else {
      if (downvoteIndex > -1) {
        comment.downvotes.splice(downvoteIndex, 1);
      } else {
        if (upvoteIndex > -1) {
          comment.upvotes.splice(upvoteIndex, 1);
        }
        comment.downvotes.push(userId);
      }
    }
    
    comment.score = comment.upvotes.length - comment.downvotes.length;
    return comment;
  }
}

module.exports = new InMemoryDB();