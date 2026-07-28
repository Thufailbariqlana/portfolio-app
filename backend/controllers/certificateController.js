'use strict';

const { query, buildSetClause } = require('../config/db');

// Extension fields added by migration v3 (may not exist in DB yet)
const EXT_FIELDS = ['name_id'];

// ── GET /api/certificates ─────────────────────────────────────────────────────
async function getAll(req, res) {
  try {
    const rows = await query('SELECT * FROM certificates ORDER BY sort_order ASC, issue_date DESC');
    return res.status(200).json({ success: true, data: Array.isArray(rows) ? rows : [] });
  } catch (err) {
    console.error('[certificateController.getAll]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── GET /api/certificates/:id ─────────────────────────────────────────────────
async function getOne(req, res) {
  try {
    const rows = await query('SELECT * FROM certificates WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[certificateController.getOne]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── POST /api/certificates ────────────────────────────────────────────────────
async function create(req, res) {
  try {
    const { name, name_id, issuer, issue_date, expiry_date, credential_id, credential_url, sort_order } = req.body || {};

    if (!name || !issuer || !issue_date) {
      return res.status(400).json({ success: false, message: 'name, issuer, and issue_date are required.' });
    }

    const image_url = req.file ? (req.file.path || req.file.secure_url || req.file.filename || '') : '';

    // Base columns — always present
    const baseData = {
      name, issuer, issue_date,
      expiry_date:    expiry_date    || null,
      credential_id:  credential_id  || '',
      credential_url: credential_url || '',
      image_url,
      sort_order: sort_order ? parseInt(sort_order, 10) : 0
    };

    // Extension columns — only include if provided
    const extData = {};
    if (name_id !== undefined) extData.name_id = name_id || '';

    let insertId;

    try {
      const data = { ...baseData, ...extData };
      const cols = Object.keys(data).map(k => `\`${k}\``).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const result = await query(
        `INSERT INTO certificates (${cols}) VALUES (${placeholders})`,
        Object.values(data)
      );
      insertId = result.insertId;
    } catch (dbErr) {
      if (dbErr.code === 'ER_BAD_FIELD_ERROR') {
        const cols = Object.keys(baseData).map(k => `\`${k}\``).join(', ');
        const placeholders = Object.keys(baseData).map(() => '?').join(', ');
        const result = await query(
          `INSERT INTO certificates (${cols}) VALUES (${placeholders})`,
          Object.values(baseData)
        );
        insertId = result.insertId;
      } else {
        throw dbErr;
      }
    }

    const created = await query('SELECT * FROM certificates WHERE id = ? LIMIT 1', [insertId]);
    return res.status(201).json({
      success: true,
      message: 'Certificate created successfully.',
      data: Array.isArray(created) ? created[0] : created || null
    });
  } catch (err) {
    console.error('[certificateController.create]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── PUT /api/certificates/:id ─────────────────────────────────────────────────
async function update(req, res) {
  try {
    const existing = await query('SELECT id FROM certificates WHERE id = ? LIMIT 1', [req.params.id]);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    const baseAllowed = ['name', 'issuer', 'issue_date', 'expiry_date', 'credential_id', 'credential_url', 'sort_order'];
    const data = {};
    [...baseAllowed, ...EXT_FIELDS].forEach(f => {
      if (req.body && req.body[f] !== undefined) data[f] = req.body[f];
    });

    if (req.file) {
      data.image_url = req.file.path || req.file.secure_url || req.file.filename;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
    }

    try {
      const { clause, values } = buildSetClause(data);
      await query(`UPDATE certificates SET ${clause} WHERE id = ?`, [...values, req.params.id]);
    } catch (dbErr) {
      if (dbErr.code === 'ER_BAD_FIELD_ERROR') {
        EXT_FIELDS.forEach(f => delete data[f]);
        if (Object.keys(data).length === 0) {
          return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
        }
        const { clause, values } = buildSetClause(data);
        await query(`UPDATE certificates SET ${clause} WHERE id = ?`, [...values, req.params.id]);
      } else {
        throw dbErr;
      }
    }

    const updated = await query('SELECT * FROM certificates WHERE id = ? LIMIT 1', [req.params.id]);
    return res.status(200).json({
      success: true,
      message: 'Certificate updated successfully.',
      data: Array.isArray(updated) ? updated[0] : updated || null
    });
  } catch (err) {
    console.error('[certificateController.update]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── DELETE /api/certificates/:id/image — clear image_url only ────────────────
async function removeImage(req, res) {
  try {
    const existing = await query('SELECT id FROM certificates WHERE id = ? LIMIT 1', [req.params.id]);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }
    await query('UPDATE certificates SET image_url = ? WHERE id = ?', ['', req.params.id]);
    return res.status(200).json({ success: true, message: 'Certificate image removed.' });
  } catch (err) {
    console.error('[certificateController.removeImage]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── DELETE /api/certificates/:id ──────────────────────────────────────────────
async function remove(req, res) {
  try {
    const existing = await query('SELECT id FROM certificates WHERE id = ? LIMIT 1', [req.params.id]);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }
    await query('DELETE FROM certificates WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Certificate deleted successfully.' });
  } catch (err) {
    console.error('[certificateController.remove]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getAll, getOne, create, update, remove, removeImage };
