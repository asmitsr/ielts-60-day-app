import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from './lib/api';
import { progressKey } from './lib/format';
import { SECTIONS, type SectionId } from './lib/sections';
import { Icon } from './lib/icons';
import { AuthScreen } from './components/AuthScreen';
import { BottomNav } from './components/BottomNav';
import { MoreSheet } from './components/MoreSheet';
import { PlanSection } from './sections/PlanSection';
import { StepsSection } from './sections/StepsSection';
import { PracticeSection } from './sections/PracticeSection';
import { ResourcesSection } from './sections/ResourcesSection';
import { FormatSection } from './sections/FormatSection';
import { CueCardsSection } from './sections/CueCardsSection';
import { TechniquesSection } from './sections/TechniquesSection';
import './theme.css';

type Theme = 'light' | 'dark';
type AuthState = 'loading' | 'authed' | 'guest';

function initialTheme(): Theme {
  // Theme preference only (UI choice). Progress data is NEVER in localStorage.
  const saved = localStorage.getItem('ielts-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [auth, setAuth] = useState<AuthState>('loading');
  const [email, setEmail] = useState('');
  const [section, setSection] = useState<SectionId>('plan');
  const [moreOpen, setMoreOpen] = useState(false);
  const [progress, setProgress] = useState<Record<string, true>>({});
  const [blockTimes, setBlockTimes] = useState<Record<string, string>>({});
  const [apiDown, setApiDown] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('ielts-theme', theme);
  }, [theme]);

  const loadData = useCallback(async () => {
    try {
      const [p, b] = await Promise.all([api.getProgress(), api.getBlockTimes()]);
      setProgress(p.progress);
      setBlockTimes(b.blockTimes);
      setApiDown(false);
      setSaveError('');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAuth('guest');
        return;
      }
      setApiDown(true);
    }
  }, []);

  useEffect(() => {
    api
      .me()
      .then((res) => {
        setEmail(res.email);
        setAuth('authed');
        void loadData();
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) setAuth('guest');
        else {
          // API unreachable: stay on the auth screen with a clear error.
          setAuth('guest');
          setApiDown(true);
        }
      });
  }, [loadData]);

  const selectSection = useCallback((s: SectionId) => {
    setSection(s);
    setMoreOpen(false);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }, []);

  async function toggleTask(day: number, taskIndex: number, done: boolean) {
    const key = progressKey(day, taskIndex);
    const prev = progress;
    setProgress((p) => {
      const next = { ...p };
      if (done) next[key] = true;
      else delete next[key];
      return next;
    });
    setSaveError('');
    try {
      await api.setProgress(day, taskIndex, done);
    } catch (err) {
      setProgress(prev); // roll back — never pretend a failed save worked
      if (err instanceof ApiError && err.status === 401) setAuth('guest');
      else setSaveError(err instanceof ApiError ? err.message : 'সেভ হয়নি। আবার চেষ্টা করো।');
    }
  }

  async function saveBlockTime(module: string, startTime: string) {
    const prev = blockTimes;
    setBlockTimes((b) => ({ ...b, [module]: startTime }));
    setSaveError('');
    try {
      await api.setBlockTime(module, startTime);
    } catch (err) {
      setBlockTimes(prev);
      if (err instanceof ApiError && err.status === 401) setAuth('guest');
      else setSaveError(err instanceof ApiError ? err.message : 'সেভ হয়নি। আবার চেষ্টা করো।');
    }
  }

  async function logout() {
    try {
      await api.logout();
    } catch {
      // Even if the request fails, drop the local session view.
    }
    setAuth('guest');
    setEmail('');
    setProgress({});
    setBlockTimes({});
    setSection('plan');
  }

  if (auth === 'loading') {
    return (
      <div className="app">
        <p className="loading">লোড হচ্ছে…</p>
      </div>
    );
  }
  if (auth === 'guest') {
    return (
      <div className="app">
        {apiDown && (
          <div className="alert" role="alert" style={{ marginTop: 16 }}>
            <Icon name="alert" size={18} />
            <span>Server-এর সাথে যোগাযোগ করা যাচ্ছে না। ইন্টারনেট চেক করে পেজটা refresh করো।</span>
          </div>
        )}
        <AuthScreen
          onAuthed={(mail) => {
            setEmail(mail);
            setAuth('authed');
            setApiDown(false);
            void loadData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>IELTS 60-Day App</h1>
        <span className="account">
          <span>{email}</span>
          <button
            type="button"
            className="icon-btn"
            style={{ width: 32, height: 32 }}
            onClick={logout}
            aria-label="লগআউট"
            title="লগআউট"
          >
            <Icon name="logout" size={16} />
          </button>
        </span>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={19} />
        </button>
      </header>

      <nav className="pillbar" aria-label="সেকশন">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`pill${section === s.id ? ' active' : ''}`}
            onClick={() => selectSection(s.id)}
            aria-current={section === s.id ? 'page' : undefined}
          >
            <Icon name={s.icon} size={16} />
            {s.label}
          </button>
        ))}
      </nav>

      {(apiDown || saveError) && (
        <div className="alert" role="alert">
          <Icon name="alert" size={18} />
          <span>
            {saveError || 'Server-এর সাথে যোগাযোগ করা যাচ্ছে না — টিক-অফ এখন বন্ধ আছে।'}{' '}
            <button type="button" onClick={() => void loadData()} style={{ fontWeight: 700, textDecoration: 'underline' }}>
              আবার চেষ্টা করো
            </button>
          </span>
        </div>
      )}

      <main>
        {section === 'plan' && (
          <PlanSection
            progress={progress}
            blockTimes={blockTimes}
            onToggleTask={toggleTask}
            onSaveBlockTime={saveBlockTime}
            apiDown={apiDown}
          />
        )}
        {section === 'steps' && <StepsSection />}
        {section === 'practice' && <PracticeSection onNavigate={selectSection} />}
        {section === 'resources' && <ResourcesSection />}
        {section === 'format' && <FormatSection />}
        {section === 'cuecards' && <CueCardsSection />}
        {section === 'techniques' && <TechniquesSection />}
      </main>

      <BottomNav section={section} onSelect={selectSection} onMore={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} active={section} onClose={() => setMoreOpen(false)} onSelect={selectSection} />
    </div>
  );
}
