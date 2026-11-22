-- 0002_platform: profile fields, session device info, password resets,
-- per-user settings. ADDITIVE ONLY — no existing table or column is
-- dropped, renamed, or rewritten; existing rows get NULL/default values.
-- Test on a seeded local copy before applying to production, and apply
-- this migration BEFORE deploying the code that uses the new columns.
-- Applied with: wrangler d1 migrations apply ielts-60day-db
-- (add --local for the local dev database).

ALTER TABLE users ADD COLUMN full_name TEXT;
ALTER TABLE users ADD COLUMN terms_accepted_at TEXT;
ALTER TABLE users ADD COLUMN privacy_accepted_at TEXT;
ALTER TABLE sessions ADD COLUMN user_agent TEXT;

CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_resets_user ON password_resets(user_id);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  settings_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
