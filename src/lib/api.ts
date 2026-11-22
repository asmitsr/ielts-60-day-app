// Typed client for the Pages Functions API. All calls send the session
// cookie (same-origin). No secrets live here — auth is cookie-based and
// D1 access is server-side only.
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError(0, 'Server-এর সাথে যোগাযোগ করা যাচ্ছে না। ইন্টারনেট চেক করো।');
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new ApiError(res.status, data.error ?? `Request failed (${res.status}).`);
  return data as T;
}

export const api = {
  me: () => call<{ email: string }>('/api/auth/me'),
  register: (email: string, password: string) =>
    call<{ email: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    call<{ email: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => call<{ ok: boolean }>('/api/auth/logout', { method: 'POST', body: '{}' }),
  getProgress: () => call<{ progress: Record<string, true> }>('/api/progress'),
  setProgress: (day: number, taskIndex: number, done: boolean) =>
    call<{ ok: boolean }>('/api/progress', {
      method: 'POST',
      body: JSON.stringify({ day, task_index: taskIndex, done }),
    }),
  getBlockTimes: () => call<{ blockTimes: Record<string, string> }>('/api/block-times'),
  setBlockTime: (module: string, startTime: string) =>
    call<{ ok: boolean }>('/api/block-times', {
      method: 'POST',
      body: JSON.stringify({ module, start_time: startTime }),
    }),
};
