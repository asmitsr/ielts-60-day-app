import {
  FunctionContext,
  RESET_TOKEN_TTL_S,
  b64url,
  json,
  randomBytes,
  readJson,
  sha256Hex,
  validEmail,
} from '../../_lib/auth';

// POST /api/auth/forgot-password
// Always returns {ok:true} when the request is well-formed — whether or not
// an account exists for the email — so nobody can probe for accounts.
// The ONLY error case is a server-side one (email service not configured
// or the send failed), which is identical for every email.
export async function onRequestPost({ request, env }: FunctionContext) {
  const body = await readJson(request);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!validEmail(email)) return json({ ok: true });

  // Fail closed: without a Resend key no email can be sent, so say so
  // plainly instead of pretending a reset link is on its way.
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return json(
      { error: 'Password reset is not set up yet — the email service is not configured. Try again later.' },
      503,
    );
  }
  const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: number }>();
  if (!user) return json({ ok: true });

  const now = Math.floor(Date.now() / 1000);
  // A new request invalidates any earlier unused token for this user.
  await env.DB.prepare('UPDATE password_resets SET used_at = ? WHERE user_id = ? AND used_at IS NULL')
    .bind(now, user.id)
    .run();
  const token = b64url(randomBytes(32));
  const tokenHash = await sha256Hex(token);
  const expiresAt = now + RESET_TOKEN_TTL_S;
  const res = await env.DB.prepare('INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)')
    .bind(user.id, tokenHash, expiresAt)
    .run();
  const resetId = res.meta?.last_row_id;
  const resetUrl = `${new URL(request.url).origin}/reset-password?token=${encodeURIComponent(token)}`;
  const from = env.RESEND_FROM ?? 'IELTS 60-Day App <onboarding@resend.dev>';
  let sent = false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: email,
        subject: 'Reset your IELTS 60-Day App password',
        html: `<p>You asked to reset your IELTS 60-Day App password. Click the link below — it works once and expires in 1 hour.</p><p><a href="${resetUrl}">Reset my password</a></p><p>If you did not ask for this, ignore this email. Your password stays unchanged.</p>`,
        text: `You asked to reset your IELTS 60-Day App password. Open this link (works once, expires in 1 hour): ${resetUrl}\n\nIf you did not ask for this, ignore this email. Your password stays unchanged.`,
      }),
    });
    sent = r.ok;
    if (!r.ok) console.error('Resend error', r.status, await r.text().catch(() => ''));
  } catch (err) {
    console.error('Resend request failed', err);
  }
  if (!sent) {
    // The email never left: remove the token so a stale row cannot linger.
    if (resetId) {
      await env.DB.prepare('DELETE FROM password_resets WHERE id = ?').bind(resetId).run();
    }
    return json({ error: 'Could not send the reset email. Try again later.' }, 503);
  }
  return json({ ok: true });
}
