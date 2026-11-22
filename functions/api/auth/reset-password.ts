import {
  FunctionContext,
  hashPassword,
  hex,
  json,
  randomBytes,
  readJson,
  sha256Hex,
} from '../../_lib/auth';

// POST /api/auth/reset-password
// Validates the token hash, 1-hour expiry, and single-use; sets the new
// password and revokes ALL sessions (every device must log in again).
export async function onRequestPost({ request, env }: FunctionContext) {
  const body = await readJson(request);
  const token = typeof body?.token === 'string' ? body.token : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (password.length < 8 || password.length > 128) {
    return json({ error: 'Password must be 8–128 characters.' }, 400);
  }
  if (!token) return json({ error: 'This reset link is invalid or has expired.' }, 400);
  const tokenHash = await sha256Hex(token);
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(
    'SELECT id, user_id FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?',
  )
    .bind(tokenHash, now)
    .first<{ id: number; user_id: number }>();
  if (!row) return json({ error: 'This reset link is invalid or has expired.' }, 400);
  const salt = hex(randomBytes(16));
  const passwordHash = await hashPassword(password, salt);
  await env.DB.prepare('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?')
    .bind(passwordHash, salt, row.user_id)
    .run();
  await env.DB.prepare('UPDATE password_resets SET used_at = ? WHERE id = ?').bind(now, row.id).run();
  await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(row.user_id).run();
  return json({ ok: true });
}
