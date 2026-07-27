'use strict';

const { query, buildSetClause } = require('../config/db');

// Extension fields added by migration v3 (may not exist in DB yet)
const EXT_FIELDS = ['position_id', 'description_id'];

// ── GET /api/experiences ──────────────────────────────────────────────────────
async function getAll(req, res) {
  try {
    const rows = await query('SELECT * FROM experiences ORDER BY sort_order ASC, start_date DESC');
    return res.status(200).json({ success: true, data: Array.isArray(rows) ? rows : [] });
  } catch (err) {
    console.error('[experienceController.getAll]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── GET /api/experiences/:id ──────────────────────────────────────────────────
async function getOne(req, res) {
  try {
    const rows = await query('SELECT * FROM experiences WHERE id = ? LIMIT 1', [req.params.id]);
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
    const { company, position, position_id, location, start_date, end_date, is_current, description, description_id, tech_stack, sort_order } = req.body;

    if (!company || !position || !start_date) {
      return res.status(400).json({ success: false, message: 'company, position, and start_date are required.' });
    }

    // Base columns — always present
    const baseData = {
      company, position,
      location:    location    || '',
      start_date,
      end_date:    end_date    || null,
      is_current:  is_current  ? 1 : 0,
      description: description || '',
      tech_stack:  tech_stack  || '',
      sort_order:  sort_order  || 0
    };

    // Extension columns — only include if provided
    const extData = {};
    if (position_id    !== undefined) extData.position_id    = position_id    || '';
    if (description_id !== undefined) extData.description_id = description_id || '';

    let insertId;

    try {
      const data = { ...baseData, ...extData };
      const cols = Object.keys(data).map(k => `\`${k}\``).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const result = await query(
        `INSERT INTO experiences (${cols}) VALUES (${placeholders})`,
        Object.values(data)
      );
      insertId = result.insertId;
    } catch (dbErr) {
      if (dbErr.code === 'ER_BAD_FIELD_ERROR') {
        const cols = Object.keys(baseData).map(k => `\`${k}\``).join(', ');
        const placeholders = Object.keys(baseData).map(() => '?').join(', ');
        const result = await query(
          `INSERT INTO experiences (${cols}) VALUES (${placeholders})`,
          Object.values(baseData)
        );
        insertId = result.insertId;
      } else {
        throw dbErr;
      }
    }

    const created = await query('SELECT * FROM experiences WHERE id = ? LIMIT 1', [insertId]);
    return res.status(201).json({
      success: true,
      message: 'Experience created.',
      data: Array.isArray(created) ? created[0] : null
    });
  } catch (err) {
    console.error('[experienceController.create]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── PUT /api/experiences/:id ──────────────────────────────────────────────────
async function update(req, res) {
  try {
    const existing = await query('SELECT id FROM experiences WHERE id = ? LIMIT 1', [req.params.id]);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Experience not found.' });
    }

    const baseAllowed = ['company', 'position', 'location', 'start_date', 'end_date', 'is_current', 'description', 'tech_stack', 'sort_order'];
    const data = {};
    [...baseAllowed, ...EXT_FIELDS].forEach(f => {
      if (req.body[f] !== undefined) data[f] = req.body[f];
    });

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided.' });
    }

    try {
      const { clause, values } = buildSetClause(data);
      await query(`UPDATE experiences SET ${clause} WHERE id = ?`, [...values, req.params.id]);
    } catch (dbErr) {
      if (dbErr.code === 'ER_BAD_FIELD_ERROR') {
        EXT_FIELDS.forEach(f => delete data[f]);
        if (Object.keys(data).length === 0) {
          return res.status(400).json({ success: false, message: 'No valid fields provided.' });
        }
        const { clause, values } = buildSetClause(data);
        await query(`UPDATE experiences SET ${clause} WHERE id = ?`, [...values, req.params.id]);
      } else {
        throw dbErr;
      }
    }

    const updated = await query('SELECT * FROM experiences WHERE id = ? LIMIT 1', [req.params.id]);
    return res.status(200).json({
      success: true,
      message: 'Experience updated.',
      data: Array.isArray(updated) ? updated[0] : null
    });
  } catch (err) {
    console.error('[experienceController.update]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── DELETE /api/experiences/:id ───────────────────────────────────────────────
async function remove(req, res) {
  try {
    const existing = await query('SELECT id FROM experiences WHERE id = ? LIMIT 1', [req.params.id]);
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
