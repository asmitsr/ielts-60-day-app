import {
  FunctionContext,
  getSessionUser,
  hashPassword,
  hex,
  json,
  randomBytes,
  readJson,
  sessionIdFrom,
} from '../../_lib/auth';

// POST /api/auth/change-password
// Verifies the current password, sets the new one, and revokes every
// OTHER session (the device making the change stays signed in).
export async function onRequestPost({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  const body = await readJson(request);
  const current = typeof body?.current_password === 'string' ? body.current_password : '';
  const next = typeof body?.new_password === 'string' ? body.new_password : '';
  if (next.length < 8 || next.length > 128) {
    return json({ error: 'Password must be 8–128 characters.' }, 400);
  }
  if (!current) return json({ error: 'Enter your current password.' }, 400);
  const row = await env.DB.prepare('SELECT password_hash, salt FROM users WHERE id = ?')
    .bind(user.id)
    .first<{ password_hash: string; salt: string }>();
  if (!row || (await hashPassword(current, row.salt)) !== row.password_hash) {
    return json({ error: 'Current password is incorrect.' }, 401);
  }
  const salt = hex(randomBytes(16));
  const passwordHash = await hashPassword(next, salt);
  await env.DB.prepare('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?')
    .bind(passwordHash, salt, user.id)
    .run();
  const currentSession = sessionIdFrom(request);
  if (currentSession) {
    await env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND id != ?')
      .bind(user.id, currentSession)
      .run();
  }
  return json({ ok: true });
}
