'use strict';

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { query } = require('../config/db');

// ── Helper ────────────────────────────────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const [rows] = await query(
      'SELECT id, username, email, password_hash, role FROM users WHERE username = ? LIMIT 1',
      [username.trim()]
    );

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      }
    });
  } catch (err) {
    console.error('[authController.login]', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
async function getMe(req, res) {
  try {
    const [rows] = await query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[authController.getMe]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── PUT /api/auth/change-password ─────────────────────────────────────────────
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both currentPassword and newPassword are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    const [rows] = await query('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [req.user.id]);
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    const rounds  = Number(process.env.BCRYPT_ROUNDS) || 12;
    const newHash = await bcrypt.hash(newPassword, rounds);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('[authController.changePassword]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { login, getMe, changePassword };