# IELTS 60-Day App (standalone)

A complete, portable IELTS 60-day study tracker — 60-day plan with tick-offs,
weekly Sunday full mocks, 101 resources, practice links, step guides, exam
format guide, 148 Makkar cue cards, and 12 techniques. Bengali UI with
Noto Sans Bengali typography and English numerals (0–9).

**Stack:** React + TypeScript + Vite frontend · Cloudflare Pages Functions
backend · Cloudflare D1 (SQLite) database · per-user accounts with
password hashing (PBKDF2) and cookie sessions. Free tier only — no paid
services. Deploy target is Cloudflare Pages (not Vercel).

> This is the standalone version of the IELTS 60-Day App. The original
> Muse-hosted app is a separate deployment and is untouched by this repo.

## Features

- **60-day plan** (Day 1 = 23 Nov 2026 → Day 60 = 21 Jan 2027), 6 hours/day
  (Listening 2h, Reading 2h, Writing 1.5h, Speaking 30 min), 233 tasks
- **Weekly full mocks** every Sunday (Days 7, 14, 21, 28, 35, 42, 49, 56)
  with real exam timing (Listening 30, Reading 60, Writing 60, Speaking 15
  min) and 6 free mock sources
- **Tick-offs and block times saved per user in D1** — same account on any
  device shows the same progress (multi-device sync via login)
- **Auth:** registration + login, PBKDF2-HMAC-SHA256 password hashing
  (600,000 iterations, unique salt per user), httpOnly / Secure / SameSite
  session cookies. Open registration can be disabled for private deploys.
- **7 sections:** Plan, Steps Guide, Practice, Resources, Exam Format,
  Cue Cards, Techniques
- **Design:** deep-emerald hero with progress ring, design tokens,
  light + dark modes, mobile bottom navigation + "আরও" sheet, desktop
  pill bar. Fonts bundled as woff2 (Inter, Noto Sans Bengali, Hind Siliguri)
- **No secrets in the frontend.** All D1 access is server-side (Pages
  Functions). The session secret lives in `wrangler pages secret` /
  `.dev.vars` only.

## Project structure

```
├── index.html                 # entry HTML (lang="bn")
├── src/
│   ├── main.tsx               # React entry
│   ├── App.tsx                # auth gate, theme, navigation, state
│   ├── theme.css              # design tokens, fonts, all component styles
│   ├── data/
│   │   ├── plan.json          # 60-day plan, mocks, cue cards, techniques
│   │   ├── resources.ts       # 101 resource links in 10 groups
│   │   ├── practice.ts        # per-module practice links
│   │   ├── steps.ts           # per-section step guides
│   │   └── formatGuide.ts     # exam format facts
│   ├── lib/                   # api client, digit/date helpers, icons, sections
│   ├── components/            # hero, day rows, mock panel, nav, auth, ...
│   └── sections/              # the 7 sections
├── functions/                 # Cloudflare Pages Functions (server-side only)
│   ├── _lib/auth.ts           # password hashing, sessions, validation
│   └── api/
│       ├── auth/              # register, login, logout, me
│       ├── progress.ts        # GET/POST /api/progress
│       └── block-times.ts     # GET/POST /api/block-times
├── migrations/
│   └── 0001_init.sql          # D1 schema (users, sessions, progress, block times)
├── schema.sql                 # same schema as a readable reference
├── public/fonts/              # bundled woff2 fonts (no Google Fonts import)
├── wrangler.toml              # Pages + D1 binding config
└── .env.example               # every environment variable, documented
```

## Prerequisites

- Node.js 18+ and npm
- A free Cloudflare account (only needed for real deployment, not for
  local development)

## Installation & local development

```bash
npm install
```

Set a local session secret (any random 32+ byte value; never commit it):

```bash
cp .env.example .dev.vars
# edit .dev.vars and set SESSION_SECRET, e.g. from: openssl rand -hex 32
```

Create the local D1 database and run migrations:

```bash
npx wrangler d1 migrations apply ielts-60day-db --local
```

Run the app locally (serves the production build + Functions + local D1):

```bash
npm run build
npx wrangler pages dev dist
```

> Do NOT add `--d1=DB` here: `wrangler.toml` already defines the D1
> binding, and the flag would create a separate empty local database
> instead of using the migrated one.

Then open http://localhost:8788, register an account, and use the app.
Tick-offs and block times are stored in the local D1 database
(`.wrangler/state/`).

For frontend-only development (no Functions/D1), `npm run dev` serves the
Vite dev server — note that login and saving need the Functions backend,
so use `wrangler pages dev` for full local testing.

## Build

```bash
npm run build        # typecheck + Vite bundle -> dist/
```

## Deploy to Cloudflare Pages (production)

1. **Create the D1 database** (once):

   ```bash
   npx wrangler d1 create ielts-60day-db
   ```

   Copy the returned `database_id` into `wrangler.toml`
   (`[[d1_databases]]`), replacing the placeholder.

2. **Run migrations on the remote database:**

   ```bash
   npx wrangler d1 migrations apply ielts-60day-db
   ```

3. **Set the session secret** (once; never put it in the repo):

   ```bash
   npx wrangler pages secret put SESSION_SECRET
   # paste a random value, e.g. from: openssl rand -hex 32
   ```

4. **Build and deploy:**

   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name ielts-60-day-app
   ```

5. **Bind D1 in the Pages dashboard** (once, if the deploy doesn't pick it
   up from `wrangler.toml`): Cloudflare dashboard → Workers & Pages →
   your project → Settings → Functions → D1 database bindings → Add
   binding: variable name `DB`, database `ielts-60day-db` → Save, then
   redeploy (or trigger a new deployment) so the binding takes effect.

6. Open the deployed URL, register, and verify: tick a task, set a block
   time, reload — both must persist.

To disable open registration on a private deployment, set the
`ALLOW_REGISTRATION` variable to `false` in the Pages dashboard
(Settings → Environment variables) or in `wrangler.toml` `[vars]`.
Existing users can still log in.

## Backup & restore (D1)

```bash
# Backup the production database to a SQL file:
npx wrangler d1 export ielts-60day-db --output=backup.sql

# Restore into the database (overwrites matching rows):
npx wrangler d1 execute ielts-60day-db --file=backup.sql

# Local database equivalents (add --local):
npx wrangler d1 export ielts-60day-db --local --output=backup-local.sql
npx wrangler d1 execute ielts-60day-db --local --file=backup-local.sql
```

Backups contain user emails and password hashes — store them privately,
never in the repo.

## API reference

All endpoints are same-origin, cookie-authenticated, and scoped to the
logged-in user (`WHERE user_id = ?` on every progress query).

| Method & path | Purpose |
|---|---|
| `POST /api/auth/register` | `{email, password}` → creates account + session (403 if registration disabled) |
| `POST /api/auth/login` | `{email, password}` → session cookie |
| `POST /api/auth/logout` | Deletes the session, clears the cookie |
| `GET /api/auth/me` | `{email}` or 401 |
| `GET /api/progress` | `{progress: {"day:taskIndex": true}}` |
| `POST /api/progress` | `{day, task_index, done}` — ticks/unticks one task |
| `GET /api/block-times` | `{blockTimes: {Listening: "07:30", ...}}` |
| `POST /api/block-times` | `{module, start_time}` — sets one block's start time |

## Content sources

- 60-day plan, mocks, cue cards, techniques: the project's plan data
  (Day 1 = 23 Nov 2026, Moktadir day-focus calendar + Dhaka 6-hour blocks).
- 101 resource links: curated list incl. Munzeerin Shahid PDFs
  (DynamicBangla GitHub), Moktadir / IELTS Prep Hub, Dhaka English Lab,
  official IELTS sources. Unverified items are shown name-only with no
  link; paid items are marked PAID with prices.
- Practice links: exact site + link per skill (Spelling =
  ieltsspelling.com).
- Cue cards: 148 Makkar Speaking cards (Sep–Dec 2026), cross-checked
  against the live notes page.
- Format facts: 4 modules, ~2h 45m; Band 7 ≈ 30/40 in Listening/Reading;
  computer-based with Writing on paper (IDP Bangladesh option).

## Notes

- Numerals are English (0–9) everywhere by design; Bengali text uses
  Noto Sans Bengali (primary) with Hind Siliguri as fallback.
- The app never silently pretends to save: if the API is unreachable,
  ticking is disabled and a clear error is shown.
- Design principles follow the UI UX Pro Max skill (used as inspiration
  only — no code or assets copied from it).
