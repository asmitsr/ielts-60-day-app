import { FunctionContext, getSessionUser, json, readJson } from '../_lib/auth';

const MODULES = ['Listening', 'Reading', 'Writing', 'Speaking'];
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export async function onRequestGet({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  const { results } = await env.DB.prepare(
    'SELECT module, start_time FROM block_times WHERE user_id = ?',
  )
    .bind(user.id)
    .all<{ module: string; start_time: string }>();
  const blockTimes: Record<string, string> = {};
  for (const r of results) blockTimes[r.module] = r.start_time;
  return json({ blockTimes });
}

export async function onRequestPost({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  const body = await readJson(request);
  const module = body?.module;
  const startTime = body?.start_time;
  if (typeof module !== 'string' || !MODULES.includes(module)) {
    return json({ error: 'module must be Listening, Reading, Writing or Speaking.' }, 400);
  }
  if (typeof startTime !== 'string' || !TIME_RE.test(startTime)) {
    return json({ error: 'start_time must be HH:MM (24-hour).' }, 400);
  }
  await env.DB.prepare('INSERT OR REPLACE INTO block_times (user_id, module, start_time) VALUES (?, ?, ?)')
    .bind(user.id, module, startTime)
    .run();
  return json({ ok: true });
}
