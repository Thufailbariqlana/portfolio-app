'use strict';

const { query, buildSetClause } = require('../config/db');

// Extension fields added by migration v3 (may not exist in DB yet)
const EXT_FIELDS = ['degree_id', 'field_of_study_id', 'description_id'];

// ── GET /api/education ────────────────────────────────────────────────────────
async function getAll(req, res) {
  try {
    const rows = await query('SELECT * FROM education ORDER BY sort_order ASC, start_year DESC');
    return res.status(200).json({ success: true, data: Array.isArray(rows) ? rows : [] });
  } catch (err) {
    console.error('[educationController.getAll]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── GET /api/education/:id ────────────────────────────────────────────────────
async function getOne(req, res) {
  try {
    const rows = await query('SELECT * FROM education WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Education record not found.' });
    }
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[educationController.getOne]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── POST /api/education ───────────────────────────────────────────────────────
async function create(req, res) {
  try {
    const {
      institution, degree, degree_id, field_of_study, field_of_study_id,
      start_year, end_year, is_current, gpa, description, description_id, sort_order
    } = req.body;

    if (!institution || !degree || !start_year) {
      return res.status(400).json({ success: false, message: 'institution, degree, and start_year are required.' });
    }

    // Base columns — always present
    const baseData = {
      institution, degree,
      field_of_study: field_of_study || '',
      start_year,
      end_year:       end_year       || null,
      is_current:     is_current     ? 1 : 0,
      gpa:            gpa            || null,
      description:    description    || '',
      sort_order:     sort_order     || 0
    };

    // Extension columns — only include if provided
    const extData = {};
    if (degree_id         !== undefined) extData.degree_id         = degree_id         || '';
    if (field_of_study_id !== undefined) extData.field_of_study_id = field_of_study_id || '';
    if (description_id    !== undefined) extData.description_id    = description_id    || '';

    let insertId;

    try {
      const data = { ...baseData, ...extData };
      const cols = Object.keys(data).map(k => `\`${k}\``).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const result = await query(
        `INSERT INTO education (${cols}) VALUES (${placeholders})`,
        Object.values(data)
      );
      insertId = result.insertId;
    } catch (dbErr) {
      if (dbErr.code === 'ER_BAD_FIELD_ERROR') {
        const cols = Object.keys(baseData).map(k => `\`${k}\``).join(', ');
        const placeholders = Object.keys(baseData).map(() => '?').join(', ');
        const result = await query(
          `INSERT INTO education (${cols}) VALUES (${placeholders})`,
          Object.values(baseData)
        );
        insertId = result.insertId;
      } else {
        throw dbErr;
      }
    }

    if (!insertId) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve inserted record ID.' });
    }

    const created = await query('SELECT * FROM education WHERE id = ? LIMIT 1', [insertId]);
    return res.status(201).json({
      success: true,
      message: 'Education record created.',
      data: Array.isArray(created) ? created[0] : created
    });
  } catch (err) {
    console.error('[educationController.create]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── PUT /api/education/:id ────────────────────────────────────────────────────
async function update(req, res) {
  try {
    const existing = await query('SELECT id FROM education WHERE id = ? LIMIT 1', [req.params.id]);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Education record not found.' });
    }

    const baseAllowed = ['institution', 'degree', 'field_of_study', 'start_year', 'end_year', 'is_current', 'gpa', 'description', 'sort_order'];
    const data = {};
    [...baseAllowed, ...EXT_FIELDS].forEach(f => {
      if (req.body[f] !== undefined) data[f] = req.body[f];
    });

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided.' });
    }

    try {
      const { clause, values } = buildSetClause(data);
      await query(`UPDATE education SET ${clause} WHERE id = ?`, [...values, req.params.id]);
    } catch (dbErr) {
      if (dbErr.code === 'ER_BAD_FIELD_ERROR') {
        EXT_FIELDS.forEach(f => delete data[f]);
        if (Object.keys(data).length === 0) {
          return res.status(400).json({ success: false, message: 'No valid fields provided.' });
        }
        const { clause, values } = buildSetClause(data);
        await query(`UPDATE education SET ${clause} WHERE id = ?`, [...values, req.params.id]);
      } else {
        throw dbErr;
      }
    }

    const updated = await query('SELECT * FROM education WHERE id = ? LIMIT 1', [req.params.id]);
    return res.status(200).json({
      success: true,
      message: 'Education record updated.',
      data: updated[0]
    });
  } catch (err) {
    console.error('[educationController.update]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── DELETE /api/education/:id ─────────────────────────────────────────────────
async function remove(req, res) {
  try {
    const existing = await query('SELECT id FROM education WHERE id = ? LIMIT 1', [req.params.id]);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Education record not found.' });
    }
    await query('DELETE FROM education WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Education record deleted.' });
  } catch (err) {
    console.error('[educationController.remove]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getAll, getOne, create, update, remove };
