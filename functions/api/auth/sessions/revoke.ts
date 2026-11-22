import { FunctionContext, getSessionUser, json, readJson, sessionIdFrom } from '../../../_lib/auth';

// POST /api/auth/sessions/revoke
// Body: { session_id } to revoke one session, or { all_except_current: true }
// to sign out every other device. The current session can only be ended
// with logout (revoking it here would strand the request's own cookie).
export async function onRequestPost({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  const body = await readJson(request);
  const current = sessionIdFrom(request);
  if (body?.all_except_current === true) {
    const res = await env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND id != ?')
      .bind(user.id, current ?? '')
      .run();
    return json({ ok: true, revoked: res.meta?.changes ?? 0 });
  }
  const sessionId = typeof body?.session_id === 'string' ? body.session_id : '';
  if (!sessionId) return json({ error: 'session_id is required.' }, 400);
  if (sessionId === current) {
    return json({ error: 'Use logout to end the current session.' }, 400);
  }
  await env.DB.prepare('DELETE FROM sessions WHERE id = ? AND user_id = ?')
    .bind(sessionId, user.id)
    .run();
  return json({ ok: true });
}
