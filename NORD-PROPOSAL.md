# IELTS 60-Day App — Nord Color System Proposal

Prepared 22 Nov 2026. **Nothing has been implemented yet** — this proposal
needs the user's approval first.

## What was studied

- **Nord** (github.com/nordtheme/nord, MIT): the official palette and its
  usage documentation in `src/nord.scss`. Nord is "an arctic, north-bluish
  color palette… for the clean- and minimal flat design pattern to achieve
  optimal focus and readability." Sixteen colors in four families.
- **iTerm2-Color-Schemes** (github.com/mbadolato/iTerm2-Color-Schemes):
  the **Nord** scheme (bg #2E3440, fg #D8DEE9) and the **Nord Light**
  scheme (bg #E5E9F0, fg #414858, frost #88C0D0 cursor). No other terminal
  palette was imported — the study confirmed Nord's own light expression
  and that Nord's ANSI mapping keeps every family in its documented role.
- **Current app system** (`src/theme.css`): Midnight Navy + Champagne Gold
  + Deep Teal + Warm Ivory. Token names and roles are preserved; only the
  color values change.

## Design decisions

1. **Nord-pure where possible.** Every structural color is an official Nord
   color used in its documented role: Polar Night for dark surfaces and
   light text, Snow Storm for light surfaces and dark text, Frost for
   interaction, Aurora for status only.
2. **Frost is the accent, as Nord intends.** nord8 #88C0D0 is documented as
   "the accent color of the color palette… main color for primary UI
   elements." Dark mode uses pure nord8. On light backgrounds pure frost
   is too pale for text (nord10 #5E81AC is 4.03:1 on white — fails AA), so
   the light accent is nord10 deepened ~12% (#4E6E96, 5.26:1). Same hue,
   no new color introduced.
3. **Progress is frost, not gold.** The hero ring and day progress bars use
   the accent (nord8 dark / deepened nord10 light). Gold leaves the app;
   the "today" highlight keeps a warm accent via Aurora yellow (nord13),
   used sparingly as Nord intends for highlights/warnings.
4. **The hero stays deep Polar Night in both modes.** A dark hero card on
   the light Snow Storm background is the app's strongest visual anchor
   (and matches the current design, where the hero is already navy in both
   modes). The frost ring reads identically in both themes.
5. **Module colors are one Nord color each, as soft tints.** Listening =
   nord9 blue, Reading = nord7 teal-frost, Writing = nord13 yellow,
   Speaking = nord15 purple. Chips use a 14–18% tint of the module color
   with dark/light neutral text — the color coding reads clearly while all
   text stays high-contrast. No invented hues.
6. **Aurora only for meaning.** Red = error/danger, yellow = warning/today,
   green = success, orange/purple reserved for future special states.
   Aurora never decorates.
7. **Light mode is Nord Light's own background** (#E5E9F0) with white cards
   — clean, bright, calm. White is a neutral, not a competing palette.
8. **Derived shades are documented, not hidden.** Five colors are Nord
   colors darkened or lightened purely to pass WCAG AA 4.5:1 for text
   (marked * below). No new hues.

## Verification

30 text/background pairs checked programmatically against WCAG 2.1 AA
(script: `~/workspace/nord-research/contrast-check.py`). **All pass** —
worst pair is the dark accent link at 5.03:1; body text is 8–12:1 in both
modes. Full output is in the script's comments; re-run it any time.

## Light mode tokens

| Token | Value | Source / role |
|---|---|---|
| `--bg` | #E5E9F0 | nord5 — Nord Light's own background |
| `--surface` | #FFFFFF | neutral white cards |
| `--surface-muted` | #ECEFF4 | nord6 |
| `--text` | #2E3440 | nord0 — Nord's light-theme text |
| `--muted` | #4C566A | nord3 |
| `--border` | #D8DEE9 | nord4 |
| `--track` | #D8DEE9 | nord4 (empty progress tracks) |
| `--accent` | #4E6E96 | * nord10 deepened ~12% (pure nord10 is 4.03:1 — fails AA) |
| `--accent-strong` | #3F5A7A | * nord10 deepened ~25% (hover) |
| `--accent-soft` | #F1F7F9 | nord8 12% over white (selected chips, step numbers) |
| `--on-accent` | #FFFFFF | white text on accent buttons |
| `--progress` | #4E6E96 | hero ring + day bars (same as accent) |
| `--today-border` | #EBCB8B | nord13 (today's day border) |
| `--today-bg` | #FBF6EA | nord13 18% over white (special-day note) |
| `--danger` | #A64B54 | * nord11 darkened (danger text) |
| `--danger-bg` | #F9EFF0 | nord11 10% over white (mock panel, alerts) |
| `--danger-border` | #E9C8CB | nord11 35% over white |
| `--success` | #527A43 | * nord14 darkened (success text) |
| `--warning` | #8A6D1B | * nord13 darkened (warning text) |
| `--hero-from` / `--hero-to` | #2E3440 / #3B4252 | nord0 → nord1 (hero stays dark) |
| `--focus` | #4E6E96 | focus rings |
| Module chips | tint bg + nord0 text | Listening #EDF2F6, Reading #EFF6F5, Writing #FCF8EF, Speaking #F4EFF4 (each module color 14% over white) |
| Shadows | rgba(46,52,64,0.06/0.08) | Nord-tinted |

## Dark mode tokens

| Token | Value | Source / role |
|---|---|---|
| `--bg` | #2E3440 | nord0 — deep Polar Night, not pure black |
| `--surface` | #3B4252 | nord1 |
| `--surface-muted` | #434C5E | nord2 |
| `--text` | #ECEFF4 | nord6 |
| `--muted` | #D8DEE9 | nord4 (nord3 is too dim for body text on dark) |
| `--border` | #434C5E | nord2 |
| `--track` | #434C5E | nord2 (empty progress tracks) |
| `--accent` | #88C0D0 | nord8 — Nord's official accent |
| `--accent-strong` | #81A1C1 | nord9 (hover) |
| `--accent-soft` | #475565 | nord8 15% over nord1 (selected chips) |
| `--on-accent` | #2E3440 | nord0 text on accent buttons |
| `--progress` | #88C0D0 | nord8 — hero ring + day bars |
| `--today-border` | #EBCB8B | nord13 (today's day border) |
| `--today-bg` | #706B63 | nord13 30% over nord1 (special-day note) |
| `--danger` | #D9A0A6 | * nord11 lightened (danger text; pure nord11 is 3.05:1 on dark) |
| `--danger-bg` | #3C3944 | nord11 10% over nord0 (mock panel, alerts) |
| `--danger-border` | #6F4853 | nord11 45% over nord0 |
| `--success` | #A3BE8C | nord14 |
| `--warning` | #EBCB8B | nord13 |
| `--hero-from` / `--hero-to` | #2E3440 / #3B4252 | nord0 → nord1 |
| `--focus` | #88C0D0 | focus rings |
| Module chips | tint bg + nord6 text | Listening #485366, Reading #4A5865, Writing #5B5B5C, Speaking #505062 (each module color 18% over nord1) |
| Shadows | rgba(0,0,0,0.4/0.45) | unchanged |

## What changes vs today

- Ivory background → Snow Storm; navy surfaces → Polar Night layers;
  teal accent → Frost; gold progress → Frost progress (gold leaves the
  app); brick Speaking chip → Nord purple; slate/gold module chips →
  Nord Frost/Aurora tints.
- Token renames in code: `--gold` → `--progress`, `--gold-soft` →
  `--today-bg` (same roles, honest names). The hero ring stroke in
  `ProgressHero.tsx` becomes frost (#88C0D0 — same in both modes, since
  the hero is dark in both).
- `color-scheme`, fonts, layout, spacing, radius, content, functionality,
  navigation, theme toggle + persistence: all unchanged.

## What does NOT change

Layout, content (60 days / 233 tasks / 8 mocks / 101 resources / 148 cue
cards / 38 steps / 12 techniques), functionality, backend, user data,
Noto Sans Bengali typography, English numerals, theme toggle behavior.
