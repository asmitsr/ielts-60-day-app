// Shared helpers for Pages Functions. SERVER-SIDE ONLY — nothing in this
// file is ever bundled into client code. D1 access happens only here.
export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta?: { last_row_id?: number; changes?: number };
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(col?: string): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
export interface Env {
  DB: D1Database;
  SESSION_SECRET?: string;
  ALLOW_REGISTRATION?: string;
}
export interface AuthedUser {
  id: number;
  email: string;
}
export interface FunctionContext {
  request: Request;
  env: Env;
}

// OWASP recommendation for PBKDF2-HMAC-SHA256.
const PBKDF2_ITERATIONS = 600000;
const SESSION_MAX_AGE_S = 30 * 24 * 3600; // 30 days

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

export function hex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export function b64url(bytes: Uint8Array): string {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
export function randomBytes(n: number): Uint8Array {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return b;
}

export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return hex(new Uint8Array(bits));
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return b64url(new Uint8Array(sig));
}

function cookieAttrs(secure: boolean, maxAge: number): string {
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

// Session cookie value is `<id>.<HMAC(id, SESSION_SECRET)>`; the row in the
// sessions table is what makes logout/revocation possible.
export async function createSession(env: Env, userId: number, secure: boolean): Promise<string> {
  const secret = env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not configured');
  const id = hex(randomBytes(24));
  const sig = await hmac(secret, id);
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_S;
  await env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(id, userId, expiresAt)
    .run();
  return `session=${id}.${sig}; ${cookieAttrs(secure, SESSION_MAX_AGE_S)}`;
}

export function clearSessionCookie(secure: boolean): string {
  return `session=; ${cookieAttrs(secure, 0)}`;
}

function parseSessionCookie(request: Request): string | null {
  const m = /(?:^|;\s*)session=([^;]+)/.exec(request.headers.get('cookie') ?? '');
  return m ? m[1] : null;
}

export async function getSessionUser(request: Request, env: Env): Promise<AuthedUser | null> {
  const secret = env.SESSION_SECRET;
  const raw = parseSessionCookie(request);
  if (!secret || !raw) return null;
  const [id, sig] = raw.split('.');
  if (!id || !sig) return null;
  if (sig !== (await hmac(secret, id))) return null;
  const row = await env.DB.prepare(
    'SELECT u.id AS id, u.email AS email FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > ?',
  )
    .bind(id, Math.floor(Date.now() / 1000))
    .first<{ id: number; email: string }>();
  return row ? { id: row.id, email: row.email } : null;
}

export function sessionIdFrom(request: Request): string | null {
  const raw = parseSessionCookie(request);
  return raw ? raw.split('.')[0] : null;
}

export function isHttps(request: Request): boolean {
  return new URL(request.url).protocol === 'https:';
}

export function validEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
