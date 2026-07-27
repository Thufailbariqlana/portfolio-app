'use strict';

const nodemailer = require('nodemailer');
const { query } = require('../config/db');

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// ── POST /api/contacts ────────────────────────────────────────────────────────
async function submit(req, res) {
  try {
    const sender_name = req.body.sender_name || req.body.name;
    const sender_email = req.body.sender_email || req.body.email;
    const { subject, message } = req.body;

    if (!sender_name || !sender_email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sender_email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    // TANPA [ ] karena INSERT mengembalikan ResultSet langsung (bukan array rows)
    const result = await query(
      'INSERT INTO contacts (sender_name, sender_email, subject, message) VALUES (?, ?, ?, ?)',
      [sender_name.trim(), sender_email.trim(), (subject || '').trim(), message.trim()]
    );

    const transporter = getTransporter();
    if (transporter && process.env.NOTIFY_EMAIL) {
      transporter.sendMail({
        from:    process.env.SMTP_FROM || process.env.SMTP_USER,
        to:      process.env.NOTIFY_EMAIL,
        subject: `[Portfolio Contact] ${subject || 'New Message'} — from ${sender_name}`,
        text:    `From: ${sender_name} <${sender_email}>\n\n${message}`
      }).catch(e => console.error('[contactController] Email send failed:', e.message));
    }

    // Ambil data yang baru saja dimasukkan (SELECT mengembalikan array rows, jadi pakai [created])
    const [created] = await query('SELECT * FROM contacts WHERE id = ? LIMIT 1', [result.insertId]);
    
    const createdRecord = Array.isArray(created) ? created[0] : created;

    return res.status(201).json({ success: true, message: 'Message sent. Thank you!', data: createdRecord });
  } catch (err) {
    console.error('[contactController.submit]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── GET /api/contacts ─────────────────────────────────────────────────────────
async function getAll(req, res) {
  try {
    const { unread } = req.query;
    let sql = 'SELECT * FROM contacts';
    const params = [];
    if (unread === 'true') { sql += ' WHERE is_read = 0'; }
    sql += ' ORDER BY created_at DESC';

    const [rows] = await query(sql, params);
    const [countRows] = await query('SELECT COUNT(*) AS total FROM contacts WHERE is_read = 0');

    const totalUnread = (countRows && countRows.length > 0) ? countRows[0].total : 0;

    return res.status(200).json({
      success: true,
      data: Array.isArray(rows) ? rows : [],
      unread_count: totalUnread
    });
  } catch (err) {
    console.error('[contactController.getAll]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── GET /api/contacts/:id ─────────────────────────────────────────────────────
async function getOne(req, res) {
  try {
    const [rows] = await query('SELECT * FROM contacts WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }

    if (!rows[0].is_read) {
      await query('UPDATE contacts SET is_read = 1 WHERE id = ?', [req.params.id]);
      rows[0].is_read = 1;
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[contactController.getOne]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── PATCH /api/contacts/:id/read ──────────────────────────────────────────────
async function markRead(req, res) {
  try {
    const is_read = req.body.is_read !== undefined ? req.body.is_read : 1;

    const [existing] = await query('SELECT id FROM contacts WHERE id = ? LIMIT 1', [req.params.id]);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }

    await query('UPDATE contacts SET is_read = ? WHERE id = ?', [is_read ? 1 : 0, req.params.id]);
    return res.status(200).json({ success: true, message: `Marked as ${is_read ? 'read' : 'unread'}.` });
  } catch (err) {
    console.error('[contactController.markRead]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── DELETE /api/contacts/:id ──────────────────────────────────────────────────
async function remove(req, res) {
  try {
    const [existing] = await query('SELECT id FROM contacts WHERE id = ? LIMIT 1', [req.params.id]);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }

    await query('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    console.error('[contactController.remove]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { submit, getAll, getOne, markRead, remove, createContact: submit, getContacts: getAll, markAsRead: markRead, deleteContact: remove };