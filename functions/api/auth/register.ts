import {
  FunctionContext,
  createSession,
  hashPassword,
  hex,
  isHttps,
  isoNow,
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
  const fullName = typeof body?.full_name === 'string' ? body.full_name.trim().slice(0, 100) : '';
  if (!validEmail(email)) return json({ error: 'Enter a valid email address.' }, 400);
  if (password.length < 8 || password.length > 128) {
    return json({ error: 'Password must be 8–128 characters.' }, 400);
  }
  // Full name is mandatory: no account without one.
  if (fullName.length < 2) {
    return json({ error: 'Enter your full name.' }, 400);
  }
  if (!env.SESSION_SECRET) {
    return json({ error: 'Server is not configured (SESSION_SECRET missing).' }, 500);
  }
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return json({ error: 'An account with this email already exists.' }, 409);
  const salt = hex(randomBytes(16));
  const passwordHash = await hashPassword(password, salt);
  // Consent timestamps are recorded server-side when the client sends them
  // (the registration form requires both checkboxes). NULL = not recorded.
  const now = isoNow();
  const termsAt = body?.terms_accepted === true ? now : null;
  const privacyAt = body?.privacy_accepted === true ? now : null;
  const res = await env.DB.prepare(
    'INSERT INTO users (email, password_hash, salt, full_name, terms_accepted_at, privacy_accepted_at) VALUES (?, ?, ?, ?, ?, ?)',
  )
    .bind(email, passwordHash, salt, fullName, termsAt, privacyAt)
    .run();
  const userId = res.meta?.last_row_id;
  if (!userId) return json({ error: 'Could not create the account. Try again.' }, 500);
  const cookie = await createSession(env, userId, isHttps(request), {
    userAgent: request.headers.get('user-agent'),
  });
  return json({ email }, 201, { 'set-cookie': cookie });
}
