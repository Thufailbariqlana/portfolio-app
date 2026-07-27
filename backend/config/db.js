'use strict';

const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

// ── Build SSL options ─────────────────────────────────────────────────────────
// When DB_SSL=true (required by Aiven, PlanetScale, TiDB, Railway, etc.)
// the driver will verify the server certificate using the system CA bundle.
// You can optionally point DB_SSL_CA to a downloaded .pem certificate file.
function buildSslConfig() {
  const useSSL = process.env.DB_SSL === 'true';
  if (!useSSL) return false;

  const sslOptions = {
    // Reject connections if the server cert cannot be verified.
    // Set DB_SSL_REJECT_UNAUTHORIZED=false ONLY if you're on a self-signed cert.
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  };

  // Optional: custom CA certificate file (download from Aiven console)
  const caPath = process.env.DB_SSL_CA; // e.g. "/app/certs/ca.pem"
  if (caPath) {
    const resolvedCa = path.isAbsolute(caPath)
      ? caPath
      : path.resolve(process.cwd(), caPath);

    if (fs.existsSync(resolvedCa)) {
      sslOptions.ca = fs.readFileSync(resolvedCa);
    } else {
      console.warn(`[db.js] DB_SSL_CA path not found: ${resolvedCa} — falling back to system CA`);
    }
  }

  return sslOptions;
}

// ── Create connection pool ────────────────────────────────────────────────────
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               Number(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'portfolio_db',
  ssl:                buildSslConfig(),

  // Pool settings
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,

  // Aiven / cloud MySQL typically runs on UTC
  timezone:           '+00:00',
  charset:            'utf8mb4',
  decimalNumbers:     true,

  // Keep-alive so Aiven free-tier doesn't drop idle connections
  enableKeepAlive:    true,
  keepAliveInitialDelay: 30000  // 30 s
});

// ── Query helper ──────────────────────────────────────────────────────────────
/**
 * Execute a parameterised query and return rows directly.
 * @param {string} sql
 * @param {Array}  params
 */
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows; // <-- HANYA RETURN ROWS
}

// ── Connection test (called once on startup) ──────────────────────────────────
async function testConnection() {
  const conn = await pool.getConnection();
  const sslLabel = process.env.DB_SSL === 'true' ? ' (SSL/TLS ✅)' : '';
  console.log(
    `✅  MySQL connected${sslLabel}:`,
    `${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`
  );
  conn.release();
  // Tidak ada try/catch di sini — error di-throw ke caller (server.js)
  // sehingga Vercel Serverless tidak crash permanen dengan process.exit()
}

// ── Dynamic SET clause builder ────────────────────────────────────────────────
/**
 * Build a `col1 = ?, col2 = ?` clause from a plain object for UPDATE queries.
 * @param {Object} data
 * @returns {{ clause: string, values: Array }}
 */
function buildSetClause(data) {
  const keys   = Object.keys(data);
  const clause = keys.map(k => `\`${k}\` = ?`).join(', ');
  const values = Object.values(data);
  return { clause, values };
}

module.exports = { pool, query, testConnection, buildSetClause };
