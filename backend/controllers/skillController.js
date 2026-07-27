'use strict';

const { query, buildSetClause } = require('../config/db');

// Extension fields added by migration v3 (may not exist in DB yet)
const EXT_FIELDS = ['category_id'];

// ── GET /api/skills ───────────────────────────────────────────────────────────
async function getAll(req, res) {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM skills';
    const params = [];
    if (category) { sql += ' WHERE category = ?'; params.push(category); }
    sql += ' ORDER BY sort_order ASC, name ASC';

    const rows = await query(sql, params);
    return res.status(200).json({ success: true, data: Array.isArray(rows) ? rows : [] });
  } catch (err) {
    console.error('[skillController.getAll]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── GET /api/skills/:id ───────────────────────────────────────────────────────
async function getOne(req, res) {
  try {
    const rows = await query('SELECT * FROM skills WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Skill not found.' });
    }
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[skillController.getOne]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── GET /api/skills/categories ────────────────────────────────────────────────
async function getCategories(req, res) {
  try {
    const rows = await query('SELECT DISTINCT category FROM skills ORDER BY category ASC');
    const categories = Array.isArray(rows) ? rows.map(r => r.category) : [];
    return res.status(200).json({ success: true, data: categories });
  } catch (err) {
    console.error('[skillController.getCategories]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── POST /api/skills ──────────────────────────────────────────────────────────
async function create(req, res) {
  try {
    const { name, category, category_id, level, icon_url, sort_order } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'name is required.' });

    const levelVal = Number(level);
    if (isNaN(levelVal) || levelVal < 0 || levelVal > 100) {
      return res.status(400).json({ success: false, message: 'level must be a number between 0 and 100.' });
    }

    // Base columns — always present
    const baseData = {
      name,
      category:   category   || 'General',
      level:      levelVal,
      icon_url:   icon_url   || '',
      sort_order: sort_order || 0
    };

    // Extension columns — only include if provided
    const extData = {};
    if (category_id !== undefined) extData.category_id = category_id || '';

    let insertId;

    try {
      const data = { ...baseData, ...extData };
      const cols = Object.keys(data).map(k => `\`${k}\``).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const result = await query(
        `INSERT INTO skills (${cols}) VALUES (${placeholders})`,
        Object.values(data)
      );
      insertId = result.insertId;
    } catch (dbErr) {
      if (dbErr.code === 'ER_BAD_FIELD_ERROR') {
        const cols = Object.keys(baseData).map(k => `\`${k}\``).join(', ');
        const placeholders = Object.keys(baseData).map(() => '?').join(', ');
        const result = await query(
          `INSERT INTO skills (${cols}) VALUES (${placeholders})`,
          Object.values(baseData)
        );
        insertId = result.insertId;
      } else {
        throw dbErr;
      }
    }

    const created = await query('SELECT * FROM skills WHERE id = ? LIMIT 1', [insertId]);
    return res.status(201).json({ success: true, message: 'Skill created.', data: created[0] });
  } catch (err) {
    console.error('[skillController.create]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── PUT /api/skills/:id ───────────────────────────────────────────────────────
async function update(req, res) {
  try {
    const existing = await query('SELECT id FROM skills WHERE id = ? LIMIT 1', [req.params.id]);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Skill not found.' });
    }

    const baseAllowed = ['name', 'category', 'level', 'icon_url', 'sort_order'];
    const data = {};
    [...baseAllowed, ...EXT_FIELDS].forEach(f => {
      if (req.body[f] !== undefined) data[f] = req.body[f];
    });

    if (data.level !== undefined) {
      const levelVal = Number(data.level);
      if (isNaN(levelVal) || levelVal < 0 || levelVal > 100) {
        return res.status(400).json({ success: false, message: 'level must be between 0 and 100.' });
      }
      data.level = levelVal;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided.' });
    }

    try {
      const { clause, values } = buildSetClause(data);
      await query(`UPDATE skills SET ${clause} WHERE id = ?`, [...values, req.params.id]);
    } catch (dbErr) {
      if (dbErr.code === 'ER_BAD_FIELD_ERROR') {
        EXT_FIELDS.forEach(f => delete data[f]);
        if (Object.keys(data).length === 0) {
          return res.status(400).json({ success: false, message: 'No valid fields provided.' });
        }
        const { clause, values } = buildSetClause(data);
        await query(`UPDATE skills SET ${clause} WHERE id = ?`, [...values, req.params.id]);
      } else {
        throw dbErr;
      }
    }

    const updated = await query('SELECT * FROM skills WHERE id = ? LIMIT 1', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Skill updated.', data: updated[0] });
  } catch (err) {
    console.error('[skillController.update]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── DELETE /api/skills/:id ────────────────────────────────────────────────────
async function remove(req, res) {
  try {
    const existing = await query('SELECT id FROM skills WHERE id = ? LIMIT 1', [req.params.id]);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Skill not found.' });
    }
    await query('DELETE FROM skills WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Skill deleted.' });
  } catch (err) {
    console.error('[skillController.remove]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getAll, getOne, getCategories, create, update, remove, getSkills: getAll };
