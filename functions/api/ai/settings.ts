import { FunctionContext, getSessionUser, json, readJson } from '../../_lib/auth';
import { encryptApiKey, type AiConfigRow } from '../../_lib/ai';

// GET/PUT/DELETE /api/ai/settings — the user's own AI provider settings
// (provider, base URL, model, API key). The key is stored AES-GCM-encrypted
// and is NEVER returned by any endpoint — GET only reports has_key.
// Fail-closed: without AI_KEY_SECRET, saving is impossible (503).

const PROVIDERS = ['freemodel', 'gemini', 'custom'];
const SECRET_MISSING = 'AI is not set up on the server yet (AI_KEY_SECRET is missing).';

function publicView(row: AiConfigRow) {
  return {
    configured: true,
    provider: row.provider,
    base_url: row.base_url,
    model: row.model,
    has_key: true,
  };
}

export async function onRequestGet({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  const row = await env.DB.prepare(
    'SELECT provider, base_url, model, key_enc, iv FROM ai_settings WHERE user_id = ?',
  )
    .bind(user.id)
    .first<AiConfigRow>();
  return json(row ? publicView(row) : { configured: false });
}

export async function onRequestPut({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  const body = await readJson(request);
  if (!body) return json({ error: 'Send provider, base_url, model and key.' }, 400);
  const { provider, base_url, model, key } = body;
  if (typeof provider !== 'string' || !PROVIDERS.includes(provider)) {
    return json({ error: 'provider must be freemodel, gemini, or custom.' }, 400);
  }
  if (
    typeof base_url !== 'string' ||
    base_url.length === 0 ||
    base_url.length > 500 ||
    !base_url.startsWith('https://')
  ) {
    return json({ error: 'base_url must be an https:// URL.' }, 400);
  }
  if (typeof model !== 'string' || model.trim().length === 0 || model.length > 200) {
    return json({ error: 'model must not be empty.' }, 400);
  }
  if (typeof key !== 'string' || key.length < 8 || key.length > 500) {
    return json({ error: 'key must be 8–500 characters.' }, 400);
  }
  if (!env.AI_KEY_SECRET) return json({ error: SECRET_MISSING }, 503);
  const { keyEnc, iv } = await encryptApiKey(env.AI_KEY_SECRET, key);
  await env.DB.prepare(
    `INSERT INTO ai_settings (user_id, provider, base_url, model, key_enc, iv, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
     ON CONFLICT(user_id) DO UPDATE SET provider = excluded.provider, base_url = excluded.base_url,
       model = excluded.model, key_enc = excluded.key_enc, iv = excluded.iv,
       updated_at = excluded.updated_at`,
  )
    .bind(user.id, provider, base_url, model.trim(), keyEnc, iv)
    .run();
  return json({ configured: true, provider, base_url, model: model.trim(), has_key: true });
}

export async function onRequestDelete({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  await env.DB.prepare('DELETE FROM ai_settings WHERE user_id = ?').bind(user.id).run();
  return json({ ok: true });
}
