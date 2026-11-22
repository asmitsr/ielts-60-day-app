import {
  FunctionContext,
  clearSessionCookie,
  getSessionUser,
  hashPassword,
  isHttps,
  json,
  readJson,
} from '../../_lib/auth';

// DELETE /api/auth/account — permanently deletes the account after the user
// confirms with their password. Child rows are deleted explicitly first
// (so the wipe does not depend on foreign-key enforcement), then the user
// row itself. Nothing can be recovered afterwards.
export async function onRequestDelete({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  const body = await readJson(request);
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!password) return json({ error: 'Enter your password to delete your account.' }, 400);
  const row = await env.DB.prepare('SELECT password_hash, salt FROM users WHERE id = ?')
    .bind(user.id)
    .first<{ password_hash: string; salt: string }>();
  if (!row || (await hashPassword(password, row.salt)) !== row.password_hash) {
    return json({ error: 'Password is incorrect.' }, 401);
  }
  await env.DB.prepare('DELETE FROM task_progress WHERE user_id = ?').bind(user.id).run();
  await env.DB.prepare('DELETE FROM block_times WHERE user_id = ?').bind(user.id).run();
  await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id).run();
  await env.DB.prepare('DELETE FROM password_resets WHERE user_id = ?').bind(user.id).run();
  await env.DB.prepare('DELETE FROM user_settings WHERE user_id = ?').bind(user.id).run();
  await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id).run();
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie(isHttps(request)) });
}
