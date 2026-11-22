# IELTS 60-Day App — Platform Upgrade: Completion + Security Testing Report

**Date:** 22 November 2026
**Scope:** Approved platform upgrade per `PLATFORM-UPGRADE-PLAN.md`, built on the Nord redesign.
**Status:** ✅ Implementation complete. ✅ All local tests pass. ❌ **NOT deployed. NOT pushed to GitHub. Production D1 untouched.**
**Deployment gate:** this report must be reviewed first (per the user's approval). Production backup + migration + deploy are a separate step for the parent agent.

---

## 1. What was built

### 1.1 Pro registration / login (`src/components/AuthScreen.tsx`, rewritten)
- Login / Register / Forgot modes in one screen.
- Register: Full Name (optional), Email, Password, Confirm Password, Show/Hide toggles, live password-strength meter (0–4, Bengali labels), Terms + Privacy acceptance checkboxes (both required — server enforces timestamps), validation with clear Bengali errors, loading + success states.
- Login: Show/Hide toggle, **Remember Me (default checked)** — remembered = 30-day session cookie (`Max-Age=2592000`) + 30-day DB expiry; not remembered = session cookie (no `Max-Age`) + 12-hour DB expiry. Forgot Password link.
- Guest legal view: the Terms / Privacy links open the real legal pages without an account.

### 1.2 Forgot / reset password (real, no fake UI)
- `POST /api/auth/forgot-password` — always returns `{ok:true}` for a well-formed request, whether or not the account exists (no account enumeration). Creates a token, invalidates any earlier unused token for the user, sends email via the Resend HTTPS API.
- `POST /api/auth/reset-password` — validates the SHA-256 token hash, 1-hour expiry, single-use; sets the new password and **revokes ALL sessions** (every device must log in again).
- Reset page (`src/components/ResetPasswordScreen.tsx`, route `/reset-password?token=…`, served by `public/_redirects`) with new password + confirm + strength meter + success state.
- **Fail-closed:** with no `RESEND_API_KEY` the endpoint returns 503 with a clear message ("Password reset is not set up yet — the email service is not configured") instead of pretending an email was sent. If the Resend send fails, the endpoint returns 503 and **deletes the token row** so no stale token lingers.
- **No Resend key exists yet** — see §6 for what the user still owes.

### 1.3 Settings page (`src/sections/SettingsSection.tsx`, new section)
Reachable from the আরও sheet and the desktop pill bar. 8 sub-pages:
- **My Profile** — name/email, edit full name (PATCH, server-validated ≤100 chars).
- **Appearance** — Light / Dark / **System Default** (matchMedia listener; follows the phone theme).
- **Security** — Change Password (verifies the current password, revokes *other* sessions only), Active Sessions list (device/user-agent, expiry, "current" marker) + revoke one / revoke all-but-current, Logout, security info.
- **Notifications** — daily study reminder on/off + reminder time, schedule reminders, in-app notification preferences. **In-app only — no push infrastructure, no service worker, no Web Push** (per the approved plan; true push does not work inside the WebView APK anyway). The Plan page shows an in-app reminder banner for the next block (within 15 min) or the daily reminder window.
- **Study Preferences** — incl. auto-expand-today toggle.
- **Privacy** — policy summary, data collection/usage, account data management incl. **Download my data** (JSON export of progress + block times + settings).
- **Help & Support** — FAQ link, Contact Support (mailto asmitsr.official@gmail.com), Report a Problem.
- **Account Management** — Logout, **Delete Account** with a full explanation of exactly what gets deleted (account, progress, block times, sessions, settings, reset tokens) + password confirmation + checkbox confirmation.

### 1.4 Legal / info pages (`src/sections/InfoSection.tsx`, new section)
Privacy Policy, Terms & Conditions, Disclaimer, FAQ, About, Contact & Support, Data Sources & References — all in the Nord color system, both themes.
- **Sources page renders all 101 resource links** from `src/data/resources.ts`, grouped by type, with **factual attribution only**: Munzeerin PDFs = the public GitHub repo `DynamicBangla/IELTS-Course-by-Munzeerin-Shahid`; Makkar cards = the user's own Sep–Dec 2026 PDF; Moktadir / Dhaka English Lab credited by name. No invented sources, citations, affiliations, or copyright permissions.

### 1.5 Backend (additive only — nothing dropped, renamed, or overwritten)
- **Migration `migrations/0002_platform.sql`** (and `schema.sql` synced): `ALTER TABLE users ADD full_name / terms_accepted_at / privacy_accepted_at`; `ALTER TABLE sessions ADD user_agent`; new tables `password_resets` (id, user_id FK CASCADE, token_hash, expires_at, used_at, created_at; index on user_id) and `user_settings` (user_id PK FK CASCADE, settings_json DEFAULT '{}', updated_at).
- **New endpoints:** `forgot-password`, `reset-password`, `change-password`, `PATCH /api/auth/profile`, `GET /api/auth/sessions`, `POST /api/auth/sessions/revoke`, `GET/PUT /api/settings`, `DELETE /api/auth/account`.
- **Modified:** `register` (optional full_name + server-side consent timestamps), `login` (optional `remember`), `me` (returns full_name + created_at too), `createSession` (takes the session length as a parameter; stores user_agent; short sessions get no `Max-Age`).
- **Tokens:** random 32 bytes, only the SHA-256 hash is stored, 1-hour expiry, single-use, invalidated when a new reset is requested.
- **`.env.example`** documents `RESEND_API_KEY` + `RESEND_FROM`.

### 1.6 Files changed / added (platform scope only)
**Added (14):** `migrations/0002_platform.sql`, `functions/api/auth/forgot-password.ts`, `functions/api/auth/reset-password.ts`, `functions/api/auth/change-password.ts`, `functions/api/auth/profile.ts`, `functions/api/auth/sessions.ts`, `functions/api/auth/sessions/revoke.ts`, `functions/api/auth/account.ts`, `functions/api/settings.ts`, `public/_redirects`, `src/components/ResetPasswordScreen.tsx`, `src/lib/settings.ts`, `src/sections/SettingsSection.tsx`, `src/sections/InfoSection.tsx`.
**Modified (13):** `schema.sql`, `.env.example`, `functions/_lib/auth.ts`, `functions/api/auth/register.ts`, `functions/api/auth/login.ts`, `functions/api/auth/me.ts`, `src/App.tsx`, `src/components/AuthScreen.tsx`, `src/lib/api.ts`, `src/lib/icons.tsx` (13 new icons), `src/lib/sections.ts` (new `settings` + `info` ids; bottom bar unchanged), `src/sections/PlanSection.tsx` (autoExpandToday + ReminderBanner), `src/theme.css` (component styles appended using Nord tokens only — **no token values changed**).
**Untouched:** `src/data/` (all study content), all other Functions, the Nord token blocks.
**Not part of this report's diff:** the pre-existing uncommitted redesign / header-removal / Nord changes and the production deploy sync (same working tree, separate work).

---

## 2. Security design (what protects what)

| Threat | Protection |
|---|---|
| Password theft from DB leak | PBKDF2-HMAC-SHA256, 100,000 iterations (Workers WebCrypto cap), per-user 16-byte random salt, hex-encoded. Verified by independent Python recomputation (§4.3). |
| Account enumeration via forgot-password | Always `{ok:true}` for well-formed requests, existing or not; identical timing path for unknown emails (returns before any send attempt). |
| Reset-token theft from DB leak | Only the SHA-256 hash is stored; the raw token exists only in the email link. |
| Reset-link replay | Single-use (`used_at` set on first use); 1-hour expiry; a new request invalidates earlier tokens. |
| Stolen session after password change/reset | Change password revokes all *other* sessions; reset revokes *all* sessions. |
| Session forgery | Cookie is `<id>.<HMAC(id, SESSION_SECRET)>`; HttpOnly, SameSite=Lax, Secure on HTTPS. |
| Session fixation / over-long sessions | Remembered = 30 days; not remembered = session cookie + 12-hour DB expiry. |
| Cross-user data access | Every data endpoint scopes by the session's user_id; user isolation verified in the original build's E2E and re-checked here (second-device sync shows only the owner's data). |
| Orphaned data after account deletion | Explicit child-row deletes + FK CASCADE on progress / block times / sessions / settings / resets; verified 0 rows remain (§4.1). |
| Settings abuse | Server-side key whitelist (`appearance` / `notifications` / `study`), value validation (theme enum, HH:MM time), 10 KB cap, merge (never full replace). |
| Timing attacks on login | Missing-user logins still run a dummy hash (pre-existing behavior, preserved). |
| Email service misconfiguration | Fail-closed 503, no fake "email sent" message, no token row left behind. |

**Known, plan-approved nuance:** when the email service is *broken* (no key, or send failure), forgot-password returns 503 for an existing email but 200 for an unknown one — a difference observable only while the service is down. This is the fail-closed behavior the plan specified (honest error over a fake success); when the service works, all emails get the same 200 response.

---

## 3. Build

- `npm run build` (tsc + Vite) **passes**. Bundle: JS 398.62 kB / gzip 107.94 kB; CSS 17.71 kB / gzip 4.23 kB (was 342.10 kB / 14.85 kB before the upgrade — the growth is the new Settings/Info/Auth UI; no new dependencies, no new fonts/assets).
- Two build errors were found and fixed during implementation: a dropped `export class ApiError` line in `src/lib/api.ts`, and an unused-import / type error in the Appearance page.
- **No existing test suite exists in the repo** (no test runner configured) — verification below is the E2E + render harness written for this upgrade.

---

## 4. Test results (all local — production never touched, no `--remote` anywhere)

### 4.1 Local D1 E2E — curl against `wrangler pages dev` (46 checks, all pass)
Test script: `/tmp/mig-stage/e2e1.sh` (kept in /tmp; the local DB is the project's `.wrangler/state/v3/d1`).

| Suite | Result |
|---|---|
| Legacy logins after 0002 (2 seeded pre-migration users) | ✅ Both log in; progress `{"1:0":true,"1:1":true,"2:0":true}` + block times intact; `me` returns `full_name: null` for legacy users |
| Wrong password / missing account | ✅ 401 both |
| Register with full_name / without | ✅ 201 both; `me` returns the name / null respectively |
| Duplicate register | ✅ 409 |
| Short password / bad email | ✅ 400 both |
| Remember Me | ✅ Remembered cookie has `Max-Age=2592000`; non-remembered cookie has **no** `Max-Age`; DB expiry 30d vs 12h verified in the sessions table |
| Profile PATCH | ✅ 200; `me` shows the new name |
| Sessions list + revoke | ✅ List shows all sessions with current flag + user-agent; revoke-one → that session 401, current stays 200; revoke-all-others → remaining sessions 401 |
| Settings GET/PUT | ✅ Persists (appearance dark, reminder 06:00, autoExpandToday false); unknown key 400; bad theme 400; bad time `25:99` 400 |
| Change password | ✅ Wrong current 401; correct → 200, other session revoked (401), current session survives, old password 401, new password 200 |
| Second-device sync | ✅ Device-2 login sees device-1's tick, block time, **and** settings |
| Delete account | ✅ Wrong password 401; correct → 200; login after delete 401; DB check: 0 users / 0 progress / 0 settings rows for the deleted account |

Three apparent failures during the run were **test-script bugs, each re-verified passing**: a grep that expected a space in compact JSON (`"appearance": "dark"` vs `"appearance":"dark"`), a revoke check aimed at the wrong cookie file, and a reset test that sent `new_password` where the API (and the frontend) use `password`. The app behaved correctly in all three cases.

### 4.2 Reset-password flow (directly-inserted tokens — no email needed)
| Case | Result |
|---|---|
| Valid token | ✅ 200, password changed, token row `used_at` set |
| Wrong token | ✅ 400 "invalid or has expired" |
| Genuinely expired token (inserted with a past expiry) | ✅ 400 |
| Token reuse (single-use) | ✅ 400 on second use |
| All sessions revoked after reset | ✅ All three of the user's sessions returned 401 |
| Old password / new password | ✅ Old 401, new 200 |
| Other users unaffected | ✅ Unrelated accounts log in normally |

(One insert initially targeted the wrong user id — the test's mistake, not the app's; the reset correctly applied to the user the token belonged to, which itself confirmed the token→user binding.)

### 4.3 Migration test on a seeded copy + rollback test
- Fresh local D1 with **0001 only**, seeded with 2 legacy users (PBKDF2 hashes computed in Python) + 4 progress rows + 3 block times; snapshot saved at `/tmp/mig-stage/d1-pre-0002` (+ `seed.sql`).
- **0002 applied → all rows intact** (2 users, 4 progress, 3 block times), both users `full_name` NULL, new tables empty. Legacy logins work after migration (§4.1).
- **Rollback test passed:** the pre-0002 snapshot was restored into a scratch copy and verified with SQLite + Python — tables are exactly the 0001 set (no `password_resets` / `user_settings`), `users` has no new columns, `sessions` has no `user_agent`, row counts are 2 / 4 / 3, and **both legacy passwords verify** against the stored PBKDF2 hashes (100,000 iterations). The snapshot is a valid restore target.

### 4.4 Forgot-password fail-closed paths
| Case | Result |
|---|---|
| No `RESEND_API_KEY` (existing + ghost email) | ✅ Both 503, identical clear error ("email service is not configured") |
| Dummy key, existing email (send fails) | ✅ 503 "Could not send the reset email"; the new token row was deleted (unused-token count 1 → 0); the earlier unused token for the user was invalidated as designed |
| Dummy key, ghost email / invalid email format | ✅ 200 `{ok:true}` (no enumeration) |

Note: in local dev the workerd fetch to api.resend.com fails at the network layer (no egress proxy inside workerd), so the send-failure path was exercised via the code's catch branch — the same branch a Resend 401/4xx takes. A real end-to-end email delivery test is impossible until the user provides a real key (§6).

### 4.5 Render check — jsdom, 92/92 pass
Harness: `/tmp/ielts-render-check/render-platform.js` (mocked API, built bundle, both themes).
- Built CSS: Nord tokens intact (`#2e3440`, `#88c0d0`, `#4e6e96`, `--progress`, no `--gold`, no old hexes); new `.auth-card` / `.strength` / `.setting-row` / `.session-row` / `.back-row` styles present.
- All **9 sections** render (7 original + Settings + Info); 9 pills; bottom nav still 5 items; আরও sheet lists Settings + Info.
- All **8 Settings sub-pages** open with the correct heading, content verified (profile shows the email; appearance has Light/Dark/System Default; security shows 2 session rows + change-password form; notifications/study have toggles; privacy has the download option; help shows the support email; account has delete + password confirmation), and back-navigation returns to the list each time.
- All **7 Info pages** open (FAQ/About titles carry a Bengali suffix — "FAQ — সাধারণ প্রশ্ন" — as designed); Sources page renders **101 links** and credits the Munzeerin repo + Makkar; Contact shows asmitsr.official@gmail.com.
- Guest flows: AuthScreen login (email/password, Remember me, Forgot link, show/hide toggle); register mode (Full Name, strength meter — typed `StrongPass123!` → "Password strength: শক্তিশালী", Terms + Privacy checkboxes); Terms link opens the guest legal page and back-navigation returns to auth (page → list → auth); forgot mode submits and shows the success message.
- Reset page (`/reset-password?token=…`) renders new-password + confirm fields + submit.
- Theme toggle flips light↔dark and persists in localStorage; a fresh load with a seeded dark preference starts dark; Settings renders in dark mode.
- **Zero console/jsdom errors. Zero Bengali digits rendered. No 'রিল' wording.**

### 4.6 Content counts unchanged (source data + DOM)
60 days · 233 tasks · 8 Sunday mocks [7, 14, 21, 28, 35, 42, 49, 56] · 101 resource URLs · 148 cue cards · 38 steps (34 + 4) · 12 techniques · Day 1 = 2026-11-23 · Day 60 = 2027-01-21 · mock timing L 30 / R 60 / W 60 / S 15. All verified from `src/data/plan.json` + `resources.ts` and re-confirmed in the rendered DOM.

---

## 5. What was NOT verified (honest gaps)

1. **Real email delivery** — no Resend key exists yet, so no real reset email has ever been sent or received. The full happy path (request → inbox → click link → reset) needs the key (§6) and one live test after deployment.
2. **True-browser visual check** — the new pages were verified in jsdom (DOM/behavior/content), not in a real browser at 390px. The Nord pages got real screenshots; the Settings/Info/Auth pages have not. Recommend a Playwright screenshot pass after deployment (the relay + scripts in `~/workspace/ielts-screenshots/` already exist).
3. **On-device check** — as always, the user's phone is the final check, especially the new AuthScreen and Settings pages.
4. **Production migration** — 0002 has only run on local D1. The production backup + apply + live-login verification is the parent's next step (see §7).

---

## 6. What the user still owes (Resend setup)

1. Create a free Resend account at https://resend.com (free tier: 100 emails/day).
2. Create an API key in the Resend dashboard and provide it **via the secure credential interface only — never in chat**.
3. The parent stores it as a Pages secret: `RESEND_API_KEY` (via `wrangler pages secret put`, same as `SESSION_SECRET`). Optional: `RESEND_FROM` to set a custom sender; the default is Resend's onboarding sender `IELTS 60-Day App <onboarding@resend.dev>`.
4. **Limitation to tell the user:** without a verified custom domain, Resend's onboarding sender can only send to the Resend account owner's own email address. That covers the app's current users (both accounts are his), but it is not a general solution — if other people ever register, a verified domain is needed for their reset emails.
5. Until the key is set, forgot-password stays in its honest fail-closed state (503 + clear message); every other feature works without it.

---

## 7. Deployment checklist (for the parent agent — not done by this build)

1. **Back up production D1 first** (export/dump before any migration).
2. Apply `migrations/0002_platform.sql` to production (`wrangler d1 migrations apply ielts-60day-db --remote`).
3. Verify live: both existing users (`alivrohan@gmail.com`, `sellcoc505@gmail.com`) can still log in; their progress/block times are intact; `me` returns `full_name: null` for them.
4. Deploy the new build (`wrangler pages deploy dist`).
5. Live E2E: register/login, settings save, sessions list, change password, delete-account on a throwaway account, then delete the throwaway.
6. Set `RESEND_API_KEY` once the user provides it; test one real reset email to his own address.
7. Screenshot pass (both themes, new pages) + GitHub sync push (this diff + the earlier uncommitted redesign/header/Nord changes) — only with the user's approval, one push, while present.

---

## 8. Local test state (for the record)

- Local D1 (`.wrangler/state/v3/d1`, never production) contains test users only: `legacy1/legacy2@ielts-60day.test`, `new1/new2@ielts-60day.test` (new2's password was changed by the reset test), plus used/expired reset-token rows. Safe to wipe or leave — it is local-only and gitignored.
- `.dev.vars` holds only a test-only `SESSION_SECRET` (the dummy `RESEND_API_KEY` used for the send-failure test was removed after the test). `.dev.vars` is gitignored.
- Test artifacts: `/tmp/mig-stage/` (E2E script, migration snapshot, cookies, logs), `/tmp/ielts-render-check/render-platform.js` (92-check harness). Both are /tmp scratch, not part of the repo.
- Two stale `wrangler pages dev` servers from earlier sessions (ports 8788/8789, wedged) were killed during testing; the test server on 8790 and the static server on 8901 were stopped after the final checks. No servers are left running.
