'use strict';

const jwt = require('jsonwebtoken');

// Pastikan JWT_SECRET ada — jika tidak, semua verify akan gagal dengan pesan jelas
if (!process.env.JWT_SECRET) {
  console.error('[authMiddleware] FATAL: JWT_SECRET env variable is not set!');
}

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'Server configuration error: JWT_SECRET missing.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    console.error('[authMiddleware] Token verification failed:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token is invalid or expired' });
  }
};

module.exports = { protect };