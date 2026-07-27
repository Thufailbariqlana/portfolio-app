-- ============================================================
--  PORTFOLIO APP — SAFE MIGRATION (all versions combined)
--  Compatible with Aiven MySQL 8+
--
--  HOW TO RUN:
--  1. Open Aiven Console → your MySQL service → Query Editor
--  2. Paste this ENTIRE file and click "Run"
--  3. Run each ALTER block ONE AT A TIME if you hit errors.
--     "Duplicate column name" = column already exists → skip it
--
--  WHAT THIS DOES:
--  ✓ Migration v2 — instagram_url, facebook_url, youtube_url on profile
--  ✓ Migration v3 — all _id bilingual columns on all 6 tables
--
--  ⚠️  Aiven MySQL does NOT support "ADD COLUMN IF NOT EXISTS".
--      Each ADD COLUMN will error if the column already exists.
--      That is safe — just skip that statement and continue.
-- ============================================================

USE defaultdb;

-- ============================================================
-- MIGRATION v2 — Social URL columns on profile
-- (Skip any line that gives "Duplicate column name" error)
-- ============================================================
ALTER TABLE profile
  ADD COLUMN instagram_url VARCHAR(255) NOT NULL DEFAULT '' AFTER twitter_url;

ALTER TABLE profile
  ADD COLUMN facebook_url VARCHAR(255) NOT NULL DEFAULT '' AFTER instagram_url;

ALTER TABLE profile
  ADD COLUMN youtube_url VARCHAR(255) NOT NULL DEFAULT '' AFTER facebook_url;

-- ============================================================
-- MIGRATION v3 — Bilingual (_id) columns
-- (Skip any line that gives "Duplicate column name" error)
-- ============================================================

-- ── profile ──────────────────────────────────────────────────────────────────
ALTER TABLE profile
  ADD COLUMN title_id VARCHAR(160) NOT NULL DEFAULT '' AFTER title;

ALTER TABLE profile
  ADD COLUMN bio_id TEXT AFTER bio;

-- ── experiences ───────────────────────────────────────────────────────────────
ALTER TABLE experiences
  ADD COLUMN position_id VARCHAR(160) NOT NULL DEFAULT '' AFTER position;

ALTER TABLE experiences
  ADD COLUMN description_id TEXT AFTER description;

-- ── projects ──────────────────────────────────────────────────────────────────
ALTER TABLE projects
  ADD COLUMN title_id VARCHAR(200) NOT NULL DEFAULT '' AFTER title;

ALTER TABLE projects
  ADD COLUMN short_desc_id VARCHAR(300) NOT NULL DEFAULT '' AFTER short_desc;

ALTER TABLE projects
  ADD COLUMN description_id TEXT AFTER description;

-- ── education ─────────────────────────────────────────────────────────────────
ALTER TABLE education
  ADD COLUMN degree_id VARCHAR(160) NOT NULL DEFAULT '' AFTER degree;

ALTER TABLE education
  ADD COLUMN field_of_study_id VARCHAR(160) NOT NULL DEFAULT '' AFTER field_of_study;

ALTER TABLE education
  ADD COLUMN description_id TEXT AFTER description;

-- ── certificates ──────────────────────────────────────────────────────────────
ALTER TABLE certificates
  ADD COLUMN name_id VARCHAR(200) NOT NULL DEFAULT '' AFTER name;

-- ── skills ────────────────────────────────────────────────────────────────────
ALTER TABLE skills
  ADD COLUMN category_id VARCHAR(80) NOT NULL DEFAULT '' AFTER category;

-- ============================================================
-- VERIFY: Check all new columns exist
-- Run this SELECT to confirm the migration worked:
-- ============================================================
-- SELECT COLUMN_NAME, TABLE_NAME
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_SCHEMA = 'defaultdb'
--   AND COLUMN_NAME LIKE '%_id'
--   AND TABLE_NAME IN ('profile','experiences','projects','education','certificates','skills')
-- ORDER BY TABLE_NAME, COLUMN_NAME;
