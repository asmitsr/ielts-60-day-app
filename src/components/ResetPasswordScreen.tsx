import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import { Icon } from '../lib/icons';

function strength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  score = Math.min(score, 4);
  const label = score <= 1 ? 'দুর্বল' : score === 2 ? 'মাঝারি' : score === 3 ? 'ভালো' : 'শক্তিশালী';
  return { score, label };
}

// Shown at /reset-password?token=… (from the email link). No session needed.
export function ResetPasswordScreen({ token, onDone }: { token: string; onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const pw = strength(password);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8 || password.length > 128) {
      setError('Password 8–128 অক্ষরের হতে হবে।');
      return;
    }
    if (password !== confirm) {
      setError('দুই Password মিলছে না।');
      return;
    }
    setBusy(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'কিছু একটা ভুল হয়েছে। আবার চেষ্টা করো।');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>নতুন Password সেট করো</h2>
        <p className="sub">এই লিংক একবারই কাজ করে, আর 1 ঘণ্টা পর মেয়াদ শেষ হয়।</p>
        {done ? (
          <>
            <div className="alert alert-success" role="status">
              <Icon name="success" size={18} />
              <span>Password বদলে গেছে। সব ডিভাইস থেকে লগআউট করা হয়েছে — নতুন Password দিয়ে আবার লগইন করো।</span>
            </div>
            <button type="button" className="btn btn-primary btn-block" onClick={onDone}>
              লগইন পেজে যাও
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            {error && (
              <div className="alert" role="alert">
                <Icon name="alert" size={18} />
                <span>{error}</span>
              </div>
            )}
            <div className="field">
              <label htmlFor="reset-password">নতুন Password</label>
              <div className="password-wrap">
                <input
                  id="reset-password"
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="কমপক্ষে 8 অক্ষর"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShow(!show)}
                  aria-label={show ? 'Password লুকাও' : 'Password দেখাও'}
                >
                  <Icon name={show ? 'eyeOff' : 'eye'} size={19} />
                </button>
              </div>
            </div>
            {password.length > 0 && (
              <div className="strength" aria-live="polite">
                <div className="strength-bar">
                  <div className={`strength-fill strength-${pw.score}`} style={{ width: `${pw.score * 25}%` }} />
                </div>
                <span className="muted">Password strength: {pw.label}</span>
              </div>
            )}
            <div className="field">
              <label htmlFor="reset-confirm">Confirm নতুন Password</label>
              <input
                id="reset-confirm"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Password আবার লেখো"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? 'অপেক্ষা করো…' : 'Password বদলাও'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
