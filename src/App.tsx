import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, type MeResponse } from './lib/api';
import { progressKey } from './lib/format';
import { SECTIONS, type SectionId } from './lib/sections';
import {
  DEFAULT_SETTINGS,
  resolveSettings,
  type ResolvedSettings,
  type ThemePref,
  type UserSettings,
} from './lib/settings';
import { Icon } from './lib/icons';
import { AuthScreen, type LegalPageId } from './components/AuthScreen';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';
import { BottomNav } from './components/BottomNav';
import { MoreSheet } from './components/MoreSheet';
import { PlanSection } from './sections/PlanSection';
import { StepsSection } from './sections/StepsSection';
import { PracticeSection } from './sections/PracticeSection';
import { ResourcesSection } from './sections/ResourcesSection';
import { FormatSection } from './sections/FormatSection';
import { CueCardsSection } from './sections/CueCardsSection';
import { TechniquesSection } from './sections/TechniquesSection';
import { AiSection } from './sections/AiSection';
import { SettingsSection, type SettingsSubPage } from './sections/SettingsSection';
import { InfoSection, type InfoPageId } from './sections/InfoSection';
import './theme.css';

type Theme = 'light' | 'dark';
type AuthState = 'loading' | 'authed' | 'guest';

function initialThemePref(): ThemePref {
  const saved = localStorage.getItem('ielts-theme');
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  return 'system'; // same as the old default: follow the OS theme
}

function resolvePref(pref: ThemePref): Theme {
  if (pref !== 'system') return pref;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resetTokenFromUrl(): string | null {
  if (window.location.pathname !== '/reset-password') return null;
  return new URLSearchParams(window.location.search).get('token');
}

export default function App() {
  const [pref, setPref] = useState<ThemePref>(initialThemePref);
  const [theme, setTheme] = useState<Theme>(() => resolvePref(initialThemePref()));
  const [auth, setAuth] = useState<AuthState>('loading');
  const [me, setMe] = useState<MeResponse | null>(null);
  const [section, setSection] = useState<SectionId>('plan');
  const [infoPage, setInfoPage] = useState<InfoPageId | undefined>(undefined);
  const [settingsSub, setSettingsSub] = useState<SettingsSubPage | undefined>(undefined);
  const [moreOpen, setMoreOpen] = useState(false);
  const [progress, setProgress] = useState<Record<string, true>>({});
  const [blockTimes, setBlockTimes] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<ResolvedSettings>(DEFAULT_SETTINGS);
  const [apiDown, setApiDown] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(resetTokenFromUrl);
  const [guestInfo, setGuestInfo] = useState<LegalPageId | null>(null);

  useEffect(() => {
    const resolved = resolvePref(pref);
    setTheme(resolved);
    document.documentElement.dataset.theme = resolved;
    localStorage.setItem('ielts-theme', pref);
  }, [pref]);

  useEffect(() => {
    if (pref !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setTheme(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [pref]);

  const loadData = useCallback(async () => {
    try {
      const [p, b, s] = await Promise.all([api.getProgress(), api.getBlockTimes(), api.getSettings()]);
      setProgress(p.progress);
      setBlockTimes(b.blockTimes);
      const resolved = resolveSettings(s.settings);
      setSettings(resolved);
      // A stored server preference wins over the local cache; without one,
      // the local choice (or the system default) stands.
      if (s.settings.appearance) {
        setPref(s.settings.appearance);
      }
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
    // The reset link is usable without a session; don't probe /me first.
    if (resetToken) {
      setAuth('guest');
      return;
    }
    api
      .me()
      .then((res) => {
        setMe(res);
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
  }, [loadData, resetToken]);

  const selectSection = useCallback((s: SectionId) => {
    setSection(s);
    setMoreOpen(false);
    if (s !== 'info') setInfoPage(undefined);
    // A plain section switch always opens Settings at its list; the AI
    // section's deep link sets the sub-page after calling this.
    setSettingsSub(undefined);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }, []);

  // AI section → Settings → AI sub-page (deep link). selectSection clears
  // the sub-page first; this set runs after it in the same batch, so 'ai'
  // is what the freshly mounted SettingsSection reads as initialPage.
  const openAiSettings = useCallback(() => {
    selectSection('settings');
    setSettingsSub('ai');
  }, [selectSection]);

  const showInfo = useCallback(
    (page: InfoPageId) => {
      setInfoPage(page);
      selectSection('info');
    },
    [selectSection],
  );

  const saveSettings = useCallback(async (patch: UserSettings) => {
    const res = await api.saveSettings(patch);
    setSettings(resolveSettings(res.settings));
  }, []);

  const toggleTheme = useCallback(() => {
    // Quick toggle = explicit light/dark (System Default lives in Settings).
    // Apply instantly, then persist to the server so every device agrees;
    // a failed persist never blocks the toggle.
    const next = theme === 'light' ? 'dark' : 'light';
    setPref(next);
    if (auth === 'authed') {
      void saveSettings({ appearance: next }).catch(() => {});
    }
  }, [theme, auth, saveSettings]);

  const changeAppearance = useCallback(
    async (next: ThemePref) => {
      setPref(next); // apply instantly, even if the sync below fails
      await saveSettings({ appearance: next });
    },
    [saveSettings],
  );

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

  async function clearBlockTime(module: string) {
    const prev = blockTimes;
    setBlockTimes((b) => {
      const next = { ...b };
      delete next[module];
      return next;
    });
    setSaveError('');
    try {
      await api.clearBlockTime(module);
    } catch (err) {
      setBlockTimes(prev);
      if (err instanceof ApiError && err.status === 401) setAuth('guest');
      else setSaveError(err instanceof ApiError ? err.message : 'সেভ হয়নি। আবার চেষ্টা করো।');
    }
  }

  function clearLocalSession() {
    setAuth('guest');
    setMe(null);
    setProgress({});
    setBlockTimes({});
    setSettings(DEFAULT_SETTINGS);
    setSection('plan');
    setInfoPage(undefined);
  }

  async function logout() {
    try {
      await api.logout();
    } catch {
      // Even if the request fails, drop the local session view.
    }
    clearLocalSession();
  }

  function exitReset() {
    window.history.replaceState('/', '');
    setResetToken(null);
  }

  if (auth === 'loading') {
    return (
      <div className="app">
        <p className="loading">লোড হচ্ছে…</p>
      </div>
    );
  }
  if (auth === 'guest') {
    if (resetToken) {
      return (
        <div className="app">
          <ResetPasswordScreen token={resetToken} onDone={exitReset} />
        </div>
      );
    }
    if (guestInfo) {
      return (
        <div className="app">
          <InfoSection initialPage={guestInfo} onBack={() => setGuestInfo(null)} />
        </div>
      );
    }
    return (
      <div className="app">
        {apiDown && (
          <div className="alert" role="alert" style={{ marginTop: 16 }}>
            <Icon name="alert" size={18} />
            <span>Server-এর সাথে যোগাযোগ করা যাচ্ছে না। ইন্টারনেট চেক করে পেজটা refresh করো।</span>
          </div>
        )}
        <AuthScreen
          onAuthed={() => {
            // Re-read /me so full_name + created_at are available.
            api
              .me()
              .then((res) => {
                setMe(res);
                setAuth('authed');
                setApiDown(false);
                void loadData();
              })
              .catch(() => setAuth('guest'));
          }}
          onShowLegal={(page) => setGuestInfo(page)}
        />
      </div>
    );
  }

  return (
    <div className="app">
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
        <span className="pillbar-actions">
          <span className="account">
            <span>{me?.email}</span>
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
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={19} />
          </button>
        </span>
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
            onClearBlockTime={clearBlockTime}
            apiDown={apiDown}
            autoExpandToday={settings.study.autoExpandToday}
            notifications={settings.notifications}
          />
        )}
        {section === 'steps' && <StepsSection />}
        {section === 'practice' && <PracticeSection onNavigate={selectSection} />}
        {section === 'resources' && <ResourcesSection />}
        {section === 'format' && <FormatSection />}
        {section === 'cuecards' && <CueCardsSection />}
        {section === 'techniques' && <TechniquesSection />}
        {section === 'ai' && <AiSection onOpenSettings={openAiSettings} />}
        {section === 'settings' && me && (
          <SettingsSection
            me={me}
            settings={settings}
            appearance={pref}
            initialPage={settingsSub}
            onProfileUpdated={(fullName) => setMe((m) => (m ? { ...m, full_name: fullName } : m))}
            onAppearanceChange={changeAppearance}
            onSettingsSaved={saveSettings}
            onLogout={logout}
            onAccountDeleted={clearLocalSession}
            onShowInfo={showInfo}
          />
        )}
        {section === 'info' && <InfoSection key={infoPage ?? 'list'} initialPage={infoPage} />}
      </main>

      <BottomNav section={section} onSelect={selectSection} onMore={() => setMoreOpen(true)} />
      <MoreSheet
        open={moreOpen}
        active={section}
        onClose={() => setMoreOpen(false)}
        onSelect={selectSection}
        theme={theme}
        onToggleTheme={toggleTheme}
        email={me?.email ?? ''}
        onLogout={logout}
      />
    </div>
  );
}
