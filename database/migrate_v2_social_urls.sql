-- ============================================================
--  MIGRATION v2 — Add instagram_url, facebook_url, youtube_url
--  to the `profile` table.
--
--  Run this ONLY if the profile table already exists in Aiven
--  and you are updating it (not re-creating from scratch).
--
--  Aiven Console → Query Editor → paste & run:
-- ============================================================

USE defaultdb;

-- Add columns only if they don't already exist (idempotent)
ALTER TABLE profile
  ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook_url  VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube_url   VARCHAR(255) NOT NULL DEFAULT '';
