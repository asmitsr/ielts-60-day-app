-- 0003_ai_settings: per-user AI provider settings (own API key, AES-GCM
-- encrypted). ADDITIVE ONLY — no existing table or column is touched.
-- The API key is stored encrypted (key_enc + iv, base64url); the plaintext
-- key is never stored. The encryption key comes from env AI_KEY_SECRET
-- (SHA-256 of the secret as the AES key). Without AI_KEY_SECRET the AI
-- endpoints fail closed with 503.
-- Apply with: wrangler d1 migrations apply ielts-60day-db
-- (add --local for the local dev database).

CREATE TABLE IF NOT EXISTS ai_settings (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  base_url TEXT NOT NULL,
  model TEXT NOT NULL,
  key_enc TEXT NOT NULL,
  iv TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
