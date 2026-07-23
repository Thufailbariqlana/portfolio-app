/* ================================================================
   PORTFOLIO — Centralized API Configuration
   This file auto-detects whether the app is running locally or
   on a production host and sets API_URL accordingly.

   HOW IT WORKS:
   - If the page is served from localhost / 127.0.0.1 / file://
     → use LOCAL_API (your local backend)
   - Otherwise (deployed to Vercel / Netlify / any other host)
     → use PROD_API (your Render backend URL)

   WHAT TO CHANGE:
   1. Replace PROD_API value with your actual Render service URL.
   2. Optionally change LOCAL_API port if you run backend on a
      different port.
================================================================ */

const PortfolioConfig = (() => {
  // ── Your Render backend URL (no trailing slash) ──────────────
  // Example: 'https://portfolio-api-xxxx.onrender.com'
  const PROD_API  = 'https://YOUR-RENDER-APP-NAME.onrender.com';

  // ── Local development backend ─────────────────────────────────
  const LOCAL_API = 'http://localhost:5000';

  // ── Auto-detect environment ───────────────────────────────────
  const hostname = window.location.hostname;
  const isLocal  = (
    hostname === 'localhost'  ||
    hostname === '127.0.0.1'  ||
    hostname === ''           ||   // file:// protocol
    hostname.startsWith('192.168.') // local network
  );

  const API_BASE_URL = 'https://portfolio-app-khaki-mu.vercel.app/api';

  return {
    API:  `${API_BASE}/api`,   // e.g. https://…/api
    BASE: API_BASE,            // e.g. https://… (for image URLs)
    IS_LOCAL: isLocal
  };
})();
