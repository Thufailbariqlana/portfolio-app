-- ============================================================
--  MIGRATION v3 — Bilingual (EN + ID) content columns
--  Run in Aiven Console → Query Editor
--
--  Adds *_id columns alongside every user-authored text field.
--  The frontend reads the right column based on lang toggle.
--
--  ⚠️  Plain ADD COLUMN (no IF NOT EXISTS — not supported on Aiven).
--      If you get "Duplicate column name", the column is already
--      there — skip that line and run the rest.
-- ============================================================

USE defaultdb;

-- ── profile ──────────────────────────────────────────────────────
ALTER TABLE profile
  ADD COLUMN title_id   VARCHAR(160) NOT NULL DEFAULT '' AFTER title,
  ADD COLUMN bio_id     TEXT                             AFTER bio;

-- ── experiences ──────────────────────────────────────────────────
ALTER TABLE experiences
  ADD COLUMN position_id    VARCHAR(160) NOT NULL DEFAULT '' AFTER position,
  ADD COLUMN description_id TEXT                             AFTER description;

-- ── projects ─────────────────────────────────────────────────────
ALTER TABLE projects
  ADD COLUMN title_id      VARCHAR(200) NOT NULL DEFAULT '' AFTER title,
  ADD COLUMN short_desc_id VARCHAR(300) NOT NULL DEFAULT '' AFTER short_desc,
  ADD COLUMN description_id TEXT                            AFTER description;

-- ── education ────────────────────────────────────────────────────
ALTER TABLE education
  ADD COLUMN degree_id       VARCHAR(160) NOT NULL DEFAULT '' AFTER degree,
  ADD COLUMN field_of_study_id VARCHAR(160) NOT NULL DEFAULT '' AFTER field_of_study,
  ADD COLUMN description_id  TEXT                             AFTER description;

-- ── certificates ─────────────────────────────────────────────────
ALTER TABLE certificates
  ADD COLUMN name_id   VARCHAR(200) NOT NULL DEFAULT '' AFTER name;

-- ── skills ───────────────────────────────────────────────────────
ALTER TABLE skills
  ADD COLUMN category_id VARCHAR(80) NOT NULL DEFAULT '' AFTER category;
