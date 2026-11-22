import {
  FunctionContext,
  createSession,
  hashPassword,
  hex,
  isHttps,
  json,
  randomBytes,
  readJson,
  validEmail,
} from '../../_lib/auth';

export async function onRequestPost({ request, env }: FunctionContext) {
  if ((env.ALLOW_REGISTRATION ?? 'true').toLowerCase() === 'false') {
    return json({ error: 'Registration is disabled on this deployment.' }, 403);
  }
  const body = await readJson(request);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!validEmail(email)) return json({ error: 'Enter a valid email address.' }, 400);
  if (password.length < 8 || password.length > 128) {
    return json({ error: 'Password must be 8–128 characters.' }, 400);
  }
  if (!env.SESSION_SECRET) {
    return json({ error: 'Server is not configured (SESSION_SECRET missing).' }, 500);
  }
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return json({ error: 'An account with this email already exists.' }, 409);
  const salt = hex(randomBytes(16));
  const passwordHash = await hashPassword(password, salt);
  const res = await env.DB.prepare('INSERT INTO users (email, password_hash, salt) VALUES (?, ?, ?)')
    .bind(email, passwordHash, salt)
    .run();
  const userId = res.meta?.last_row_id;
  if (!userId) return json({ error: 'Could not create the account. Try again.' }, 500);
  const cookie = await createSession(env, userId, isHttps(request));
  return json({ email }, 201, { 'set-cookie': cookie });
}
