// Typed client for the Pages Functions API. All calls send the session
// cookie (same-origin). No secrets live here — auth is cookie-based and
// D1 access is server-side only.
import type { UserSettings } from './settings';

export interface MeResponse {
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface SessionInfo {
  id: string;
  created_at: string;
  expires_at: number;
  user_agent: string | null;
  current: boolean;
}

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
  me: () => call<MeResponse>('/api/auth/me'),
  register: (
    email: string,
    password: string,
    opts: { fullName?: string; termsAccepted?: boolean; privacyAccepted?: boolean } = {},
  ) =>
    call<{ email: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        full_name: opts.fullName || undefined,
        terms_accepted: opts.termsAccepted === true,
        privacy_accepted: opts.privacyAccepted === true,
      }),
    }),
  login: (email: string, password: string, remember = true) =>
    call<{ email: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, remember }),
    }),
  logout: () => call<{ ok: boolean }>('/api/auth/logout', { method: 'POST', body: '{}' }),
  forgotPassword: (email: string) =>
    call<{ ok: boolean }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    call<{ ok: boolean }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    call<{ ok: boolean }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),
  updateProfile: (fullName: string) =>
    call<{ full_name: string | null }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ full_name: fullName }),
    }),
  getSessions: () => call<{ sessions: SessionInfo[] }>('/api/auth/sessions'),
  revokeSession: (sessionId: string) =>
    call<{ ok: boolean }>('/api/auth/sessions/revoke', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    }),
  revokeOtherSessions: () =>
    call<{ ok: boolean; revoked: number }>('/api/auth/sessions/revoke', {
      method: 'POST',
      body: JSON.stringify({ all_except_current: true }),
    }),
  deleteAccount: (password: string) =>
    call<{ ok: boolean }>('/api/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    }),
  getSettings: () => call<{ settings: UserSettings }>('/api/settings'),
  saveSettings: (patch: UserSettings) =>
    call<{ settings: UserSettings }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),
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
