const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'Ingen token, adgang nægtet' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hemmelignøgle');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token er ikke gyldig' });
  }
};

const optionalAuth = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hemmelignøgle');
    req.user = decoded.user;
    next();
  } catch (err) {
    next();
  }
};

module.exports = { auth, optionalAuth };