import { FunctionContext, getSessionUser, json, readJson } from '../_lib/auth';

// Tick-offs live in D1, scoped per user. The client never stores progress
// anywhere else: D1 is the source of truth.
export async function onRequestGet({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  const { results } = await env.DB.prepare(
    'SELECT day, task_index FROM task_progress WHERE user_id = ? AND done = 1',
  )
    .bind(user.id)
    .all<{ day: number; task_index: number }>();
  const progress: Record<string, true> = {};
  for (const r of results) progress[`${r.day}:${r.task_index}`] = true;
  return json({ progress });
}

export async function onRequestPost({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  const body = await readJson(request);
  const day = body?.day;
  const taskIndex = body?.task_index;
  const done = body?.done;
  if (!Number.isInteger(day) || (day as number) < 1 || (day as number) > 60) {
    return json({ error: 'day must be an integer 1–60.' }, 400);
  }
  if (!Number.isInteger(taskIndex) || (taskIndex as number) < 0 || (taskIndex as number) > 20) {
    return json({ error: 'task_index is invalid.' }, 400);
  }
  if (typeof done !== 'boolean') return json({ error: 'done must be true or false.' }, 400);
  if (done) {
    await env.DB.prepare(
      'INSERT OR REPLACE INTO task_progress (user_id, day, task_index, done) VALUES (?, ?, ?, 1)',
    )
      .bind(user.id, day, taskIndex)
      .run();
  } else {
    await env.DB.prepare('DELETE FROM task_progress WHERE user_id = ? AND day = ? AND task_index = ?')
      .bind(user.id, day, taskIndex)
      .run();
  }
  return json({ ok: true });
}
