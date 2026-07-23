'use strict';

const { query, buildSetClause } = require('../config/db');

// ── GET /api/education ────────────────────────────────────────────────────────
async function getAll(req, res) {
  try {
    const [rows] = await query('SELECT * FROM education ORDER BY sort_order ASC, start_year DESC');
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('[educationController.getAll]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── GET /api/education/:id ────────────────────────────────────────────────────
async function getOne(req, res) {
  try {
    const [rows] = await query('SELECT * FROM education WHERE id = ? LIMIT 1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Education record not found.' });
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[educationController.getOne]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── POST /api/education ───────────────────────────────────────────────────────
async function create(req, res) {
  try {
    const { institution, degree, field_of_study, start_year, end_year, is_current, gpa, description, sort_order } = req.body;

    if (!institution || !degree || !start_year) {
      return res.status(400).json({ success: false, message: 'institution, degree, and start_year are required.' });
    }

    const [result] = await query(
      `INSERT INTO education (institution, degree, field_of_study, start_year, end_year, is_current, gpa, description, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        institution,
        degree,
        field_of_study || '',
        start_year,
        end_year       || null,
        is_current     ? 1 : 0,
        gpa            || null,
        description    || '',
        sort_order     || 0
      ]
    );

    const [created] = await query('SELECT * FROM education WHERE id = ? LIMIT 1', [result.insertId]);
    return res.status(201).json({ success: true, message: 'Education record created.', data: created[0] });
  } catch (err) {
    console.error('[educationController.create]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── PUT /api/education/:id ────────────────────────────────────────────────────
async function update(req, res) {
  try {
    const [existing] = await query('SELECT id FROM education WHERE id = ? LIMIT 1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Education record not found.' });

    const allowed = ['institution','degree','field_of_study','start_year','end_year','is_current','gpa','description','sort_order'];
    const data = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) data[f] = req.body[f]; });

    if (Object.keys(data).length === 0) return res.status(400).json({ success: false, message: 'No valid fields provided.' });

    const { clause, values } = buildSetClause(data);
    await query(`UPDATE education SET ${clause} WHERE id = ?`, [...values, req.params.id]);

    const [updated] = await query('SELECT * FROM education WHERE id = ? LIMIT 1', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Education record updated.', data: updated[0] });
  } catch (err) {
    console.error('[educationController.update]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── DELETE /api/education/:id ─────────────────────────────────────────────────
async function remove(req, res) {
  try {
    const [existing] = await query('SELECT id FROM education WHERE id = ? LIMIT 1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Education record not found.' });

    await query('DELETE FROM education WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Education record deleted.' });
  } catch (err) {
    console.error('[educationController.remove]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getAll, getOne, create, update, remove };
