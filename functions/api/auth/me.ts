import { FunctionContext, getSessionUser, json } from '../../_lib/auth';

export async function onRequestGet({ request, env }: FunctionContext) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);
  return json({ email: user.email });
}
