import { FunctionContext, clearSessionCookie, isHttps, json, sessionIdFrom } from '../../_lib/auth';

export async function onRequestPost({ request, env }: FunctionContext) {
  const id = sessionIdFrom(request);
  if (id) {
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(id).run();
  }
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie(isHttps(request)) });
}
