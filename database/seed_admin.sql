-- ============================================================
--  PORTFOLIO APP — Admin Seeder
--  Run AFTER schema.sql to insert the first admin account.
--
--  Default login:
--    Username : admin
--    Password : Admin@1234
--
--  ⚠️  CHANGE THE PASSWORD immediately after your first login!
--
--  To generate a new bcrypt hash for a custom password:
--    node -e "const b=require('bcryptjs'); b.hash('YourPassword',12).then(console.log)"
--  Then replace the hash in the INSERT below.
--
--  Run:
--    mysql -u avnadmin -p --ssl-mode=REQUIRED defaultdb < seed_admin.sql
-- ============================================================

USE defaultdb;   -- ← Change to your DB_NAME if different (e.g. portfolio_db)

-- Remove existing admin (idempotent re-run safe)
DELETE FROM users WHERE username = 'admin';

-- Insert admin with bcrypt hash of 'Admin@1234' (rounds=12)
INSERT INTO users (username, email, password_hash, role)
VALUES (
  'admin',
  'admin@portfolio.dev',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGxmFzQjDSHSBrpR2Qnl/4yNAe.',
  'admin'
);

-- ============================================================
--  Seed blank profile row (so /api/profile always returns data)
-- ============================================================
INSERT IGNORE INTO profile (id, full_name, title, bio, email)
VALUES (1, 'Your Name', 'Full-Stack Developer', 'Write your bio here.', 'admin@portfolio.dev');

-- Confirm
SELECT id, username, email, role, created_at FROM users WHERE username = 'admin';
