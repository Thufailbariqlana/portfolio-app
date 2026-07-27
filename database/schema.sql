-- ============================================================
--  PORTFOLIO APP — DATABASE SCHEMA
--  Compatible with: MySQL 8+ / Aiven MySQL
--
--  Local:  mysql -u root -p portfolio_db < schema.sql
--  Aiven:  Jalankan via Query Editor di Aiven Console,
--          atau: mysql -u avnadmin -p --ssl-mode=REQUIRED defaultdb < schema.sql
-- ============================================================

-- [1] DATABASE
-- Untuk Aiven: defaultdb sudah ada, tidak perlu CREATE DATABASE.
-- Untuk lokal: buat portfolio_db jika belum ada.
CREATE DATABASE IF NOT EXISTS portfolio_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Aiven pakai: USE defaultdb;
-- Lokal pakai:  USE portfolio_db;
-- Ganti baris di bawah sesuai environment kamu:
USE defaultdb;

-- ============================================================
-- [2] TABLE: users  (Admin accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  username      VARCHAR(60)       NOT NULL UNIQUE,
  email         VARCHAR(120)      NOT NULL UNIQUE,
  password_hash VARCHAR(255)      NOT NULL,
  role          ENUM('admin','editor') NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- [3] TABLE: profile  (Biodata / personal info — single row)
-- ============================================================
CREATE TABLE IF NOT EXISTS profile (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  full_name       VARCHAR(120)  NOT NULL DEFAULT '',
  title           VARCHAR(160)  NOT NULL DEFAULT '',
  bio             TEXT,
  email           VARCHAR(120)  NOT NULL DEFAULT '',
  phone           VARCHAR(30)   NOT NULL DEFAULT '',
  location        VARCHAR(120)  NOT NULL DEFAULT '',
  website         VARCHAR(255)  NOT NULL DEFAULT '',
  github_url      VARCHAR(255)  NOT NULL DEFAULT '',
  linkedin_url    VARCHAR(255)  NOT NULL DEFAULT '',
  twitter_url     VARCHAR(255)  NOT NULL DEFAULT '',
  photo_url       VARCHAR(255)  NOT NULL DEFAULT '',
  cv_url          VARCHAR(255)  NOT NULL DEFAULT '',
  years_of_exp    SMALLINT      NOT NULL DEFAULT 0,
  open_to_work    TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed single profile row
INSERT IGNORE INTO profile (id, full_name, title, bio, email)
VALUES (1, 'Your Name', 'Full-Stack Developer', 'Write your bio here.', 'you@example.com');

-- ============================================================
-- [4] TABLE: experiences  (Work history)
-- ============================================================
CREATE TABLE IF NOT EXISTS experiences (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  company       VARCHAR(160)  NOT NULL,
  position      VARCHAR(160)  NOT NULL,
  location      VARCHAR(120)  NOT NULL DEFAULT '',
  start_date    DATE          NOT NULL,
  end_date      DATE                   DEFAULT NULL,
  is_current    TINYINT(1)    NOT NULL DEFAULT 0,
  description   TEXT,
  tech_stack    VARCHAR(255)  NOT NULL DEFAULT '',
  sort_order    SMALLINT      NOT NULL DEFAULT 0,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- [5] TABLE: projects  (Portfolio projects)
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  title           VARCHAR(200)  NOT NULL,
  slug            VARCHAR(220)  NOT NULL UNIQUE,
  short_desc      VARCHAR(300)  NOT NULL DEFAULT '',
  description     TEXT,
  image_url       VARCHAR(255)  NOT NULL DEFAULT '',
  demo_url        VARCHAR(255)  NOT NULL DEFAULT '',
  repo_url        VARCHAR(255)  NOT NULL DEFAULT '',
  tech_stack      VARCHAR(255)  NOT NULL DEFAULT '',
  category        VARCHAR(80)   NOT NULL DEFAULT 'General',
  metric_users    VARCHAR(60)   NOT NULL DEFAULT '',
  metric_perf     VARCHAR(60)   NOT NULL DEFAULT '',
  metric_custom   VARCHAR(120)  NOT NULL DEFAULT '',
  is_featured     TINYINT(1)    NOT NULL DEFAULT 0,
  sort_order      SMALLINT      NOT NULL DEFAULT 0,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_slug  (slug),
  INDEX idx_feat  (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- [6] TABLE: education
-- ============================================================
CREATE TABLE IF NOT EXISTS education (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  institution   VARCHAR(200)  NOT NULL,
  degree        VARCHAR(160)  NOT NULL,
  field_of_study VARCHAR(160) NOT NULL DEFAULT '',
  start_year    YEAR          NOT NULL,
  end_year      YEAR                   DEFAULT NULL,
  is_current    TINYINT(1)    NOT NULL DEFAULT 0,
  gpa           DECIMAL(3,2)           DEFAULT NULL,
  description   TEXT,
  sort_order    SMALLINT      NOT NULL DEFAULT 0,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- [7] TABLE: certificates
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name            VARCHAR(200)  NOT NULL,
  issuer          VARCHAR(200)  NOT NULL,
  issue_date      DATE          NOT NULL,
  expiry_date     DATE                   DEFAULT NULL,
  credential_id   VARCHAR(120)  NOT NULL DEFAULT '',
  credential_url  VARCHAR(255)  NOT NULL DEFAULT '',
  image_url       VARCHAR(255)  NOT NULL DEFAULT '',
  sort_order      SMALLINT      NOT NULL DEFAULT 0,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- [8] TABLE: skills
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name        VARCHAR(80)   NOT NULL,
  category    VARCHAR(80)   NOT NULL DEFAULT 'General',
  level       TINYINT UNSIGNED NOT NULL DEFAULT 80 COMMENT '0-100 proficiency',
  icon_url    VARCHAR(255)  NOT NULL DEFAULT '',
  sort_order  SMALLINT      NOT NULL DEFAULT 0,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- [9] TABLE: contacts  (Messages from portfolio visitors)
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  sender_name  VARCHAR(120)  NOT NULL,
  sender_email VARCHAR(120)  NOT NULL,
  subject      VARCHAR(200)  NOT NULL DEFAULT '',
  message      TEXT          NOT NULL,
  attachment   VARCHAR(255)           DEFAULT NULL,
  is_read      TINYINT(1)    NOT NULL DEFAULT 0,
  replied_at   TIMESTAMP              DEFAULT NULL,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- [10] DEFAULT ADMIN USER  (password: Admin@1234)
--  Hash valid untuk 'Admin@1234' dengan bcrypt rounds=12
--  ⚠️  GANTI PASSWORD SEGERA setelah login pertama!
-- ============================================================
INSERT IGNORE INTO users (id, username, email, password_hash, role)
VALUES (
  1,
  'admin',
  'admin@portfolio.dev',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGxmFzQjDSHSBrpR2Qnl/4yNAe.',
  'admin'
);
-- NOTE: Generate hash baru dengan:
--   node -e "const b=require('bcryptjs'); b.hash('YourNewPassword',12).then(console.log)"
