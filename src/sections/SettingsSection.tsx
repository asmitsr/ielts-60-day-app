import { useEffect, useState } from 'react';
import { api, ApiError, type MeResponse, type SessionInfo } from '../lib/api';
import { en } from '../lib/format';
import { Icon, type IconName } from '../lib/icons';
import type { ResolvedSettings, ThemePref, UserSettings } from '../lib/settings';
import type { InfoPageId } from './InfoSection';

type SubPage = 'list' | 'profile' | 'appearance' | 'security' | 'notifications' | 'study' | 'privacy' | 'help' | 'account';

const SUPPORT_EMAIL = 'asmitsr.official@gmail.com';

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return en(
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  );
}

function deviceLabel(ua: string | null): string {
  if (!ua) return 'Unknown device';
  if (/infinix/i.test(ua)) return 'Infinix phone';
  if (/android/i.test(ua)) return 'Android device';
  if (/iphone|ipad/i.test(ua)) return 'iPhone / iPad';
  if (/windows/i.test(ua)) return 'Windows PC';
  if (/macintosh/i.test(ua)) return 'Mac';
  if (/linux/i.test(ua)) return 'Linux device';
  return 'Unknown device';
}

function SubShell({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button type="button" className="back-row" onClick={onBack}>
        <Icon name="back" size={18} /> সেটিংসে ফিরে যাও
      </button>
      <h2 className="section-title">{title}</h2>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`switch${checked ? ' on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="switch-knob" />
    </button>
  );
}

export function SettingsSection({
  me,
  settings,
  appearance,
  onProfileUpdated,
  onAppearanceChange,
  onSettingsSaved,
  onLogout,
  onAccountDeleted,
  onShowInfo,
}: {
  me: MeResponse;
  settings: ResolvedSettings;
  // The effective theme preference (App state) — the checkmark must show
  // what is actually applied, not the last synced server value.
  appearance: ThemePref;
  onProfileUpdated: (fullName: string | null) => void;
  onAppearanceChange: (pref: ThemePref) => Promise<void>;
  onSettingsSaved: (patch: UserSettings) => Promise<void>;
  onLogout: () => void;
  onAccountDeleted: () => void;
  onShowInfo: (page: InfoPageId) => void;
}) {
  const [page, setPage] = useState<SubPage>('list');
  const back = () => setPage('list');

  if (page === 'profile') return <ProfilePage me={me} onBack={back} onSaved={onProfileUpdated} />;
  if (page === 'appearance') {
    return <AppearancePage current={appearance} onBack={back} onSelect={onAppearanceChange} />;
  }
  if (page === 'security') return <SecurityPage onBack={back} onLogout={onLogout} />;
  if (page === 'notifications') {
    return <NotificationsPage settings={settings} onBack={back} onSave={onSettingsSaved} />;
  }
  if (page === 'study') {
    return <StudyPage settings={settings} onBack={back} onSave={onSettingsSaved} />;
  }
  if (page === 'privacy') return <PrivacyPage onBack={back} onShowInfo={onShowInfo} />;
  if (page === 'help') return <HelpPage onBack={back} onShowInfo={onShowInfo} />;
  if (page === 'account') {
    return <AccountPage me={me} onBack={back} onLogout={onLogout} onDeleted={onAccountDeleted} />;
  }

  const rows: { id: SubPage; label: string; icon: IconName; blurb: string }[] = [
    { id: 'profile', label: 'My Profile', icon: 'user', blurb: me.full_name ?? me.email },
    { id: 'appearance', label: 'Appearance', icon: 'sun', blurb: 'Light, Dark, System Default' },
    { id: 'security', label: 'Security', icon: 'shield', blurb: 'Password, Active Sessions' },
    { id: 'notifications', label: 'Notifications', icon: 'bell', blurb: 'In-app reminders' },
    { id: 'study', label: 'Study Preferences', icon: 'target', blurb: 'পড়ার পছন্দ' },
    { id: 'privacy', label: 'Privacy', icon: 'info', blurb: 'তোমার ডেটা, ডাউনলোড' },
    { id: 'help', label: 'Help & Support', icon: 'help', blurb: 'FAQ, যোগাযোগ' },
    { id: 'account', label: 'Account Management', icon: 'trash', blurb: 'Logout, Delete Account' },
  ];
  return (
    <div>
      <h2 className="section-title">সেটিংস</h2>
      <p className="muted">প্রোফাইল, নিরাপত্তা, নোটিফিকেশন — সব এক জায়গায়।</p>
      <div className="card" style={{ padding: 6 }}>
        {rows.map((r) => (
          <button key={r.id} type="button" className="sheet-row" onClick={() => setPage(r.id)}>
            <Icon name={r.icon} size={22} />
            <span>
              {r.label}
              <small>{r.blurb}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfilePage({
  me,
  onBack,
  onSaved,
}: {
  me: MeResponse;
  onBack: () => void;
  onSaved: (fullName: string | null) => void;
}) {
  const [name, setName] = useState(me.full_name ?? '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    setError('');
    setSaved(false);
    setBusy(true);
    try {
      const res = await api.updateProfile(name.trim());
      onSaved(res.full_name);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'সেভ হয়নি। আবার চেষ্টা করো।');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SubShell title="My Profile" onBack={onBack}>
      <div className="card">
        <div className="kv">
          <span className="muted">Email</span>
          <strong>{me.email}</strong>
        </div>
        <div className="kv">
          <span className="muted">Member since</span>
          <strong>{fmtDate(me.created_at)}</strong>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label htmlFor="profile-name">Full Name</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            maxLength={100}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            placeholder="নাম লেখো (খালি রাখলে মুছে যাবে)"
          />
        </div>
        {error && (
          <div className="alert" role="alert">
            <Icon name="alert" size={18} />
            <span>{error}</span>
          </div>
        )}
        {saved && (
          <div className="alert alert-success" role="status">
            <Icon name="success" size={18} />
            <span>নাম সেভ হয়েছে।</span>
          </div>
        )}
        <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
          {busy ? 'সেভ হচ্ছে…' : 'সেভ করো'}
        </button>
      </div>
    </SubShell>
  );
}

function AppearancePage({
  current,
  onBack,
  onSelect,
}: {
  current: ThemePref;
  onBack: () => void;
  onSelect: (pref: ThemePref) => Promise<void>;
}) {
  const [error, setError] = useState('');
  const options: { id: ThemePref; label: string; blurb: string; icon: IconName }[] = [
    { id: 'light', label: 'Light', icon: 'sun', blurb: 'উজ্জ্বল Snow Storm — দিনের বেলা পড়ার জন্য' },
    { id: 'dark', label: 'Dark', icon: 'moon', blurb: 'গভীর Polar Night — রাতে চোখের জন্য আরামদায়ক' },
    { id: 'system', label: 'System Default', icon: 'gear', blurb: 'ফোনের থিম অনুযায়ী নিজে থেকে বদলাবে' },
  ];
  return (
    <SubShell title="Appearance" onBack={onBack}>
      <div className="card" style={{ padding: 6 }}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className="sheet-row"
            onClick={() => {
              setError('');
              onSelect(o.id).catch((err: unknown) =>
                setError(err instanceof ApiError ? err.message : 'সেভ হয়নি — থিম এই ডিভাইসে বদলে গেছে।'),
              );
            }}
            aria-pressed={current === o.id}
          >
            <Icon name={o.icon} size={22} />
            <span>
              {o.label}
              <small>{o.blurb}</small>
            </span>
            {current === o.id && <Icon name="check" size={20} />}
          </button>
        ))}
      </div>
      {error && (
        <div className="alert" role="alert">
          <Icon name="alert" size={18} />
          <span>{error}</span>
        </div>
      )}
      <p className="muted">থিম পছন্দ সব ডিভাইসে একই থাকে (তোমার অ্যাকাউন্টে সেভ হয়)।</p>
    </SubShell>
  );
}

function SecurityPage({ onBack, onLogout }: { onBack: () => void; onLogout: () => void }) {
  const [currentPw, setCurrentPw] = useState('');
  const [nextPw, setNextPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwDone, setPwDone] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [sessions, setSessions] = useState<SessionInfo[] | null>(null);
  const [sessError, setSessError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadSessions() {
    try {
      const res = await api.getSessions();
      setSessions(res.sessions);
    } catch (err) {
      setSessError(err instanceof ApiError ? err.message : 'সেশন লোড হয়নি।');
    }
  }
  useEffect(() => {
    void loadSessions();
  }, []);

  async function changePassword() {
    setPwError('');
    setPwDone(false);
    if (nextPw.length < 8 || nextPw.length > 128) {
      setPwError('নতুন Password 8–128 অক্ষরের হতে হবে।');
      return;
    }
    if (nextPw !== confirmPw) {
      setPwError('দুই নতুন Password মিলছে না।');
      return;
    }
    setPwBusy(true);
    try {
      await api.changePassword(currentPw, nextPw);
      setPwDone(true);
      setCurrentPw('');
      setNextPw('');
      setConfirmPw('');
      void loadSessions();
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : 'কিছু একটা ভুল হয়েছে।');
    } finally {
      setPwBusy(false);
    }
  }

  async function revoke(id: string) {
    setBusy(true);
    try {
      await api.revokeSession(id);
      await loadSessions();
    } catch (err) {
      setSessError(err instanceof ApiError ? err.message : 'সেশন বন্ধ হয়নি।');
    } finally {
      setBusy(false);
    }
  }

  async function revokeOthers() {
    setBusy(true);
    try {
      await api.revokeOtherSessions();
      await loadSessions();
    } catch (err) {
      setSessError(err instanceof ApiError ? err.message : 'সেশন বন্ধ হয়নি।');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SubShell title="Security" onBack={onBack}>
      <div className="card">
        <h3>Change Password</h3>
        <div className="field">
          <label htmlFor="sec-current">বর্তমান Password</label>
          <input
            id="sec-current"
            type="password"
            autoComplete="current-password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="sec-next">নতুন Password</label>
          <input
            id="sec-next"
            type="password"
            autoComplete="new-password"
            value={nextPw}
            onChange={(e) => setNextPw(e.target.value)}
            placeholder="কমপক্ষে 8 অক্ষর"
          />
        </div>
        <div className="field">
          <label htmlFor="sec-confirm">Confirm নতুন Password</label>
          <input
            id="sec-confirm"
            type="password"
            autoComplete="new-password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
          />
        </div>
        {pwError && (
          <div className="alert" role="alert">
            <Icon name="alert" size={18} />
            <span>{pwError}</span>
          </div>
        )}
        {pwDone && (
          <div className="alert alert-success" role="status">
            <Icon name="success" size={18} />
            <span>Password বদলে গেছে। অন্য সব ডিভাইস থেকে লগআউট করা হয়েছে।</span>
          </div>
        )}
        <button type="button" className="btn btn-primary" onClick={changePassword} disabled={pwBusy}>
          {pwBusy ? 'বদলাচ্ছে…' : 'Password বদলাও'}
        </button>
      </div>

      <div className="card">
        <h3>Active Sessions</h3>
        <p className="muted">যেসব ডিভাইসে তুমি লগইন আছো। চেনা নয় এমন ডিভাইস দেখলে সেটা বন্ধ করে দাও।</p>
        {sessError && (
          <div className="alert" role="alert">
            <Icon name="alert" size={18} />
            <span>{sessError}</span>
          </div>
        )}
        {sessions === null && !sessError && <p className="muted">লোড হচ্ছে…</p>}
        {sessions?.map((s) => (
          <div key={s.id} className="session-row">
            <div>
              <strong>
                {deviceLabel(s.user_agent)} {s.current && <span className="chip accent">এই ডিভাইস</span>}
              </strong>
              <div className="muted">
                লগইন: {fmtDate(s.created_at)} · মেয়াদ: {fmtDate(new Date(s.expires_at * 1000).toISOString())}
              </div>
            </div>
            {!s.current && (
              <button type="button" className="btn btn-small" onClick={() => revoke(s.id)} disabled={busy}>
                বন্ধ করো
              </button>
            )}
          </div>
        ))}
        {sessions && sessions.length > 1 && (
          <button type="button" className="btn" onClick={revokeOthers} disabled={busy} style={{ marginTop: 10 }}>
            অন্য সব ডিভাইস থেকে লগআউট করো
          </button>
        )}
      </div>

      <div className="card">
        <h3>Security info</h3>
        <ul>
          <li>Password PBKDF2-HMAC-SHA256 দিয়ে hash করা হয় — আসল password কোথাও রাখা হয় না।</li>
          <li>লগইন সেশন HttpOnly cookie দিয়ে চলে, JavaScript থেকে পড়া যায় না।</li>
          <li>Password বদলালে বা reset করলে সব ডিভাইস থেকে লগআউট হয়ে যায়।</li>
          <li>কোনো ডিভাইস হারিয়ে গেলে এখান থেকে তার সেশন বন্ধ করে দাও, তারপর Password বদলাও।</li>
        </ul>
        <button type="button" className="btn" onClick={onLogout}>
          <Icon name="logout" size={16} /> এই ডিভাইস থেকে লগআউট
        </button>
      </div>
    </SubShell>
  );
}

function NotificationsPage({
  settings,
  onBack,
  onSave,
}: {
  settings: ResolvedSettings;
  onBack: () => void;
  onSave: (patch: UserSettings) => Promise<void>;
}) {
  const [daily, setDaily] = useState(settings.notifications.dailyReminder);
  const [schedule, setSchedule] = useState(settings.notifications.scheduleReminder);
  const [time, setTime] = useState(settings.notifications.reminderTime);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    setError('');
    setSaved(false);
    setBusy(true);
    try {
      await onSave({ notifications: { dailyReminder: daily, scheduleReminder: schedule, reminderTime: time } });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'সেভ হয়নি। আবার চেষ্টা করো।');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SubShell title="Notifications" onBack={onBack}>
      <div className="card">
        <div className="setting-row">
          <div>
            <strong>Daily study reminder</strong>
            <p className="muted">প্রতিদিন পড়ার সময় হলে অ্যাপের ভেতরে reminder দেখাবে।</p>
          </div>
          <Toggle checked={daily} onChange={setDaily} label="Daily study reminder" />
        </div>
        <hr className="divider" />
        <div className="setting-row">
          <div>
            <strong>Schedule reminders</strong>
            <p className="muted">প্রতিটা block শুরুর আগে reminder দেখাবে।</p>
          </div>
          <Toggle checked={schedule} onChange={setSchedule} label="Schedule reminders" />
        </div>
        <hr className="divider" />
        <div className="field">
          <label htmlFor="notif-time">Reminder time</label>
          <input id="notif-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          <p className="muted">Daily reminder এই সময়ে দেখানো হবে।</p>
        </div>
        {error && (
          <div className="alert" role="alert">
            <Icon name="alert" size={18} />
            <span>{error}</span>
          </div>
        )}
        {saved && (
          <div className="alert alert-success" role="status">
            <Icon name="success" size={18} />
            <span>নোটিফিকেশন সেটিংস সেভ হয়েছে।</span>
          </div>
        )}
        <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
          {busy ? 'সেভ হচ্ছে…' : 'সেভ করো'}
        </button>
      </div>
      <p className="muted">
        এই reminder-গুলো in-app — অ্যাপ খোলা থাকলে দেখা যায়। অ্যাপ বন্ধ থাকলে push নোটিফিকেশন আসে না; ফোনের
        Clock অ্যালার্ম ব্যবহার করো।
      </p>
    </SubShell>
  );
}

function StudyPage({
  settings,
  onBack,
  onSave,
}: {
  settings: ResolvedSettings;
  onBack: () => void;
  onSave: (patch: UserSettings) => Promise<void>;
}) {
  const [autoExpand, setAutoExpand] = useState(settings.study.autoExpandToday);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    setError('');
    setSaved(false);
    setBusy(true);
    try {
      await onSave({ study: { autoExpandToday: autoExpand } });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'সেভ হয়নি। আবার চেষ্টা করো।');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SubShell title="Study Preferences" onBack={onBack}>
      <div className="card">
        <div className="kv">
          <span className="muted">Daily goal</span>
          <strong>360 মিনিট / দিন</strong>
        </div>
        <p className="muted">
          Listening 120 + Reading 120 + Writing 90 + Speaking 30 মিনিট — এই প্ল্যানের fixed কাঠামো, বদলানো যায়
          না। শুরুর সময় তুমি Plan পেজের &quot;প্রতিদিনের সময়&quot; থেকে বেছে নাও।
        </p>
        <hr className="divider" />
        <div className="setting-row">
          <div>
            <strong>আজকের দিন auto-expand</strong>
            <p className="muted">Plan খুললে আজকের দিনের task-গুলো নিজে থেকে খোলা থাকবে।</p>
          </div>
          <Toggle checked={autoExpand} onChange={setAutoExpand} label="আজকের দিন auto-expand" />
        </div>
        {error && (
          <div className="alert" role="alert">
            <Icon name="alert" size={18} />
            <span>{error}</span>
          </div>
        )}
        {saved && (
          <div className="alert alert-success" role="status">
            <Icon name="success" size={18} />
            <span>সেভ হয়েছে।</span>
          </div>
        )}
        <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
          {busy ? 'সেভ হচ্ছে…' : 'সেভ করো'}
        </button>
      </div>
    </SubShell>
  );
}

function PrivacyPage({ onBack, onShowInfo }: { onBack: () => void; onShowInfo: (p: InfoPageId) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function downloadData() {
    setError('');
    setBusy(true);
    try {
      const [m, p, b, s] = await Promise.all([
        api.me(),
        api.getProgress(),
        api.getBlockTimes(),
        api.getSettings(),
      ]);
      const data = {
        exported_at: new Date().toISOString(),
        account: { email: m.email, full_name: m.full_name, created_at: m.created_at },
        progress: p.progress,
        block_times: b.blockTimes,
        settings: s.settings,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ielts-60-day-my-data.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'ডাউনলোড হয়নি। আবার চেষ্টা করো।');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SubShell title="Privacy" onBack={onBack}>
      <div className="card">
        <h3>তোমার কী ডেটা আছে</h3>
        <ul>
          <li>অ্যাকাউন্ট: email, নাম (যদি দিয়ে থাকো), password hash</li>
          <li>পড়ার progress: টিক-অফ আর block শুরুর সময়</li>
          <li>সেটিংস: থিম, নোটিফিকেশন, পড়ার পছন্দ</li>
          <li>সেশন: লগইন করা ডিভাইসের তথ্য</li>
        </ul>
        <p className="muted">
          বিস্তারিত{' '}
          <button type="button" className="link-btn" onClick={() => onShowInfo('privacy')}>
            Privacy Policy
          </button>{' '}
          পেজে।
        </p>
        <h3>তোমার ডেটা ডাউনলোড করো</h3>
        <p className="muted">অ্যাকাউন্ট, progress, block time আর সেটিংস — JSON ফাইল হিসেবে ডাউনলোড হবে।</p>
        {error && (
          <div className="alert" role="alert">
            <Icon name="alert" size={18} />
            <span>{error}</span>
          </div>
        )}
        <button type="button" className="btn" onClick={downloadData} disabled={busy}>
          <Icon name="download" size={16} /> {busy ? 'তৈরি হচ্ছে…' : 'My data ডাউনলোড করো'}
        </button>
      </div>
    </SubShell>
  );
}

function HelpPage({ onBack, onShowInfo }: { onBack: () => void; onShowInfo: (p: InfoPageId) => void }) {
  return (
    <SubShell title="Help & Support" onBack={onBack}>
      <div className="card" style={{ padding: 6 }}>
        <button type="button" className="sheet-row" onClick={() => onShowInfo('faq')}>
          <Icon name="help" size={22} />
          <span>
            FAQ
            <small>সাধারণ প্রশ্নের উত্তর</small>
          </span>
        </button>
        <a
          className="sheet-row"
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('IELTS 60-Day App — Support')}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Icon name="mail" size={22} />
          <span>
            Contact Support
            <small>{SUPPORT_EMAIL}</small>
          </span>
        </a>
        <a
          className="sheet-row"
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('IELTS 60-Day App — Problem Report')}&body=${encodeURIComponent('সমস্যাটা কী:\n\nকোন পেজে:\n\nফোনের মডেল:')}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Icon name="alert" size={22} />
          <span>
            Report a Problem
            <small>ভাঙা লিংক বা বাগ জানাও</small>
          </span>
        </a>
      </div>
    </SubShell>
  );
}

function AccountPage({
  me,
  onBack,
  onLogout,
  onDeleted,
}: {
  me: MeResponse;
  onBack: () => void;
  onLogout: () => void;
  onDeleted: () => void;
}) {
  const [password, setPassword] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function deleteAccount() {
    setError('');
    setBusy(true);
    try {
      await api.deleteAccount(password);
      onDeleted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'কিছু একটা ভুল হয়েছে।');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SubShell title="Account Management" onBack={onBack}>
      <div className="card">
        <div className="kv">
          <span className="muted">Email</span>
          <strong>{me.email}</strong>
        </div>
        <div className="kv">
          <span className="muted">Member since</span>
          <strong>{fmtDate(me.created_at)}</strong>
        </div>
        <button type="button" className="btn" onClick={onLogout} style={{ marginTop: 14 }}>
          <Icon name="logout" size={16} /> লগআউট
        </button>
      </div>

      <div className="card danger-zone">
        <h3>Delete Account</h3>
        <p>অ্যাকাউন্ট মুছে ফেললে নিচের সবকিছু স্থায়ীভাবে মুছে যাবে — ফেরত আনা যাবে না:</p>
        <ul>
          <li>তোমার অ্যাকাউন্ট (email, নাম)</li>
          <li>সব টিক-অফ করা progress (60 দিনের সব task)</li>
          <li>সব block শুরুর সময়</li>
          <li>সব লগইন সেশন (সব ডিভাইস)</li>
          <li>তোমার সেটিংস আর password reset লিংক</li>
        </ul>
        <p className="muted">
          মুছে ফেলার আগে Settings → Privacy থেকে তোমার ডেটা ডাউনলোড করে নিতে পারো।
        </p>
        <label className="check-row">
          <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
          <span>আমি বুঝেছি — সব ডেটা স্থায়ীভাবে মুছে যাবে, ফেরত আনা যাবে না।</span>
        </label>
        <div className="field">
          <label htmlFor="delete-password">নিশ্চিত করতে তোমার Password দাও</label>
          <input
            id="delete-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="তোমার Password"
          />
        </div>
        {error && (
          <div className="alert" role="alert">
            <Icon name="alert" size={18} />
            <span>{error}</span>
          </div>
        )}
        <button
          type="button"
          className="btn btn-danger"
          onClick={deleteAccount}
          disabled={busy || !understood || password.length === 0}
        >
          {busy ? 'মুছছে…' : 'অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলো'}
        </button>
      </div>
    </SubShell>
  );
}
