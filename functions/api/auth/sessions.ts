import { FunctionContext, getSessionUser, json, sessionIdFrom } from '../../_lib/auth';

// GET /api/auth/sessions — the user's own sessions, newest first.
// user_agent is NULL for sessions created before migration 0002;
// the UI shows those as "Unknown device".
export async function onRequestGet({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  const { results } = await env.DB.prepare(
    'SELECT id, created_at, expires_at, user_agent FROM sessions WHERE user_id = ? ORDER BY created_at DESC',
  )
    .bind(user.id)
    .all<{ id: string; created_at: string; expires_at: number; user_agent: string | null }>();
  const current = sessionIdFrom(request);
  return json({
    sessions: results.map((s) => ({ ...s, current: s.id === current })),
  });
}
