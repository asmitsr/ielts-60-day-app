import { FunctionContext, getSessionUser, json, readJson } from '../_lib/auth';

// GET/PUT /api/settings — the user's own settings JSON (appearance,
// notifications, study preferences), synced across devices like progress.
// Only known top-level keys are accepted; unknown keys are rejected so a
// bad client cannot stuff arbitrary data into the row.
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

type Settings = Record<string, unknown>;

function parseStored(raw: string | null): Settings {
  if (!raw) return {};
  try {
    const v: unknown = JSON.parse(raw);
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Settings) : {};
  } catch {
    return {};
  }
}

function validPatch(body: Settings): string | null {
  for (const key of Object.keys(body)) {
    if (!['appearance', 'notifications', 'study'].includes(key)) return `Unknown setting: ${key}.`;
  }
  if (body.appearance !== undefined && !['light', 'dark', 'system'].includes(body.appearance as string)) {
    return 'appearance must be light, dark, or system.';
  }
  const notif = body.notifications;
  if (notif !== undefined) {
    if (!notif || typeof notif !== 'object' || Array.isArray(notif)) return 'notifications must be an object.';
    const n = notif as Settings;
    if (n.dailyReminder !== undefined && typeof n.dailyReminder !== 'boolean') {
      return 'notifications.dailyReminder must be a boolean.';
    }
    if (n.scheduleReminder !== undefined && typeof n.scheduleReminder !== 'boolean') {
      return 'notifications.scheduleReminder must be a boolean.';
    }
    if (n.reminderTime !== undefined && (typeof n.reminderTime !== 'string' || !TIME_RE.test(n.reminderTime))) {
      return 'notifications.reminderTime must be HH:MM (24-hour).';
    }
  }
  const study = body.study;
  if (study !== undefined) {
    if (!study || typeof study !== 'object' || Array.isArray(study)) return 'study must be an object.';
    if ((study as Settings).autoExpandToday !== undefined && typeof (study as Settings).autoExpandToday !== 'boolean') {
      return 'study.autoExpandToday must be a boolean.';
    }
  }
  return null;
}

function merge(base: Settings, patch: Settings): Settings {
  const out: Settings = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    const old = base[k];
    out[k] =
      v && typeof v === 'object' && !Array.isArray(v) && old && typeof old === 'object' && !Array.isArray(old)
        ? { ...(old as Settings), ...(v as Settings) }
        : v;
  }
  return out;
}

export async function onRequestGet({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  const row = await env.DB.prepare('SELECT settings_json FROM user_settings WHERE user_id = ?')
    .bind(user.id)
    .first<{ settings_json: string }>();
  return json({ settings: parseStored(row?.settings_json ?? null) });
}

export async function onRequestPut({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  const body = await readJson(request);
  if (!body) return json({ error: 'Send a settings object.' }, 400);
  if (JSON.stringify(body).length > 10000) return json({ error: 'Settings are too large.' }, 400);
  const err = validPatch(body);
  if (err) return json({ error: err }, 400);
  const row = await env.DB.prepare('SELECT settings_json FROM user_settings WHERE user_id = ?')
    .bind(user.id)
    .first<{ settings_json: string }>();
  const merged = merge(parseStored(row?.settings_json ?? null), body);
  await env.DB.prepare(
    `INSERT INTO user_settings (user_id, settings_json, updated_at) VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
     ON CONFLICT(user_id) DO UPDATE SET settings_json = excluded.settings_json, updated_at = excluded.updated_at`,
  )
    .bind(user.id, JSON.stringify(merged))
    .run();
  return json({ settings: merged });
}
