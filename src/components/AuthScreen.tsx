import { useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { Icon } from '../lib/icons';

export type LegalPageId = 'privacy' | 'terms';

type Mode = 'login' | 'register' | 'forgot';

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

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-wrap">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
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
  );
}

export function AuthScreen({
  onAuthed,
  onShowLegal,
}: {
  onAuthed: (email: string) => void;
  onShowLegal: (page: LegalPageId) => void;
}) {
  const [mode, setMode] = useState<Mode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [remember, setRemember] = useState(true);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  // null = config not loaded yet; the register link stays visible until
  // the server says registration is closed (the server enforces 403 anyway).
  const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(null);

  const pw = strength(password);

  function switchMode(m: Mode) {
    setMode(m);
    setError('');
    setNotice('');
  }

  useEffect(() => {
    api
      .getConfig()
      .then((c) => {
        setRegistrationOpen(c.registrationOpen);
        if (!c.registrationOpen) switchMode('login');
      })
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!email.includes('@') || email.length > 254) {
      setError('সঠিক email দাও।');
      return;
    }
    if (mode === 'forgot') {
      setBusy(true);
      try {
        await api.forgotPassword(email);
        setNotice(
          'এই email-এ কোনো অ্যাকাউন্ট থাকলে সেখানে password reset লিংক পাঠানো হয়েছে। ইনবক্স (আর স্প্যাম ফোল্ডার) চেক করো — লিংক 1 ঘণ্টা কাজ করবে।',
        );
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'কিছু একটা ভুল হয়েছে। আবার চেষ্টা করো।');
      } finally {
        setBusy(false);
      }
      return;
    }
    if (password.length < 8 || password.length > 128) {
      setError('Password 8–128 অক্ষরের হতে হবে।');
      return;
    }
    if (mode === 'register') {
      if (password !== confirm) {
        setError('দুই Password মিলছে না।');
        return;
      }
      if (!terms || !privacy) {
        setError('অ্যাকাউন্ট খুলতে Terms আর Privacy Policy — দুটোতেই রাজি হতে হবে।');
        return;
      }
    }
    setBusy(true);
    try {
      const res =
        mode === 'login'
          ? await api.login(email, password, remember)
          : await api.register(email, password, {
              fullName: fullName.trim() || undefined,
              termsAccepted: terms,
              privacyAccepted: privacy,
            });
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
          {mode === 'login' && 'লগইন করো — তোমার progress সেভ থাকে।'}
          {mode === 'register' && 'অ্যাকাউন্ট খোলো — progress সব ডিভাইসে একই থাকবে।'}
          {mode === 'forgot' && 'তোমার email দাও — password reset লিংক পাঠাবো।'}
        </p>
        {error && (
          <div className="alert" role="alert">
            <Icon name="alert" size={18} />
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <div className="alert alert-success" role="status">
            <Icon name="success" size={18} />
            <span>{notice}</span>
          </div>
        )}
        <form onSubmit={submit}>
          {mode === 'register' && (
            <div className="field">
              <label htmlFor="auth-name">Full Name (optional)</label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="তোমার নাম"
                maxLength={100}
              />
            </div>
          )}
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
          {mode !== 'forgot' && (
            <>
              <PasswordField
                id="auth-password"
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder={mode === 'login' ? 'তোমার Password' : 'কমপক্ষে 8 অক্ষর'}
              />
              {mode === 'register' && password.length > 0 && (
                <div className="strength" aria-live="polite">
                  <div className="strength-bar">
                    <div className={`strength-fill strength-${pw.score}`} style={{ width: `${pw.score * 25}%` }} />
                  </div>
                  <span className="muted">Password strength: {pw.label}</span>
                </div>
              )}
              {mode === 'register' && (
                <PasswordField
                  id="auth-confirm"
                  label="Confirm Password"
                  value={confirm}
                  onChange={setConfirm}
                  autoComplete="new-password"
                  placeholder="Password আবার লেখো"
                />
              )}
            </>
          )}
          {mode === 'login' && (
            <label className="check-row">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>
                Remember me
                <small>টিক দিলে 30 দিন লগইন থাকবে; না দিলে ব্রাউজার বন্ধ করলে লগআউট হবে।</small>
              </span>
            </label>
          )}
          {mode === 'register' && (
            <div className="consent">
              <label className="check-row">
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                <span>
                  আমি{' '}
                  <button type="button" className="link-btn" onClick={() => onShowLegal('terms')}>
                    Terms &amp; Conditions
                  </button>{' '}
                  পড়েছি ও মানতে রাজি।
                </span>
              </label>
              <label className="check-row">
                <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
                <span>
                  আমি{' '}
                  <button type="button" className="link-btn" onClick={() => onShowLegal('privacy')}>
                    Privacy Policy
                  </button>{' '}
                  পড়েছি ও মানতে রাজি।
                </span>
              </label>
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy
              ? 'অপেক্ষা করো…'
              : mode === 'login'
                ? 'লগইন'
                : mode === 'register'
                  ? 'অ্যাকাউন্ট খোলো'
                  : 'Reset লিংক পাঠাও'}
          </button>
        </form>
        {mode === 'login' && (
          <p className="auth-switch">
            <button type="button" onClick={() => switchMode('forgot')}>
              Password ভুলে গেছো?
            </button>
          </p>
        )}
        <p className="auth-switch">
          {mode === 'login' && registrationOpen !== false && (
            <>
              অ্যাকাউন্ট নেই?{' '}
              <button type="button" onClick={() => switchMode('register')}>
                অ্যাকাউন্ট খোলো
              </button>
            </>
          )}
          {mode === 'login' && registrationOpen === false && (
            <span className="muted">নতুন অ্যাকাউন্ট খোলা এখন বন্ধ আছে।</span>
          )}
          {mode === 'register' && (
            <>
              অ্যাকাউন্ট আছে?{' '}
              <button type="button" onClick={() => switchMode('login')}>
                লগইন করো
              </button>
            </>
          )}
          {mode === 'forgot' && (
            <>
              মনে পড়েছে?{' '}
              <button type="button" onClick={() => switchMode('login')}>
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
