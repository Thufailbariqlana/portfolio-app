'use strict';

const slugify = require('slugify');
const { query, buildSetClause } = require('../config/db');

// ── GET /api/projects ─────────────────────────────────────────────────────────
async function getAll(req, res) {
  try {
    const { featured, category } = req.query;
    let sql      = 'SELECT * FROM projects';
    const params = [];
    const conditions = [];

    if (featured === 'true') { conditions.push('is_featured = 1'); }
    if (category)            { conditions.push('category = ?'); params.push(category); }
    if (conditions.length)   { sql += ' WHERE ' + conditions.join(' AND '); }
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
      title, short_desc, description, demo_url, repo_url,
      tech_stack, category, metric_users, metric_perf,
      metric_custom, is_featured, sort_order
    } = req.body;

    if (!title) return res.status(400).json({ success: false, message: 'title is required.' });

    const slug = slugify(title, { lower: true, strict: true, trim: true });

    const slugCheck = await query('SELECT id FROM projects WHERE slug = ? LIMIT 1', [slug]);
    if (Array.isArray(slugCheck) && slugCheck.length > 0) {
      return res.status(409).json({ success: false, message: `Slug "${slug}" already exists. Use a different title.` });
    }

    // Mengambil URL Cloudinary dari middleware upload
    const image_url = req.file ? (req.file.path || req.file.filename) : '';

    const result = await query(
      `INSERT INTO projects (title, slug, short_desc, description, image_url, demo_url, repo_url, tech_stack, category, metric_users, metric_perf, metric_custom, is_featured, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        short_desc    || '',
        description   || '',
        image_url,
        demo_url      || '',
        repo_url      || '',
        tech_stack    || '',
        category      || 'General',
        metric_users  || '',
        metric_perf   || '',
        metric_custom || '',
        is_featured   ? 1 : 0,
        sort_order    || 0
      ]
    );

    const created = await query('SELECT * FROM projects WHERE id = ? LIMIT 1', [result.insertId || result[0]?.insertId]);
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

    const allowed = [
      'title','short_desc','description','demo_url','repo_url',
      'tech_stack','category','metric_users','metric_perf',
      'metric_custom','is_featured','sort_order'
    ];
    const data = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) data[f] = req.body[f]; });

    if (data.title && data.title !== existing[0].title) {
      data.slug = slugify(data.title, { lower: true, strict: true, trim: true });
      const slugCheck = await query('SELECT id FROM projects WHERE slug = ? AND id != ? LIMIT 1', [data.slug, req.params.id]);
      if (Array.isArray(slugCheck) && slugCheck.length > 0) {
        return res.status(409).json({ success: false, message: `Slug "${data.slug}" already exists.` });
      }
    }

    if (req.file) {
      // Menggunakan URL Cloudinary baru; penghapusan file lokal ditiadakan
      data.image_url = req.file.path || req.file.filename;
    }

    if (Object.keys(data).length === 0) return res.status(400).json({ success: false, message: 'No valid fields provided.' });

    const { clause, values } = buildSetClause(data);
    await query(`UPDATE projects SET ${clause} WHERE id = ?`, [...values, req.params.id]);

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
    const existing = await query('SELECT * FROM projects WHERE id = ? LIMIT 1', [req.params.id]);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Penghapusan file fisik lokal (fs.unlinkSync) ditiadakan karena file tersimpan di Cloudinary
    await query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    console.error('[projectController.remove]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getAll, getOne, create, update, remove, getProjects: getAll };