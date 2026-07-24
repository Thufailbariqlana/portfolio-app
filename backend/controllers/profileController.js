'use strict';

const path = require('path');
const fs   = require('fs');
const { query, buildSetClause } = require('../config/db');

// ── GET /api/profile ──────────────────────────────────────────────────────────
async function getProfile(req, res) {
  try {
    const [rows] = await query('SELECT * FROM profile WHERE id = 1 LIMIT 1');

    // Validasi aman jika data kosong / tidak ditemukan
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'Data profile belum diatur.'
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error('[profileController.getProfile]', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data profil',
      error: err.message
    });
  }
}

// ── PUT /api/profile ──────────────────────────────────────────────────────────
async function updateProfile(req, res) {
  try {
    const allowed = [
      'full_name','title','bio','email','phone','location',
      'website','github_url','linkedin_url','twitter_url',
      'years_of_exp','open_to_work'
    ];

    const data = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    });

    // Handle photo upload
    if (req.file && req.fileType === 'photo') {
      // Delete old photo if exists
      const [oldRows] = await query('SELECT photo_url FROM profile WHERE id = 1 LIMIT 1');
      if (oldRows && oldRows.length && oldRows[0].photo_url) {
        const oldPath = path.join(__dirname, '..', oldRows[0].photo_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.photo_url = `/uploads/photos/${req.file.filename}`;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided.' });
    }

    const { clause, values } = buildSetClause(data);
    await query(`UPDATE profile SET ${clause} WHERE id = 1`, values);

    const [updated] = await query('SELECT * FROM profile WHERE id = 1 LIMIT 1');
    return res.status(200).json({ success: true, message: 'Profile updated.', data: updated[0] });
  } catch (err) {
    console.error('[profileController.updateProfile]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── POST /api/profile/photo ───────────────────────────────────────────────────
async function uploadPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo file provided.' });
    }

    const [oldRows] = await query('SELECT photo_url FROM profile WHERE id = 1 LIMIT 1');
    if (oldRows && oldRows.length && oldRows[0].photo_url) {
      const oldPath = path.join(__dirname, '..', oldRows[0].photo_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const photo_url = `/uploads/photos/${req.file.filename}`;
    await query('UPDATE profile SET photo_url = ? WHERE id = 1', [photo_url]);

    return res.status(200).json({ success: true, message: 'Photo uploaded.', data: { photo_url } });
  } catch (err) {
    console.error('[profileController.uploadPhoto]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── POST /api/profile/cv ──────────────────────────────────────────────────────
async function uploadCV(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CV file provided.' });
    }

    const [oldRows] = await query('SELECT cv_url FROM profile WHERE id = 1 LIMIT 1');
    if (oldRows && oldRows.length && oldRows[0].cv_url) {
      const oldPath = path.join(__dirname, '..', oldRows[0].cv_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const cv_url = `/uploads/photos/${req.file.filename}`;
    await query('UPDATE profile SET cv_url = ? WHERE id = 1', [cv_url]);

    return res.status(200).json({ success: true, message: 'CV uploaded.', data: { cv_url } });
  } catch (err) {
    console.error('[profileController.uploadCV]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getProfile, updateProfile, uploadPhoto, uploadCV };