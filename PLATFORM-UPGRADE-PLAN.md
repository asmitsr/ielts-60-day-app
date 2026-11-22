# IELTS 60-Day App — Platform Upgrade Plan

Prepared 22 Nov 2026 after a full inspection of the existing codebase.
**No code has been changed for this upgrade yet.** Implementation starts only
after the user approves this plan (his rule: explain every backend change
before making it).

## 1. What exists today (inspected)

- **Auth UI** (`src/components/AuthScreen.tsx`): email + password only. No full
  name, no confirm password, no show/hide, no strength indicator, no
  forgot-password link, no Terms/Privacy acceptance. Basic client validation
  (email contains `@`, password ≥ 8 chars).
- **Backend** (Cloudflare Pages Functions + D1, `functions/`):
  - `users`: id, email (UNIQUE), password_hash, salt, created_at.
    No full_name, no consent columns.
  - `sessions`: id (random hex), user_id, expires_at (unix), created_at.
    No device/user-agent info. Logout deletes the row.
  - `task_progress`, `block_times`: user-scoped, `ON DELETE CASCADE`.
  - Passwords: PBKDF2-HMAC-SHA256, 100,000 iterations (Workers WebCrypto cap),
    per-user 16-byte salt.
  - Sessions: HMAC-signed cookie (`session=<id>.<sig>`), HttpOnly,
    SameSite=Lax, Secure on HTTPS, fixed 30-day expiry. No remember-me
    distinction. No rate limiting.
  - Endpoints: `POST /api/auth/register` (8–128 char password,
    ALLOW_REGISTRATION gate, 409 on duplicate), `POST /api/auth/login`
    (generic 401, hashes even for missing users), `GET /api/auth/me`
    (returns email only), `POST /api/auth/logout`, plus progress and
    block-times endpoints (all `WHERE user_id = ?`).
- **No email infrastructure anywhere.** Pages Functions cannot send email by
  themselves. No settings/preferences storage. No push-notification
  infrastructure. No legal/info pages. Navigation is 7 sections
  (`src/lib/sections.ts`); bottom bar = first 4, rest in the "আরও" sheet.
- **Live data to preserve:** 2 user accounts, their sessions, all
  task_progress and block_times rows. Nothing is deleted or reset by this plan.

## 2. Frontend-only work (zero backend change)

- Register/Login UI: Full Name field (stored — see §3.1), Confirm Password,
  Show/Hide Password, password strength indicator, per-field validation,
  loading and success states, proper error messages.
- Legal & info pages (new sections, same design system): Privacy Policy,
  Terms & Conditions, Disclaimer, FAQ, About This Application,
  Contact & Support, Data Sources & References, Copyright & Attribution.
  The Sources page renders the existing 101 resource links from
  `src/data/resources.ts` grouped by type (IELTS prep, mocks, Reading,
  Listening, Writing, Speaking/cue cards, books/reference, third-party
  attribution). **No invented sources, citations, affiliations, or
  permissions** — only what the app already links, plus factual notes
  (e.g. Munzeerin PDFs come from the public GitHub repo
  DynamicBangla/IELTS-Course-by-Munzeerin-Shahid; Makkar cue cards are
  from the user's own Sep–Dec 2026 PDF; Moktadir/Dhaka English Lab
  material is credited to those creators).
- Appearance: System Default theme (matchMedia) in addition to Light/Dark.
- In-app study reminders (banners inside the app when a study block is due).
  See §5 for what push notifications would really take.

## 3. Backend changes — minimum, backward-compatible

All changes are **additive**: new nullable columns, new tables, new endpoints.
No existing column is altered, no existing row is deleted or rewritten, no
existing endpoint changes behaviour except where noted (and only by adding
optional fields).

### Migration 0002 (`migrations/0002_platform.sql`)

```sql
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
```

Why each piece:
- `full_name`, `terms_accepted_at`, `privacy_accepted_at`: registration
  collects them; existing users get NULL (shown as "not set" until they
  fill in Edit Profile — nothing is forced on them).
- `sessions.user_agent`: lets the Active Sessions list show device/browser.
  Existing sessions show "Unknown device".
- `password_resets`: forgot-password tokens. Only the SHA-256 hash is
  stored (a leaked DB cannot be used to reset passwords); 1-hour expiry;
  single-use (`used_at`); invalidated when a new reset is requested.
- `user_settings`: one JSON row per user for appearance, notification and
  study preferences, so settings sync across devices like progress does.

### New endpoints

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/forgot-password` | Accepts an email, creates a reset token, sends the email. Always returns success (no account enumeration). |
| `POST /api/auth/reset-password` | Accepts token + new password, validates hash/expiry/single-use, sets the new password, revokes ALL sessions. |
| `POST /api/auth/change-password` | Verifies current password, sets new one, revokes other sessions. |
| `PATCH /api/auth/profile` | Updates full_name (own account only). |
| `GET /api/auth/sessions` | Lists the user's own sessions (created_at, expiry, device). |
| `POST /api/auth/sessions/revoke` | Revokes one session, or all except the current one. |
| `GET /api/settings`, `PUT /api/settings` | Read/write the user's settings JSON. |
| `DELETE /api/auth/account` | Deletes the user after password confirmation; CASCADE removes progress, block times, sessions, settings, resets. |

### Modified endpoints (additive only)

- `POST /api/auth/register`: accepts optional `full_name` + consent
  timestamps; still 201 + session cookie.
- `POST /api/auth/login`: accepts optional `remember` boolean. Remember =
  current 30-day session. Not remembered = session cookie with no Max-Age
  (ends when the browser closes) + 12-hour DB expiry.
- `GET /api/auth/me`: also returns `full_name` and `created_at`.
- `createSession` (shared helper): takes the session length as a parameter
  instead of a hardcoded 30 days.

### Migration safety

The migration is tested on a local D1 seeded with the current schema plus
sample users/progress before it ever touches production: apply 0002, verify
every existing row is intact, verify login still works for the old accounts.
Only then is it applied to production via `wrangler d1 migrations apply`,
followed by a live login + progress check on the real accounts.

## 4. Forgot password — the email decision (needs the user)

The token flow above is fully implementable. The only missing piece is
**sending the email**. Cloudflare Pages has no built-in mail sending.

**Option A — Resend (recommended, free):** Resend's free tier allows 100
emails/day via a simple HTTPS API call from the Function. Needs: a Resend
account + an API key stored as a Pages secret (never in code). Limitation:
without a verified custom domain, Resend's onboarding sender address can
only send to the account owner's own email. This app has no custom domain
(it lives on `*.pages.dev`, which cannot be DNS-verified), so reset emails
would only reach the Resend account owner's inbox. For this app that is
acceptable in practice — both accounts on it belong to the user — but it is
NOT a general solution for other users. If a custom domain is added later,
the same code works for everyone.
**Option B — another free transactional service** (Brevo 300/day, Mailjet
200/day): same domain-verification limitation, more setup.
**Option C — defer forgot password:** implement everything else now; the
forgot-password flow ships only when an email service is connected. No fake
interface is ever shown.

## 5. Notifications — honest limitation

Real push notifications (alerts when the app is closed) need a service
worker + Web Push subscription + VAPID keys + a scheduled push sender, and
**they do not work inside the WebView APK at all** (no push in a debug
WebView wrapper). That is a large, separate project. What this upgrade
delivers instead: notification preferences stored per user (daily reminders
on/off, reminder time) + in-app reminder banners + the existing phone Clock
alarms. If the user wants true push later, it is planned as its own phase
(PWA install + VAPID + sender) — and it still would not reach the APK.

## 6. What does NOT change

- All study content: 60 days, 233 tasks, 8 Sunday mocks, 101 resources,
  148 cue cards, 38 steps, 12 techniques. Untouched.
- Existing users, passwords, sessions, progress, block times. Untouched
  (migration is additive; verified on a seeded copy first).
- Design system: Midnight Navy / Champagne Gold / Deep Teal / Warm Ivory,
  Noto Sans Bengali, English numerals, minimal premium style.

## 7. Testing (before delivery)

- Register (valid/invalid/duplicate/short password/mismatched confirm) and
  login (right/wrong/missing account) via live API.
- Password strength + show/hide + validation in the UI.
- Forgot password end-to-end (request → email → reset link → new password
  → old password rejected → sessions revoked). Only if Option A/B is chosen.
- Change password, edit profile, settings save + reload + second-device sync.
- Active sessions list + revoke one + revoke all others.
- Delete account with confirmation (on a throwaway account, never a real one).
- Light / Dark / System Default theme on every new page.
- All legal/info pages render; every internal link works; Sources page
  shows all 101 links with correct destinations.
- Mobile responsiveness at 390px on every new page.
- Regression: existing login, tick-offs, block times, multi-device sync all
  still work after the migration.

## 8. Sequencing

The header-removal work (in progress on the same files: App.tsx,
MoreSheet.tsx, theme.css) lands and deploys FIRST. This upgrade is
implemented on top of the header-free code, then deployed and tested.
