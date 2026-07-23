'use strict';

const path = require('path');
const fs   = require('fs');
const { query, buildSetClause } = require('../config/db');

// ── GET /api/certificates ─────────────────────────────────────────────────────
async function getAll(req, res) {
  try {
    const [rows] = await query('SELECT * FROM certificates ORDER BY sort_order ASC, issue_date DESC');
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('[certificateController.getAll]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── GET /api/certificates/:id ─────────────────────────────────────────────────
async function getOne(req, res) {
  try {
    const [rows] = await query('SELECT * FROM certificates WHERE id = ? LIMIT 1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Certificate not found.' });
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[certificateController.getOne]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── POST /api/certificates ────────────────────────────────────────────────────
async function create(req, res) {
  try {
    const { name, issuer, issue_date, expiry_date, credential_id, credential_url, sort_order } = req.body;

    if (!name || !issuer || !issue_date) {
      return res.status(400).json({ success: false, message: 'name, issuer, and issue_date are required.' });
    }

    const image_url = req.file ? `/uploads/certificates/${req.file.filename}` : '';

    const [result] = await query(
      `INSERT INTO certificates (name, issuer, issue_date, expiry_date, credential_id, credential_url, image_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        issuer,
        issue_date,
        expiry_date    || null,
        credential_id  || '',
        credential_url || '',
        image_url,
        sort_order     || 0
      ]
    );

    const [created] = await query('SELECT * FROM certificates WHERE id = ? LIMIT 1', [result.insertId]);
    return res.status(201).json({ success: true, message: 'Certificate created.', data: created[0] });
  } catch (err) {
    console.error('[certificateController.create]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── PUT /api/certificates/:id ─────────────────────────────────────────────────
async function update(req, res) {
  try {
    const [existing] = await query('SELECT * FROM certificates WHERE id = ? LIMIT 1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Certificate not found.' });

    const allowed = ['name','issuer','issue_date','expiry_date','credential_id','credential_url','sort_order'];
    const data = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) data[f] = req.body[f]; });

    if (req.file) {
      if (existing[0].image_url) {
        const oldPath = path.join(__dirname, '..', existing[0].image_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.image_url = `/uploads/certificates/${req.file.filename}`;
    }

    if (Object.keys(data).length === 0) return res.status(400).json({ success: false, message: 'No valid fields provided.' });

    const { clause, values } = buildSetClause(data);
    await query(`UPDATE certificates SET ${clause} WHERE id = ?`, [...values, req.params.id]);

    const [updated] = await query('SELECT * FROM certificates WHERE id = ? LIMIT 1', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Certificate updated.', data: updated[0] });
  } catch (err) {
    console.error('[certificateController.update]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── DELETE /api/certificates/:id ──────────────────────────────────────────────
async function remove(req, res) {
  try {
    const [existing] = await query('SELECT * FROM certificates WHERE id = ? LIMIT 1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Certificate not found.' });

    if (existing[0].image_url) {
      const imgPath = path.join(__dirname, '..', existing[0].image_url);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await query('DELETE FROM certificates WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Certificate deleted.' });
  } catch (err) {
    console.error('[certificateController.remove]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getAll, getOne, create, update, remove };
