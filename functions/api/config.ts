import { FunctionContext, json } from '../_lib/auth';

// Public, unauthenticated deployment config. Presentation only —
// whether registration is open is still enforced server-side by
// /api/auth/register, which uses the same check.
export async function onRequestGet({ env }: FunctionContext) {
  const open = (env.ALLOW_REGISTRATION ?? 'true').toLowerCase() !== 'false';
  return json({ registrationOpen: open });
}
