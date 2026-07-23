/* ================================================================
   ADMIN DASHBOARD — Centralized API Configuration
   Same auto-detection logic as portfolio/js/config.js.

   WHAT TO CHANGE:
   Replace PROD_API with your actual Render service URL.
================================================================ */

const AdminConfig = (() => {
  // ── Your Render backend URL (no trailing slash) ──────────────
  // Example: 'https://portfolio-api-xxxx.onrender.com'
  const PROD_API  = 'https://portfolio-app-khaki-mu.vercel.app';

  // ── Local development backend ─────────────────────────────────
  const LOCAL_API = 'http://localhost:5000';

  // ── Auto-detect environment ───────────────────────────────────
  const hostname = window.location.hostname;
  const isLocal  = (
    hostname === 'localhost'  ||
    hostname === '127.0.0.1'  ||
    hostname === ''           ||
    hostname.startsWith('192.168.')
  );

  const API_BASE_URL = isLocal ? LOCAL_API : PROD_API;

  return {
    API:      `${API_BASE}/api`,
    BASE:     API_BASE,
    IS_LOCAL: isLocal
  };
})();
