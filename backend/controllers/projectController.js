'use strict';

const slugify = require('slugify');
const { query, buildSetClause } = require('../config/db');

// Extension fields added by migration v3 (may not exist in DB yet)
const EXT_FIELDS = ['title_id', 'short_desc_id', 'description_id'];

// ── GET /api/projects ─────────────────────────────────────────────────────────
async function getAll(req, res) {
  try {
    const { featured, category } = req.query;
    let sql = 'SELECT * FROM projects';
    const params = [];
    const conditions = [];

    if (featured === 'true') { conditions.push('is_featured = 1'); }
    if (category) { conditions.push('category = ?'); params.push(category); }
    if (conditions.length) { sql += ' WHERE ' + conditions.join(' AND '); }
    sql += ' ORDER BY sort_order ASC, created_at DESC';

    const rows = await query(sql, params);
    return res.status(200).json({ success: true, data: Array.isArray(rows) ? rows : [] });
  } catch (err) {
    console.error('[projectController.getAll]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── GET /api/projects/:idOrSlug ───────────────────────────────────────────────
async function getOne(req, res) {
  try {
    const param = req.params.idOrSlug;
    const isNumeric = /^\d+$/.test(param);
    const sql = isNumeric
      ? 'SELECT * FROM projects WHERE id = ? LIMIT 1'
      : 'SELECT * FROM projects WHERE slug = ? LIMIT 1';

    const rows = await query(sql, [param]);
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[projectController.getOne]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── POST /api/projects ────────────────────────────────────────────────────────
async function create(req, res) {
  try {
    const {
      title, title_id, short_desc, short_desc_id, description, description_id,
      demo_url, repo_url, tech_stack, category, metric_users, metric_perf,
      metric_custom, is_featured, sort_order
    } = req.body;

    if (!title) return res.status(400).json({ success: false, message: 'title is required.' });

    const slug = slugify(title, { lower: true, strict: true, trim: true });

    const slugCheck = await query('SELECT id FROM projects WHERE slug = ? LIMIT 1', [slug]);
    if (Array.isArray(slugCheck) && slugCheck.length > 0) {
      return res.status(409).json({ success: false, message: `Slug "${slug}" already exists. Use a different title.` });
    }

    const image_url = req.file ? (req.file.path || req.file.filename) : '';

    // Base columns — always present
    const baseData = {
      title, slug,
      short_desc:    short_desc    || '',
      description:   description   || '',
      image_url,
      demo_url:      demo_url      || '',
      repo_url:      repo_url      || '',
      tech_stack:    tech_stack    || '',
      category:      category      || 'General',
      metric_users:  metric_users  || '',
      metric_perf:   metric_perf   || '',
      metric_custom: metric_custom || '',
      is_featured:   is_featured   ? 1 : 0,
      sort_order:    sort_order    || 0
    };

    // Extension columns — only include if values provided
    const extData = {};
    if (title_id       !== undefined) extData.title_id       = title_id       || '';
    if (short_desc_id  !== undefined) extData.short_desc_id  = short_desc_id  || '';
    if (description_id !== undefined) extData.description_id = description_id || '';

    let insertId;

    // Try with ext columns; fall back to base-only if migration not yet run
    try {
      const data = { ...baseData, ...extData };
      const cols = Object.keys(data).map(k => `\`${k}\``).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const result = await query(
        `INSERT INTO projects (${cols}) VALUES (${placeholders})`,
        Object.values(data)
      );
      insertId = result.insertId;
    } catch (dbErr) {
      if (dbErr.code === 'ER_BAD_FIELD_ERROR') {
        // Migration v3 not run yet — insert without _id columns
        const cols = Object.keys(baseData).map(k => `\`${k}\``).join(', ');
        const placeholders = Object.keys(baseData).map(() => '?').join(', ');
        const result = await query(
          `INSERT INTO projects (${cols}) VALUES (${placeholders})`,
          Object.values(baseData)
        );
        insertId = result.insertId;
      } else {
        throw dbErr;
      }
    }

    const created = await query('SELECT * FROM projects WHERE id = ? LIMIT 1', [insertId]);
    return res.status(201).json({
      success: true,
      message: 'Project created.',
      data: Array.isArray(created) ? created[0] : (created || null)
    });
  } catch (err) {
    console.error('[projectController.create]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── PUT /api/projects/:id ─────────────────────────────────────────────────────
async function update(req, res) {
  try {
    const existing = await query('SELECT * FROM projects WHERE id = ? LIMIT 1', [req.params.id]);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const baseAllowed = [
      'title', 'short_desc', 'description',
      'demo_url', 'repo_url', 'tech_stack', 'category',
      'metric_users', 'metric_perf', 'metric_custom',
      'is_featured', 'sort_order'
    ];

    const data = {};
    [...baseAllowed, ...EXT_FIELDS].forEach(f => {
      if (req.body[f] !== undefined) data[f] = req.body[f];
    });

    if (data.title && data.title !== existing[0].title) {
      data.slug = slugify(data.title, { lower: true, strict: true, trim: true });
      const slugCheck = await query('SELECT id FROM projects WHERE slug = ? AND id != ? LIMIT 1', [data.slug, req.params.id]);
      if (Array.isArray(slugCheck) && slugCheck.length > 0) {
        return res.status(409).json({ success: false, message: `Slug "${data.slug}" already exists.` });
      }
    }

    if (req.file) {
      data.image_url = req.file.path || req.file.filename;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided.' });
    }

    // Try with all fields; fall back without _id fields if migration not run
    try {
      const { clause, values } = buildSetClause(data);
      await query(`UPDATE projects SET ${clause} WHERE id = ?`, [...values, req.params.id]);
    } catch (dbErr) {
      if (dbErr.code === 'ER_BAD_FIELD_ERROR') {
        EXT_FIELDS.forEach(f => delete data[f]);
        if (Object.keys(data).length === 0) {
          return res.status(400).json({ success: false, message: 'No valid fields provided.' });
        }
        const { clause, values } = buildSetClause(data);
        await query(`UPDATE projects SET ${clause} WHERE id = ?`, [...values, req.params.id]);
      } else {
        throw dbErr;
      }
    }

    const updated = await query('SELECT * FROM projects WHERE id = ? LIMIT 1', [req.params.id]);
    return res.status(200).json({
      success: true,
      message: 'Project updated.',
      data: Array.isArray(updated) ? updated[0] : (updated || null)
    });
  } catch (err) {
    console.error('[projectController.update]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── DELETE /api/projects/:id ──────────────────────────────────────────────────
async function remove(req, res) {
  try {
    const existing = await query('SELECT id FROM projects WHERE id = ? LIMIT 1', [req.params.id]);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    await query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    console.error('[projectController.remove]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getAll, getOne, create, update, remove };
