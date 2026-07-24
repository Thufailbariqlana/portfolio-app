'use strict';

const { query, buildSetClause } = require('../config/db');

// ── GET /api/experiences ──────────────────────────────────────────────────────
async function getAll(req, res) {
  try {
    const [rows] = await query('SELECT * FROM experiences ORDER BY sort_order ASC, start_date DESC');
    return res.status(200).json({ success: true, data: Array.isArray(rows) ? rows : [] });
  } catch (err) {
    console.error('[experienceController.getAll]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── GET /api/experiences/:id ──────────────────────────────────────────────────
async function getOne(req, res) {
  try {
    const [rows] = await query('SELECT * FROM experiences WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Experience not found.' });
    }
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[experienceController.getOne]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── POST /api/experiences ─────────────────────────────────────────────────────
async function create(req, res) {
  try {
    const { company, position, location, start_date, end_date, is_current, description, tech_stack, sort_order } = req.body;

    if (!company || !position || !start_date) {
      return res.status(400).json({ success: false, message: 'company, position, and start_date are required.' });
    }

    const [result] = await query(
      `INSERT INTO experiences (company, position, location, start_date, end_date, is_current, description, tech_stack, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company,
        position,
        location    || '',
        start_date,
        end_date    || null,
        is_current  ? 1 : 0,
        description || '',
        tech_stack  || '',
        sort_order  || 0
      ]
    );

    const [created] = await query('SELECT * FROM experiences WHERE id = ? LIMIT 1', [result.insertId]);
    return res.status(201).json({ success: true, message: 'Experience created.', data: created[0] });
  } catch (err) {
    console.error('[experienceController.create]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── PUT /api/experiences/:id ──────────────────────────────────────────────────
async function update(req, res) {
  try {
    const [existing] = await query('SELECT id FROM experiences WHERE id = ? LIMIT 1', [req.params.id]);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Experience not found.' });
    }

    const allowed = ['company','position','location','start_date','end_date','is_current','description','tech_stack','sort_order'];
    const data = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) data[f] = req.body[f]; });

    if (Object.keys(data).length === 0) return res.status(400).json({ success: false, message: 'No valid fields provided.' });

    const { clause, values } = buildSetClause(data);
    await query(`UPDATE experiences SET ${clause} WHERE id = ?`, [...values, req.params.id]);

    const [updated] = await query('SELECT * FROM experiences WHERE id = ? LIMIT 1', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Experience updated.', data: updated[0] });
  } catch (err) {
    console.error('[experienceController.update]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── DELETE /api/experiences/:id ───────────────────────────────────────────────
async function remove(req, res) {
  try {
    const [existing] = await query('SELECT id FROM experiences WHERE id = ? LIMIT 1', [req.params.id]);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Experience not found.' });
    }

    await query('DELETE FROM experiences WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Experience deleted.' });
  } catch (err) {
    console.error('[experienceController.remove]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getAll, getOne, create, update, remove, getExperiences: getAll };