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

  // Fail closed: without Gmail credentials no email can be sent, so say
  // so plainly instead of pretending a reset link is on its way.
  const { GMAIL_CLIENT_ID: clientId, GMAIL_CLIENT_SECRET: clientSecret, GMAIL_REFRESH_TOKEN: refreshToken, GMAIL_SENDER: sender } = env;
  if (!clientId || !clientSecret || !refreshToken || !sender) {
    return json(
      { error: 'ইমেইল দিয়ে রিসেট এখনো চালু হয়নি। পাসওয়ার্ড রিসেট করতে asmitsr.official@gmail.com-এ মেইল করো।' },
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
  let sent = false;
  try {
    sent = await sendResetEmail(clientId, clientSecret, refreshToken, sender, email, resetUrl);
  } catch (err) {
    console.error('Gmail send failed', err);
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

// Sends the reset email via the Gmail API: refresh token -> access token,
// then messages.send with a base64url-encoded RFC 822 message. Stateless —
// the token is exchanged on every request, nothing is cached.
// NOTE: the gmail.send scope does NOT cover users.getProfile, so the sender
// address comes from the GMAIL_SENDER env var instead of a profile lookup.
async function sendResetEmail(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
  sender: string,
  to: string,
  resetUrl: string,
): Promise<boolean> {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });
  if (!tokenRes.ok) {
    console.error('Gmail token exchange failed', tokenRes.status);
    return false;
  }
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) return false;
  const auth = { Authorization: `Bearer ${access_token}` };
  const raw = [
    `To: ${to}`,
    `From: IELTS 60-Day App <${sender}>`,
    'Subject: Reset your IELTS 60-Day App password',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    `You asked to reset your IELTS 60-Day App password. Open this link (works once, expires in 1 hour): ${resetUrl}`,
    '',
    'If you did not ask for this, ignore this email. Your password stays unchanged.',
  ].join('\r\n');
  const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { ...auth, 'content-type': 'application/json' },
    body: JSON.stringify({ raw: b64url(new TextEncoder().encode(raw)) }),
  });
  if (!sendRes.ok) console.error('Gmail send failed', sendRes.status, await sendRes.text().catch(() => ''));
  return sendRes.ok;
}
