# PORTFOLIO APP — Complete Setup & Deployment Guide

## PREREQUISITES
- Node.js >= 18 (https://nodejs.org)
- MySQL 8+ (https://dev.mysql.com/downloads/)
- Git (https://git-scm.com)

---

## PART 1 — LOCAL DEVELOPMENT SETUP

### Step 1 — Clone / enter the project
```bash
cd portfolio-app/backend
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Setup MySQL database
```bash
# Login to MySQL
mysql -u root -p

# Inside MySQL shell:
CREATE DATABASE portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Import schema
mysql -u root -p portfolio_db < ../database/schema.sql
```

### Step 4 — Create .env file
```bash
cp .env.example .env
```
Edit `.env` with your actual values:
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=portfolio_db
JWT_SECRET=run_this_to_generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
BCRYPT_ROUNDS=12
```

### Step 5 — Change default admin password
```bash
# Generate bcrypt hash for your new password:
node -e "const b=require('bcryptjs'); b.hash('YourNewPassword123!',12).then(console.log)"

# Copy the hash output, then update in MySQL:
mysql -u root -p portfolio_db -e "UPDATE users SET password_hash='PASTE_HASH_HERE' WHERE username='admin';"
```

### Step 6 — Start backend server
```bash
# Development (auto-restart on file change)
npm run dev

# Production
npm start
```
Server runs at: http://localhost:5000
Health check: http://localhost:5000/api/health

### Step 7 — Open frontend files
Open with VS Code Live Server or any static file server:

```bash
# Option A: VS Code — right-click index.html → Open with Live Server
# Default: http://127.0.0.1:5500

# Option B: Python simple server (from frontend/portfolio/)
python -m http.server 3000
# Visit: http://localhost:3000

# Option C: npx serve
npx serve frontend/portfolio -p 3000
npx serve frontend/admin    -p 3001
```

Portfolio:  http://localhost:3000 (or 5500)
Admin:      http://localhost:3001/index.html
Login with: admin / Admin@1234 (change immediately!)

---

## PART 2 — PRODUCTION DEPLOYMENT (Ubuntu VPS + Nginx + PM2 + SSL)

### REQUIREMENTS
- Ubuntu 20.04 / 22.04 VPS
- Domain name pointed to your server IP (A record)
- Minimum 1GB RAM, 20GB SSD

---

### Step 1 — Connect to server & update
```bash
ssh root@YOUR_SERVER_IP
apt update && apt upgrade -y
```

### Step 2 — Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   # should show v20.x
npm -v
```

### Step 3 — Install MySQL 8
```bash
apt install -y mysql-server
mysql_secure_installation
# Follow prompts: set root password, remove anonymous users, disallow remote root login

# Create app database and user
mysql -u root -p
CREATE DATABASE portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'portfolio_user'@'localhost' IDENTIFIED BY 'StrongDbPassword!';
GRANT ALL PRIVILEGES ON portfolio_db.* TO 'portfolio_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 4 — Install Nginx
```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

### Step 5 — Install PM2 (Node.js process manager)
```bash
npm install -g pm2
```

### Step 6 — Upload project files
```bash
# From your LOCAL machine, upload to server:
scp -r portfolio-app/ root@YOUR_SERVER_IP:/var/www/portfolio-app

# OR use git:
# On server:
cd /var/www
git clone https://github.com/yourusername/portfolio-app.git
```

### Step 7 — Setup backend on server
```bash
cd /var/www/portfolio-app/backend
npm install --production

# Import database schema
mysql -u portfolio_user -p portfolio_db < /var/www/portfolio-app/database/schema.sql

# Create production .env
nano .env
```
Production `.env` contents:
```
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=portfolio_user
DB_PASSWORD=StrongDbPassword!
DB_NAME=portfolio_db
JWT_SECRET=your_64_char_random_secret_here
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
BCRYPT_ROUNDS=12
```

### Step 8 — Start backend with PM2
```bash
cd /var/www/portfolio-app/backend

# Start the app
pm2 start server.js --name "portfolio-api"

# Auto-start on server reboot
pm2 startup
pm2 save

# Useful PM2 commands:
pm2 status             # Check app status
pm2 logs portfolio-api # View logs
pm2 restart portfolio-api
pm2 stop portfolio-api
```

### Step 9 — Update frontend API URLs for production
Before deploying frontend, change the API base URL in both files:

In `frontend/admin/js/auth.js` and `frontend/admin/js/dashboard.js`:
```js
// Change:
const API = 'http://localhost:5000/api';
// To:
const API = 'https://api.yourdomain.com/api';
// OR if API is on same domain:
const API = 'https://yourdomain.com/api';
```

In `frontend/portfolio/js/main.js`:
```js
// Change:
const API  = 'http://localhost:5000/api';
const BASE = 'http://localhost:5000';
// To:
const API  = 'https://yourdomain.com/api';
const BASE = 'https://yourdomain.com';
```

### Step 10 — Configure Nginx
```bash
nano /etc/nginx/sites-available/portfolio
```
Paste this config (replace yourdomain.com):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # ── Portfolio (main site) ──────────────────────────────────
    root /var/www/portfolio-app/frontend/portfolio;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # ── Admin dashboard ────────────────────────────────────────
    location /admin/ {
        alias /var/www/portfolio-app/frontend/admin/;
        try_files $uri $uri/ /admin/index.html;
    }

    # ── API proxy to Node.js backend ──────────────────────────
    location /api/ {
        proxy_pass         http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # ── Static uploads ─────────────────────────────────────────
    location /uploads/ {
        alias /var/www/portfolio-app/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # ── Security headers ───────────────────────────────────────
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # ── Gzip ───────────────────────────────────────────────────
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 256;
}
```
Enable and test:
```bash
ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
nginx -t           # Must say: syntax is ok
systemctl reload nginx
```

### Step 11 — Install SSL with Certbot (HTTPS)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Follow prompts, choose "Redirect HTTP to HTTPS"

# Auto-renew test
certbot renew --dry-run
```
After Certbot, your site is live at https://yourdomain.com ✅

---

## PART 3 — QUICK REFERENCE

### API Endpoints
| Method | Endpoint               | Auth | Description              |
|--------|------------------------|------|--------------------------|
| POST   | /api/auth/login        | No   | Admin login              |
| GET    | /api/auth/me           | JWT  | Get current user         |
| PUT    | /api/auth/change-password | JWT | Change password        |
| GET    | /api/profile           | No   | Get profile              |
| PUT    | /api/profile           | JWT  | Update profile           |
| POST   | /api/profile/photo     | JWT  | Upload profile photo     |
| POST   | /api/profile/cv        | JWT  | Upload CV file           |
| GET    | /api/experiences       | No   | List all experiences     |
| POST   | /api/experiences       | JWT  | Create experience        |
| PUT    | /api/experiences/:id   | JWT  | Update experience        |
| DELETE | /api/experiences/:id   | JWT  | Delete experience        |
| GET    | /api/projects          | No   | List projects            |
| POST   | /api/projects          | JWT  | Create project + upload  |
| PUT    | /api/projects/:id      | JWT  | Update project + upload  |
| DELETE | /api/projects/:id      | JWT  | Delete project           |
| GET    | /api/education         | No   | List education           |
| POST   | /api/education         | JWT  | Create education         |
| PUT    | /api/education/:id     | JWT  | Update education         |
| DELETE | /api/education/:id     | JWT  | Delete education         |
| GET    | /api/certificates      | No   | List certificates        |
| POST   | /api/certificates      | JWT  | Create cert + upload     |
| PUT    | /api/certificates/:id  | JWT  | Update cert + upload     |
| DELETE | /api/certificates/:id  | JWT  | Delete certificate       |
| GET    | /api/skills            | No   | List skills              |
| POST   | /api/skills            | JWT  | Create skill             |
| PUT    | /api/skills/:id        | JWT  | Update skill             |
| DELETE | /api/skills/:id        | JWT  | Delete skill             |
| POST   | /api/contacts          | No   | Submit contact form      |
| GET    | /api/contacts          | JWT  | List messages (admin)    |
| DELETE | /api/contacts/:id      | JWT  | Delete message           |

### Default Admin Credentials
```
Username: admin
Password: Admin@1234
```
⚠️  Change immediately after first login!

### Folder Structure Summary
```
portfolio-app/
├── backend/              Node.js + Express API
│   ├── config/db.js      MySQL connection pool
│   ├── controllers/      8 resource controllers
│   ├── middleware/        JWT auth + Multer upload
│   ├── routes/           8 route files
│   ├── uploads/          User-generated files
│   ├── server.js         App entry point
│   └── .env              Environment config
├── database/
│   └── schema.sql        MySQL schema (9 tables)
└── frontend/
    ├── admin/            Dashboard (Login + CRUD)
    └── portfolio/        Public portfolio site
```

### Troubleshooting
```
# MySQL connection refused
→ sudo systemctl start mysql

# CORS errors
→ Add frontend origin to CORS_ORIGINS in .env, restart backend

# Port 5000 already in use
→ Change PORT in .env, update API URL in frontend JS files

# File upload 413 error
→ Increase client_max_body_size in nginx config (e.g. 10m)
→ Also increase MAX_FILE_SIZE in .env

# PM2 app not starting
→ pm2 logs portfolio-api  (read the error)
→ Check .env exists and DB credentials are correct

# JWT expired / 401 errors in admin
→ Log out and log back in (token will refresh)
```
