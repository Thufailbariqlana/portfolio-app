
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Free Cloud Deployment — Portfolio App</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,"Segoe UI",system-ui,sans-serif;font-size:14px;
  line-height:1.65;color:#1f2328;background:#fff;
  max-width:780px;margin:0 auto;padding:1.5rem 1.25rem 3rem}
h1{font-size:1.55rem;font-weight:800;margin-bottom:.2rem;letter-spacing:-.025em}
h2{font-size:1rem;font-weight:700;margin:2rem 0 .5rem;padding-top:1.5rem;
  border-top:2px solid #e5e7eb;color:#1f2328}
h3{font-size:.88rem;font-weight:700;margin:1.1rem 0 .35rem;color:#374151}
p{margin-bottom:.7rem;color:#374151;font-size:.875rem}
a{color:#3b82d4}a:hover{text-decoration:underline}
code{background:#f6f8fa;border:1px solid #e5e7eb;border-radius:4px;
  padding:.1em .35em;font-family:"SF Mono","Fira Code",monospace;font-size:.8em;color:#24292f}
pre{background:#0f172a;border-radius:8px;padding:.9rem 1.1rem;overflow-x:auto;
  margin:.5rem 0 1rem;font-family:"SF Mono","Fira Code",monospace;font-size:.78rem;
  line-height:1.7;color:#e2e8f0}
pre code{background:none;border:none;padding:0;font-size:inherit;color:inherit}
.c-green{color:#4ade80}.c-yellow{color:#fbbf24}.c-blue{color:#60a5fa}
.c-pink{color:#f472b6}.c-gray{color:#94a3b8}.c-orange{color:#fb923c}

.lead{color:#57606a;font-size:.875rem;margin-bottom:1.5rem}

/* Phase header */
.phase{display:flex;align-items:center;gap:.75rem;
  background:linear-gradient(135deg,#1e293b,#0f172a);
  border-radius:10px;padding:1rem 1.25rem;margin:2rem 0 1.25rem;color:#f1f5f9}
.phase-num{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font-weight:800;font-size:.9rem;flex-shrink:0}
.ph1 .phase-num{background:#f59e0b;color:#000}
.ph2 .phase-num{background:#3b82f6;color:#fff}
.ph3 .phase-num{background:#7c3aed;color:#fff}
.ph4 .phase-num{background:#16a34a;color:#fff}
.phase-title{font-weight:700;font-size:1rem}
.phase-sub{font-size:.78rem;color:#94a3b8;margin-top:.1rem}

/* Steps */
.steps{counter-reset:step}
.step{counter-increment:step;display:flex;gap:.85rem;margin-bottom:1.25rem}
.step-num{width:24px;height:24px;border-radius:50%;background:#3b82d4;color:#fff;
  font-size:.72rem;font-weight:700;display:flex;align-items:center;
  justify-content:center;flex-shrink:0;margin-top:.1rem}
.step-body{flex:1}
.step-title{font-weight:600;font-size:.875rem;margin-bottom:.3rem;color:#1f2328}

/* Alert boxes */
.alert{padding:.7rem 1rem;border-radius:8px;font-size:.82rem;margin:.75rem 0;
  border-left:4px solid;line-height:1.5}
.al-warn   {background:#fffbeb;border-color:#f59e0b;color:#92400e}
.al-info   {background:#eff6ff;border-color:#3b82d4;color:#1e40af}
.al-success{background:#f0fdf4;border-color:#16a34a;color:#14532d}
.al-danger {background:#fef2f2;border-color:#ef4444;color:#991b1b}

/* Env table */
.env-table{width:100%;border-collapse:collapse;margin:.5rem 0 1.1rem;font-size:.78rem}
.env-table th{background:#f7f8fa;border:1px solid #e5e7eb;padding:.4rem .65rem;
  font-weight:700;text-align:left;color:#374151;white-space:nowrap}
.env-table td{border:1px solid #e5e7eb;padding:.4rem .65rem;vertical-align:top}
.env-table td:first-child{font-family:"SF Mono","Fira Code",monospace;font-size:.75rem;white-space:nowrap}
.env-table tr:nth-child(even) td{background:#fafbfc}
.req{color:#ef4444;font-weight:700;font-size:.7rem}
.opt{color:#57606a;font-weight:700;font-size:.7rem}

/* File change card */
.change-card{background:#f7f8fa;border:1px solid #e5e7eb;border-radius:8px;
  padding:.85rem 1rem;margin:.5rem 0 1rem}
.change-card .file-path{font-family:"SF Mono","Fira Code",monospace;font-size:.78rem;
  color:#3b82d4;font-weight:700;margin-bottom:.5rem}

/* Checklist */
.checklist{list-style:none;margin:.4rem 0 1rem}
.checklist li{padding:.22rem 0 .22rem 1.5rem;position:relative;font-size:.83rem;color:#374151}
.checklist li::before{content:'✓';position:absolute;left:0;color:#16a34a;font-weight:700}
.checklist li.warn::before{content:'⚠';color:#f59e0b}
.checklist li.x::before{content:'✗';color:#ef4444}

/* 3-col summary */
.stack-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin:1rem 0 1.5rem}
.stack-card{border:1px solid #e5e7eb;border-radius:8px;padding:.85rem 1rem;text-align:center}
.stack-card .stack-icon{font-size:1.6rem;margin-bottom:.35rem}
.stack-card .stack-name{font-weight:700;font-size:.88rem;color:#1f2328}
.stack-card .stack-sub {font-size:.72rem;color:#57606a;margin-top:.15rem}
.stack-card .stack-free{display:inline-block;margin-top:.35rem;font-size:.68rem;font-weight:700;
  background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;padding:.1rem .45rem;border-radius:99px}

/* Badge */
.badge{display:inline-block;padding:.1rem .45rem;border-radius:99px;font-size:.68rem;font-weight:700}
.bd-blue{background:#eff6ff;color:#1d4ed8}
.bd-green{background:#f0fdf4;color:#15803d}
.bd-orange{background:#fff7ed;color:#c2410c}
.bd-purple{background:#faf5ff;color:#7c3aed}

/* Flow diagram */
.flow{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;
  background:#f7f8fa;border:1px solid #e5e7eb;border-radius:8px;
  padding:.85rem 1rem;margin:.75rem 0 1.25rem;font-size:.8rem}
.flow-box{background:#fff;border:1px solid #e5e7eb;border-radius:6px;
  padding:.35rem .75rem;font-weight:600;white-space:nowrap;font-size:.78rem}
.flow-box.blue{border-color:#3b82d4;background:#eff6ff;color:#1e40af}
.flow-box.green{border-color:#16a34a;background:#f0fdf4;color:#14532d}
.flow-box.purple{border-color:#7c3aed;background:#faf5ff;color:#5b21b6}
.flow-box.orange{border-color:#f59e0b;background:#fffbeb;color:#92400e}
.flow-arr{color:#94a3b8;font-size:1rem}

/* Footer */
.site-footer{margin-top:3rem;padding-top:1rem;border-top:1px solid #e5e7eb;
  text-align:center;font-size:.75rem;color:#8c959f}

@media(max-width:580px){
  .stack-summary{grid-template-columns:1fr 1fr}
  .flow{flex-direction:column;align-items:flex-start}
}
</style>
</head>
<body>

<h1>Free Cloud Deployment Guide</h1>
<p class="lead">Deploy Portfolio App to the internet — 100% free — using Aiven MySQL, Render, and Vercel. No credit card required for any service.</p>


<div class="flow">
  <div class="flow-box orange">Browser / User</div>
  <div class="flow-arr">→</div>
  <div class="flow-box purple">Vercel<br /><small>Frontend (HTML/JS)</small></div>
  <div class="flow-arr">→</div>
  <div class="flow-box blue">Render<br /><small>Node.js API</small></div>
  <div class="flow-arr">→</div>
  <div class="flow-box green">Aiven<br /><small>MySQL (SSL)</small></div>
</div>

<div class="stack-summary">
  <div class="stack-card">
    <div class="stack-icon">🗄️</div>
    <div class="stack-name">Aiven MySQL</div>
    <div class="stack-sub">Managed cloud database<br />with SSL/TLS built-in</div>
    <div class="stack-free">Free Tier — 5GB</div>
  </div>
  <div class="stack-card">
    <div class="stack-icon">⚙️</div>
    <div class="stack-name">Render.com</div>
    <div class="stack-sub">Node.js backend API<br />auto-deploy from Git</div>
    <div class="stack-free">Free — 750 hrs/mo</div>
  </div>
  <div class="stack-card">
    <div class="stack-icon">▲</div>
    <div class="stack-name">Vercel</div>
    <div class="stack-sub">Static frontend hosting<br />global CDN + HTTPS</div>
    <div class="stack-free">Free — Unlimited</div>
  </div>
</div>

<div class="alert al-warn">
  ⚠️ <strong>Before you start:</strong> edit <code>frontend/portfolio/js/config.js</code> and <code>frontend/admin/js/config.js</code> — replace <code>YOUR-RENDER-APP-NAME</code> with your actual Render service name after Step B below.
</div>


<div class="phase ph1">
  <div class="phase-num">A</div>
  <div>
    <div class="phase-title">Aiven MySQL — Cloud Database Setup</div>
    <div class="phase-sub">Free tier · 5 GB storage · SSL/TLS required · No credit card</div>
  </div>
</div>

<div class="steps">

<div class="step">
  <div class="step-num">1</div>
  <div class="step-body">
    <div class="step-title">Create a free Aiven account &amp; MySQL service</div>
    <p>Go to <a href="https://aiven.io" target="_blank">aiven.io</a> → Sign up → <strong>Create Service</strong> → choose <strong>MySQL</strong> → select plan <strong>Free</strong> → choose any region → click <strong>Create Service</strong>.</p>
    <p>Wait ~2 minutes for the service to spin up (status turns green).</p>
  </div>
</div>

<div class="step">
  <div class="step-num">2</div>
  <div class="step-body">
    <div class="step-title">Copy connection credentials</div>
    <p>Go to your service → <strong>Overview</strong> tab → find the <strong>Connection Information</strong> panel. Note these values:</p>
    <table class="env-table">
      <thead><tr><th>Field in Aiven</th><th>Maps to .env variable</th></tr></thead>
      <tbody>
        <tr><td>Host</td><td><code>DB_HOST</code> — e.g. <code>mysql-abc-xxx.aivencloud.com</code></td></tr>
        <tr><td>Port</td><td><code>DB_PORT</code> — e.g. <code>11234</code></td></tr>
        <tr><td>User</td><td><code>DB_USER</code> — always <code>avnadmin</code></td></tr>
        <tr><td>Password</td><td><code>DB_PASSWORD</code></td></tr>
        <tr><td>Database</td><td><code>DB_NAME</code> — always <code>defaultdb</code></td></tr>
      </tbody>
    </table>
    <div class="alert al-info">💡 Keep <code>DB_SSL=true</code> and <code>DB_SSL_REJECT_UNAUTHORIZED=true</code>. Aiven always requires SSL — our updated <code>db.js</code> handles this automatically.</div>
  </div>
</div>

<div class="step">
  <div class="step-num">3</div>
  <div class="step-body">
    <div class="step-title">Import schema and seed data</div>
    <p><strong>Option A — Aiven Web Console (easiest):</strong></p>
    <p>Service page → <strong>Databases</strong> tab → find <code>defaultdb</code> → click the SQL Console icon → paste and run <code>schema.sql</code> contents, then <code>seed_admin.sql</code> contents.</p>
    <p><strong>Option B — MySQL CLI from your local machine:</strong></p>
<pre><code><span class="c-gray"># Import schema (creates all 9 tables)</span>
mysql -h mysql-xxxx-yourproject.aivencloud.com \
      -P 12345 \
      -u avnadmin \
      -p \
      --ssl-mode=REQUIRED \
      defaultdb &lt; database/schema.sql

<span class="c-gray"># Import admin seeder (creates admin user)</span>
mysql -h mysql-xxxx-yourproject.aivencloud.com \
      -P 12345 \
      -u avnadmin \
      -p \
      --ssl-mode=REQUIRED \
      defaultdb &lt; database/seed_admin.sql</code></pre>
    <ul class="checklist">
      <li>Default login after seeder: <code>admin</code> / <code>Admin@1234</code></li>
      <li>Change password immediately after first login!</li>
    </ul>
  </div>
</div>

</div>


<div class="phase ph2">
  <div class="phase-num">B</div>
  <div>
    <div class="phase-title">Render.com — Backend API Deployment</div>
    <div class="phase-sub">Free Web Service · 750 hrs/month · Auto-deploy from GitHub</div>
  </div>
</div>

<div class="steps">

<div class="step">
  <div class="step-num">1</div>
  <div class="step-body">
    <div class="step-title">Push project to GitHub</div>
<pre><code><span class="c-gray"># From inside portfolio-app/ folder</span>
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/portfolio-app.git
git push -u origin main</code></pre>
    <div class="alert al-warn">⚠️ Make sure <code>.env</code> is in <code>.gitignore</code>. NEVER push real credentials to GitHub.</div>
  </div>
</div>

<div class="step">
  <div class="step-num">2</div>
  <div class="step-body">
    <div class="step-title">Create a new Web Service on Render</div>
    <p>Go to <a href="https://render.com" target="_blank">render.com</a> → Sign up / Log in → <strong>New +</strong> → <strong>Web Service</strong> → connect your GitHub repo.</p>
    <p>Fill in the service settings:</p>
    <table class="env-table">
      <thead><tr><th>Setting</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>Name</td><td><code>portfolio-api</code> (pick any name)</td></tr>
        <tr><td>Root Directory</td><td><code>backend</code></td></tr>
        <tr><td>Runtime</td><td>Node</td></tr>
        <tr><td>Build Command</td><td><code>npm install</code></td></tr>
        <tr><td>Start Command</td><td><code>node server.js</code></td></tr>
        <tr><td>Plan</td><td>Free</td></tr>
      </tbody>
    </table>
  </div>
</div>

<div class="step">
  <div class="step-num">3</div>
  <div class="step-body">
    <div class="step-title">Add Environment Variables in Render Dashboard</div>
    <p>Render Dashboard → your service → <strong>Environment</strong> tab → add each variable:</p>
    <table class="env-table">
      <thead><tr><th>Key</th><th>Value</th><th></th></tr></thead>
      <tbody>
        <tr><td>NODE_ENV</td><td><code>production</code></td><td><span class="req">REQ</span></td></tr>
        <tr><td>DB_HOST</td><td>from Aiven (e.g. <code>mysql-xxx.aivencloud.com</code>)</td><td><span class="req">REQ</span></td></tr>
        <tr><td>DB_PORT</td><td>from Aiven (e.g. <code>11234</code>)</td><td><span class="req">REQ</span></td></tr>
        <tr><td>DB_USER</td><td><code>avnadmin</code></td><td><span class="req">REQ</span></td></tr>
        <tr><td>DB_PASSWORD</td><td>from Aiven</td><td><span class="req">REQ</span></td></tr>
        <tr><td>DB_NAME</td><td><code>defaultdb</code></td><td><span class="req">REQ</span></td></tr>
        <tr><td>DB_SSL</td><td><code>true</code></td><td><span class="req">REQ</span></td></tr>
        <tr><td>DB_SSL_REJECT_UNAUTHORIZED</td><td><code>true</code></td><td><span class="req">REQ</span></td></tr>
        <tr><td>JWT_SECRET</td><td>64-char random hex (generate below)</td><td><span class="req">REQ</span></td></tr>
        <tr><td>JWT_EXPIRES_IN</td><td><code>7d</code></td><td><span class="req">REQ</span></td></tr>
        <tr><td>CORS_ORIGINS</td><td>fill AFTER Vercel deploy (step C4)</td><td><span class="req">REQ</span></td></tr>
        <tr><td>MAX_FILE_SIZE</td><td><code>5242880</code></td><td><span class="opt">OPT</span></td></tr>
        <tr><td>BCRYPT_ROUNDS</td><td><code>12</code></td><td><span class="opt">OPT</span></td></tr>
        <tr><td>SMTP_HOST, SMTP_USER…</td><td>Gmail SMTP config for contact emails</td><td><span class="opt">OPT</span></td></tr>
      </tbody>
    </table>
    <p>Generate JWT_SECRET in your terminal:</p>
<pre><code>node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"</code></pre>
  </div>
</div>

<div class="step">
  <div class="step-num">4</div>
  <div class="step-body">
    <div class="step-title">Deploy &amp; verify</div>
    <p>Click <strong>Create Web Service</strong>. Render will install deps and start the server. Watch the deploy logs — you should see:</p>
<pre><code><span class="c-green">✅  MySQL connected (SSL/TLS ✅): mysql-xxx.aivencloud.com:11234/defaultdb</span>
<span class="c-blue">🚀  Portfolio API → http://0.0.0.0:5000</span>
<span class="c-yellow">    ENV      : production</span></code></pre>
    <p>Your API URL will be: <code>https://portfolio-api.onrender.com</code><br />Test it: <code>https://portfolio-api.onrender.com/api/health</code></p>
    <div class="alert al-info">📋 <strong>Copy your Render URL now</strong> — you'll need it in the next step.</div>
  </div>
</div>

</div>


<div class="phase ph3">
  <div class="phase-num">C</div>
  <div>
    <div class="phase-title">Vercel — Frontend Deployment (Portfolio + Admin)</div>
    <div class="phase-sub">Free · Global CDN · Automatic HTTPS · Preview deploys</div>
  </div>
</div>

<div class="steps">

<div class="step">
  <div class="step-num">1</div>
  <div class="step-body">
    <div class="step-title">Update config.js with your Render URL</div>
    <p>In <strong>both</strong> config files, replace <code>YOUR-RENDER-APP-NAME</code>:</p>
    <div class="change-card">
      <div class="file-path">frontend/portfolio/js/config.js  &amp;  frontend/admin/js/config.js</div>
<pre><code><span class="c-gray">// Change this line:</span>
<span class="c-pink">const PROD_API = 'https://YOUR-RENDER-APP-NAME.onrender.com';</span>

<span class="c-gray">// To your actual Render URL:</span>
<span class="c-green">const PROD_API = 'https://portfolio-api.onrender.com';</span></code></pre>
    </div>
    <p>Commit and push to GitHub: <code>git add . &amp;&amp; git commit -m "set render url" &amp;&amp; git push</code></p>
  </div>
</div>

<div class="step">
  <div class="step-num">2</div>
  <div class="step-body">
    <div class="step-title">Deploy the Portfolio (public site)</div>
    <p>Go to <a href="https://vercel.com" target="_blank">vercel.com</a> → <strong>Add New Project</strong> → import your GitHub repo → configure:</p>
    <table class="env-table">
      <thead><tr><th>Setting</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>Project Name</td><td><code>portfolio-main</code></td></tr>
        <tr><td>Framework Preset</td><td>Other (no framework)</td></tr>
        <tr><td>Root Directory</td><td><code>frontend/portfolio</code></td></tr>
        <tr><td>Build Command</td><td><em>leave blank</em></td></tr>
        <tr><td>Output Directory</td><td><code>.</code></td></tr>
        <tr><td>Install Command</td><td><em>leave blank</em></td></tr>
      </tbody>
    </table>
    <p>Click <strong>Deploy</strong>. You'll get a URL like: <code>https://portfolio-main.vercel.app</code></p>
  </div>
</div>

<div class="step">
  <div class="step-num">3</div>
  <div class="step-body">
    <div class="step-title">Deploy the Admin Dashboard</div>
    <p>Still on Vercel → <strong>Add New Project</strong> again → same repo → configure:</p>
    <table class="env-table">
      <thead><tr><th>Setting</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>Project Name</td><td><code>portfolio-admin</code></td></tr>
        <tr><td>Framework Preset</td><td>Other</td></tr>
        <tr><td>Root Directory</td><td><code>frontend/admin</code></td></tr>
        <tr><td>Build Command</td><td><em>leave blank</em></td></tr>
        <tr><td>Output Directory</td><td><code>.</code></td></tr>
      </tbody>
    </table>
    <p>Click <strong>Deploy</strong>. URL: <code>https://portfolio-admin.vercel.app</code></p>
  </div>
</div>

<div class="step">
  <div class="step-num">4</div>
  <div class="step-body">
    <div class="step-title">Update CORS_ORIGINS on Render with Vercel URLs</div>
    <p>Now that you have both Vercel URLs, go back to <strong>Render Dashboard → Environment</strong> and update:</p>
<pre><code>CORS_ORIGINS=https://portfolio-main.vercel.app,https://portfolio-admin.vercel.app</code></pre>
    <p>Click <strong>Save Changes</strong> — Render will auto-redeploy. Done! ✅</p>
  </div>
</div>

</div>


<div class="phase ph4">
  <div class="phase-num">D</div>
  <div>
    <div class="phase-title">Verify Everything Works</div>
    <div class="phase-sub">Final checklist before going live</div>
  </div>
</div>

<ul class="checklist">
  <li>Visit <code>https://portfolio-main.vercel.app</code> — portfolio loads with data from API</li>
  <li>Visit <code>https://portfolio-admin.vercel.app</code> — login page appears</li>
  <li>Login with <code>admin</code> / <code>Admin@1234</code> → dashboard opens</li>
  <li class="warn">Change admin password immediately via Security section!</li>
  <li>Add a profile, photo, and 1-2 projects → verify they appear on portfolio page</li>
  <li>Submit the contact form → verify the message appears in admin Messages</li>
  <li>Open browser DevTools (F12) → Network tab → no CORS errors in red</li>
  <li>Test on mobile (portfolio should be fully responsive)</li>
</ul>


<h2>Files Changed / Created in This Update</h2>

<table class="env-table">
  <thead><tr><th>File</th><th>What Changed</th></tr></thead>
  <tbody>
    <tr><td><code>backend/config/db.js</code></td><td>Added SSL/TLS config with <code>buildSslConfig()</code>, keep-alive for Aiven</td></tr>
    <tr><td><code>backend/server.js</code></td><td>Dynamic CORS (wildcard *.vercel.app), <code>trust proxy 1</code>, <code>0.0.0.0</code> binding</td></tr>
    <tr><td><code>backend/.env.example</code></td><td>All Aiven + Render cloud variables with comments</td></tr>
    <tr><td><code>frontend/portfolio/js/config.js</code></td><td>NEW — auto-detect local vs prod, exports <code>PortfolioConfig</code></td></tr>
    <tr><td><code>frontend/admin/js/config.js</code></td><td>NEW — auto-detect local vs prod, exports <code>AdminConfig</code></td></tr>
    <tr><td><code>frontend/portfolio/js/main.js</code></td><td>Uses <code>PortfolioConfig.API</code> &amp; <code>PortfolioConfig.BASE</code></td></tr>
    <tr><td><code>frontend/admin/js/auth.js</code></td><td>Uses <code>AdminConfig.API</code></td></tr>
    <tr><td><code>frontend/admin/js/dashboard.js</code></td><td>Uses <code>AdminConfig.API</code> &amp; <code>AdminConfig.BASE</code></td></tr>
    <tr><td><code>frontend/admin/js/profile.js</code></td><td>Uses <code>BASE</code> from <code>AdminConfig</code> (no more hardcoded localhost)</td></tr>
    <tr><td><code>frontend/portfolio/index.html</code></td><td>Added <code>&lt;script src="js/config.js"&gt;</code> before main.js</td></tr>
    <tr><td><code>frontend/admin/index.html</code></td><td>Added <code>&lt;script src="js/config.js"&gt;</code> before auth.js</td></tr>
    <tr><td><code>frontend/admin/dashboard.html</code></td><td>Added <code>&lt;script src="js/config.js"&gt;</code> before dashboard.js</td></tr>
    <tr><td><code>database/seed_admin.sql</code></td><td>NEW — idempotent admin seeder (bcrypt hash, blank profile row)</td></tr>
    <tr><td><code>render.yaml</code></td><td>NEW — Render Blueprint for one-click infra setup</td></tr>
    <tr><td><code>frontend/portfolio/vercel.json</code></td><td>NEW — Vercel routing + security headers config</td></tr>
    <tr><td><code>frontend/admin/vercel.json</code></td><td>NEW — Vercel routing + no-store cache headers for admin</td></tr>
  </tbody>
</table>


<h2>Important: Render Free Tier Limitations</h2>

<ul class="checklist">
  <li class="warn">Free services <strong>sleep after 15 minutes</strong> of inactivity — first request may take 30–60 s to "wake up"</li>
  <li class="warn">File uploads (photos/CV) are stored on <strong>ephemeral disk</strong> — they're deleted on every redeploy or restart. For persistent uploads, integrate <strong>Cloudinary</strong> (free tier available)</li>
  <li>Upgrade to Render Starter ($7/mo) to eliminate cold starts and get persistent disk</li>
</ul>

<h2>Cloudinary (Optional — Persistent Image Uploads)</h2>
<p>To make uploaded photos/project images survive Render restarts, sign up at <a href="https://cloudinary.com" target="_blank">cloudinary.com</a> (free 25 GB) and add to your Render env vars:</p>
<pre><code>CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret</code></pre>
<p>Then replace the Multer disk storage in <code>middleware/uploadMiddleware.js</code> with <code>multer-storage-cloudinary</code> — a drop-in replacement that uploads directly to Cloudinary instead of local disk.</p>

<div class="site-footer">Made with IBM Bob</div>
</body>
</html>
