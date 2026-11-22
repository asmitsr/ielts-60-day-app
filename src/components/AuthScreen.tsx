import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import { Icon } from '../lib/icons';

export function AuthScreen({ onAuthed }: { onAuthed: (email: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) {
      setError('সঠিক email দাও।');
      return;
    }
    if (password.length < 8) {
      setError('Password কমপক্ষে 8 অক্ষরের হতে হবে।');
      return;
    }
    setBusy(true);
    try {
      const res = mode === 'login' ? await api.login(email, password) : await api.register(email, password);
      onAuthed(res.email);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'কিছু একটা ভুল হয়েছে। আবার চেষ্টা করো।');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>IELTS 60-Day App</h2>
        <p className="sub">
          {mode === 'login' ? 'লগইন করো — তোমার progress সেভ থাকে।' : 'অ্যাকাউন্ট খোলো — progress সব ডিভাইসে একই থাকবে।'}
        </p>
        {error && (
          <div className="alert" role="alert">
            <Icon name="alert" size={18} />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="কমপক্ষে 8 অক্ষর"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'অপেক্ষা করো…' : mode === 'login' ? 'লগইন' : 'অ্যাকাউন্ট খোলো'}
          </button>
        </form>
        <p className="auth-switch">
          {mode === 'login' ? (
            <>
              অ্যাকাউন্ট নেই?{' '}
              <button type="button" onClick={() => { setMode('register'); setError(''); }}>
                অ্যাকাউন্ট খোলো
              </button>
            </>
          ) : (
            <>
              অ্যাকাউন্ট আছে?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(''); }}>
                লগইন করো
              </button>
            </>
          )}
        </p>
        <p className="muted" style={{ marginTop: 16, marginBottom: 0 }}>
          একই অ্যাকাউন্ট দিয়ে যেকোনো ডিভাইস থেকে লগইন করলে একই progress দেখাবে।
        </p>
      </div>
    </div>
  );
}
