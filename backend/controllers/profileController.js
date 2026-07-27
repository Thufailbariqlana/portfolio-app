'use strict';

const { query, buildSetClause } = require('../config/db');

// Helper untuk memastikan record id = 1 selalu ada
async function ensureProfileExists() {
  const rows = await query('SELECT id FROM profile WHERE id = 1 LIMIT 1');
  if (!rows || rows.length === 0) {
    await query('INSERT INTO profile (id) VALUES (1)');
  }
}

// ── GET /api/profile ──────────────────────────────────────────────────────────
async function getProfile(req, res) {
  try {
    const rows = await query('SELECT * FROM profile WHERE id = 1 LIMIT 1');

    if (!rows || rows.length === 0) {
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
    await ensureProfileExists();

    const allowed = [
      'full_name', 'title', 'title_id', 'bio', 'bio_id',
      'email', 'phone', 'location',
      'website', 'github_url', 'linkedin_url', 'twitter_url',
      'instagram_url', 'facebook_url', 'youtube_url',
      'years_of_exp', 'open_to_work'
    ];

    const data = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    });

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided.' });
    }

    const { clause, values } = buildSetClause(data);
    await query(`UPDATE profile SET ${clause} WHERE id = 1`, values);

    const updated = await query('SELECT * FROM profile WHERE id = 1 LIMIT 1');
    return res.status(200).json({
      success: true,
      message: 'Profile updated.',
      data: updated[0]
    });
  } catch (err) {
    console.error('[profileController.updateProfile]', err);
    return res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
}

// ── POST /api/profile/photo ───────────────────────────────────────────────────
async function uploadPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo file provided.' });
    }

    await ensureProfileExists();

    // URL publik dari Cloudinary yang sudah diproses oleh middleware
    const photo_url = req.file.path; 
    await query('UPDATE profile SET photo_url = ? WHERE id = 1', [photo_url]);

    return res.status(200).json({ success: true, message: 'Photo uploaded.', data: { photo_url } });
  } catch (err) {
    console.error('[profileController.uploadPhoto]', err);
    return res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
}

// ── POST /api/profile/cv ──────────────────────────────────────────────────────
async function uploadCV(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CV file provided.' });
    }

    await ensureProfileExists();

    // URL publik dari Cloudinary yang sudah diproses oleh middleware
    const cv_url = req.file.path;
    await query('UPDATE profile SET cv_url = ? WHERE id = 1', [cv_url]);

    return res.status(200).json({ success: true, message: 'CV uploaded.', data: { cv_url } });
  } catch (err) {
    console.error('[profileController.uploadCV]', err);
    return res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
}

module.exports = { getProfile, updateProfile, uploadPhoto, uploadCV };