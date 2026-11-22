import { FunctionContext, getSessionUser, json, readJson } from '../../_lib/auth';

// PATCH /api/auth/profile — update the signed-in user's own full name.
// The name is mandatory: an empty name is rejected, never stored as NULL.
export async function onRequestPatch({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  const body = await readJson(request);
  if (typeof body?.full_name !== 'string') {
    return json({ error: 'full_name must be a string.' }, 400);
  }
  const fullName = body.full_name.trim().slice(0, 100);
  if (fullName.length < 2) {
    return json({ error: 'Enter your full name.' }, 400);
  }
  await env.DB.prepare('UPDATE users SET full_name = ? WHERE id = ?')
    .bind(fullName, user.id)
    .run();
  return json({ full_name: fullName });
}
