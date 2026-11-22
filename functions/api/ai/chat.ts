import { FunctionContext, getSessionUser, json, readJson } from '../../_lib/auth';
import { AI_SYSTEM_PROMPT, buildAiContext, decryptApiKey, type AiConfigRow } from '../../_lib/ai';

// POST /api/ai/chat — grounded Q&A over the app's own data only.
// Body { question: string, 1–1000 chars }. The question is answered by the
// user's own provider (OpenAI-compatible /chat/completions) with a context
// built from this app's data files — the model gets no outside knowledge
// in the prompt and is told to say so when the answer is not in the context.
// Provider errors surface honestly as 502; an answer is never fabricated.

const SECRET_MISSING = 'AI is not set up on the server yet (AI_KEY_SECRET is missing).';

interface ChatCompletion {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

export async function onRequestPost({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  const body = await readJson(request);
  const question = body?.question;
  if (typeof question !== 'string' || question.trim().length === 0 || question.length > 1000) {
    return json({ error: 'question must be 1–1000 characters.' }, 400);
  }
  const row = await env.DB.prepare(
    'SELECT provider, base_url, model, key_enc, iv FROM ai_settings WHERE user_id = ?',
  )
    .bind(user.id)
    .first<AiConfigRow>();
  if (!row) {
    return json({ error: 'AI সেটআপ করা হয়নি — Settings → AI থেকে তোমার API key সেভ করো।' }, 400);
  }
  if (!env.AI_KEY_SECRET) return json({ error: SECRET_MISSING }, 503);
  let key: string;
  try {
    key = await decryptApiKey(env.AI_KEY_SECRET, row.key_enc, row.iv);
  } catch {
    return json({ error: 'Saved key পড়া যাচ্ছে না — Settings → AI থেকে আবার সেভ করো।' }, 500);
  }
  const context = buildAiContext(question.trim());
  const base = row.base_url.replace(/\/+$/, '');
  let res: Response;
  try {
    res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: row.model,
        messages: [
          { role: 'system', content: AI_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `App context:\n${context}\n\nপ্রশ্ন: ${question.trim()}`,
          },
        ],
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(60000),
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'TimeoutError';
    return json(
      {
        error: timedOut
          ? 'Provider 60 সেকেন্ডে উত্তর দেয়নি — আবার চেষ্টা করো।'
          : 'Provider-এর সাথে যোগাযোগ করা যাচ্ছে না — base URL ঠিক আছে কিনা দেখো।',
      },
      502,
    );
  }
  const data = (await res.json().catch(() => ({}))) as ChatCompletion;
  if (!res.ok) {
    const detail =
      typeof data.error?.message === 'string' ? data.error.message.slice(0, 200) : '';
    return json(
      { error: `Provider HTTP ${res.status} দিয়েছে।${detail ? ` ${detail}` : ''}` },
      502,
    );
  }
  const answer = data.choices?.[0]?.message?.content?.trim();
  if (!answer) {
    return json({ error: 'Provider খালি উত্তর দিয়েছে — আবার চেষ্টা করো।' }, 502);
  }
  return json({ answer });
}
