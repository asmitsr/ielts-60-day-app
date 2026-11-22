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
  GMAIL_CLIENT_ID?: string;
  GMAIL_CLIENT_SECRET?: string;
  GMAIL_REFRESH_TOKEN?: string;
  GMAIL_SENDER?: string;
}
export interface AuthedUser {
  id: number;
  email: string;
  fullName: string | null;
  createdAt: string;
}
export interface FunctionContext {
  request: Request;
  env: Env;
}

// Cloudflare Workers' WebCrypto caps PBKDF2 at 100,000 iterations
// (above that, deriveBits throws NotSupportedError and the Function
// crashes with error 1101). 100,000 is the Workers maximum.
const PBKDF2_ITERATIONS = 100000;
export const SESSION_MAX_AGE_S = 30 * 24 * 3600; // 30 days (remembered)
export const SHORT_SESSION_MAX_AGE_S = 12 * 3600; // 12 hours (not remembered)
export const RESET_TOKEN_TTL_S = 3600; // 1 hour

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

// SHA-256 hex digest — used for password-reset tokens so the database
// never holds a usable token (a leaked DB cannot reset passwords).
export async function sha256Hex(data: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return hex(new Uint8Array(digest));
}

export function isoNow(): string {
  return new Date().toISOString();
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

function cookieAttrs(secure: boolean, maxAge: number | null): string {
  // maxAge null = no Max-Age attribute: a session cookie that ends when
  // the browser closes (used for "don't remember me" logins).
  return `Path=/; HttpOnly; SameSite=Lax${maxAge === null ? '' : `; Max-Age=${maxAge}`}${secure ? '; Secure' : ''}`;
}

// Session cookie value is `<id>.<HMAC(id, SESSION_SECRET)>`; the row in the
// sessions table is what makes logout/revocation possible.
export async function createSession(
  env: Env,
  userId: number,
  secure: boolean,
  opts: { maxAgeS?: number; userAgent?: string | null } = {},
): Promise<string> {
  const secret = env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not configured');
  const maxAgeS = opts.maxAgeS ?? SESSION_MAX_AGE_S;
  const id = hex(randomBytes(24));
  const sig = await hmac(secret, id);
  const expiresAt = Math.floor(Date.now() / 1000) + maxAgeS;
  await env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at, user_agent) VALUES (?, ?, ?, ?)')
    .bind(id, userId, expiresAt, opts.userAgent ?? null)
    .run();
  // Remembered sessions get Max-Age; short sessions are browser-session
  // cookies (no Max-Age) with a 12-hour DB expiry as the backstop.
  return `session=${id}.${sig}; ${cookieAttrs(secure, maxAgeS >= SESSION_MAX_AGE_S ? maxAgeS : null)}`;
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
    'SELECT u.id AS id, u.email AS email, u.full_name AS full_name, u.created_at AS created_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > ?',
  )
    .bind(id, Math.floor(Date.now() / 1000))
    .first<{ id: number; email: string; full_name: string | null; created_at: string }>();
  return row ? { id: row.id, email: row.email, fullName: row.full_name, createdAt: row.created_at } : null;
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
