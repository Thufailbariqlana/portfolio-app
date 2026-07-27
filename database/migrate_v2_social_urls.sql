-- ============================================================
--  MIGRATION v2 — Add instagram_url, facebook_url, youtube_url
--  to the `profile` table.
--
--  Run this ONLY if the profile table already exists in Aiven
--  and you are updating it (not re-creating from scratch).
--
--  Aiven Console → Query Editor → paste & run:
--
--  ⚠️  NOTE: ADD COLUMN IF NOT EXISTS is NOT supported on
--  older MySQL versions (Aiven). Use plain ADD COLUMN below.
--  If you get "Duplicate column name" error, the column
--  already exists — that is fine, no action needed.
-- ============================================================

USE defaultdb;

ALTER TABLE profile
  ADD COLUMN instagram_url VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN facebook_url  VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN youtube_url   VARCHAR(255) NOT NULL DEFAULT '';
