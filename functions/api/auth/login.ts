import {
  FunctionContext,
  createSession,
  hashPassword,
  isHttps,
  json,
  readJson,
} from '../../_lib/auth';

const INVALID = 'Invalid email or password.';

export async function onRequestPost({ request, env }: FunctionContext) {
  const body = await readJson(request);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!email || !password) return json({ error: INVALID }, 401);
  if (!env.SESSION_SECRET) {
    return json({ error: 'Server is not configured (SESSION_SECRET missing).' }, 500);
  }
  const user = await env.DB.prepare('SELECT id, email, password_hash, salt FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: number; email: string; password_hash: string; salt: string }>();
  if (!user) {
    // Hash anyway so a missing account costs the same time as a wrong password.
    await hashPassword(password, '00'.repeat(16));
    return json({ error: INVALID }, 401);
  }
  if ((await hashPassword(password, user.salt)) !== user.password_hash) {
    return json({ error: INVALID }, 401);
  }
  const cookie = await createSession(env, user.id, isHttps(request));
  return json({ email: user.email }, 200, { 'set-cookie': cookie });
}
