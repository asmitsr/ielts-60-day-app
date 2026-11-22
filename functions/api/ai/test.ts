import { FunctionContext, getSessionUser, json } from '../../_lib/auth';
import { decryptApiKey, type AiConfigRow } from '../../_lib/ai';

// POST /api/ai/test — checks the SAVED provider config by calling
// GET {base_url}/models with the decrypted key (10s timeout). 200 means the
// key works; anything else is an honest failure — never a fake success.
// The key is decrypted in memory only, for this one call.

const SECRET_MISSING = 'AI is not set up on the server yet (AI_KEY_SECRET is missing).';

export async function onRequestPost({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  const row = await env.DB.prepare(
    'SELECT provider, base_url, model, key_enc, iv FROM ai_settings WHERE user_id = ?',
  )
    .bind(user.id)
    .first<AiConfigRow>();
  if (!row) {
    return json({ ok: false, error: 'AI সেটআপ করা হয়নি — Settings → AI থেকে প্রথমে সেভ করো।' }, 400);
  }
  if (!env.AI_KEY_SECRET) return json({ ok: false, error: SECRET_MISSING }, 503);
  let key: string;
  try {
    key = await decryptApiKey(env.AI_KEY_SECRET, row.key_enc, row.iv);
  } catch {
    return json(
      { ok: false, error: 'Saved key পড়া যাচ্ছে না — Settings → AI থেকে আবার সেভ করো।' },
      500,
    );
  }
  const base = row.base_url.replace(/\/+$/, '');
  let res: Response;
  try {
    res = await fetch(`${base}/models`, {
      headers: { authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'TimeoutError';
    return json(
      {
        ok: false,
        error: timedOut
          ? 'Provider 10 সেকেন্ডে সাড়া দেয়নি — base URL ঠিক আছে কিনা দেখো।'
          : 'Provider-এর সাথে যোগাযোগ করা যাচ্ছে না — base URL ঠিক আছে কিনা দেখো।',
      },
      502,
    );
  }
  if (!res.ok) {
    return json(
      {
        ok: false,
        error: `Key কাজ করছে না — provider HTTP ${res.status} দিয়েছে। Key বা base URL ঠিক আছে কিনা দেখো।`,
      },
      502,
    );
  }
  return json({ ok: true });
}
