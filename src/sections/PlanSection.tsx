import { useEffect, useState } from 'react';
import { MODULES, MODULE_BN, PLAN, TOTAL_TASKS } from '../data/plan';
import { currentDayNumber, en, progressKey } from '../lib/format';
import type { ResolvedSettings } from '../lib/settings';
import { ProgressHero } from '../components/ProgressHero';
import { NowPanel } from '../components/NowPanel';
import { BlockTimeEditor } from '../components/BlockTimeEditor';
import { DayRow } from '../components/DayRow';
import { Icon } from '../lib/icons';

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// In-app reminder banner (no push): shows when the next study block starts
// within 15 minutes, or at the daily reminder time. Driven by the user's
// notification settings; renders nothing when reminders are off.
function ReminderBanner({
  blockTimes,
  notifications,
}: {
  blockTimes: Record<string, string>;
  notifications: ResolvedSettings['notifications'];
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const nowMins = now.getHours() * 60 + now.getMinutes();
  const starts = MODULES.filter((m) => blockTimes[m])
    .map((m) => ({ module: m, start: toMinutes(blockTimes[m]) }))
    .sort((a, b) => a.start - b.start);

  let message = '';
  if (notifications.scheduleReminder) {
    const next = starts.find((s) => s.start > nowMins && s.start - nowMins <= 15);
    if (next) {
      message = `${MODULE_BN[next.module]} শুরু হতে ${en(next.start - nowMins)} মিনিট বাকি — তৈরি হয়ে নাও।`;
    }
  }
  if (!message && notifications.dailyReminder) {
    const rt = toMinutes(notifications.reminderTime);
    const started = starts.some((s) => s.start <= nowMins);
    if (nowMins >= rt && nowMins < rt + 15 && !started) {
      message = 'আজকের পড়া শুরু করার সময় — প্রথম block শুরু করো।';
    }
  }
  if (!message) return null;
  return (
    <div className="alert alert-info" role="status">
      <Icon name="bell" size={18} />
      <span>{message}</span>
    </div>
  );
}

const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
];
function bnDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${BN_MONTHS[m - 1]} ${y}`;
}

export function PlanSection({
  progress,
  blockTimes,
  onToggleTask,
  onSaveBlockTime,
  onClearBlockTime,
  apiDown,
  autoExpandToday,
  notifications,
}: {
  progress: Record<string, true>;
  blockTimes: Record<string, string>;
  onToggleTask: (day: number, taskIndex: number, done: boolean) => void;
  onSaveBlockTime: (module: string, startTime: string) => void;
  onClearBlockTime: (module: string) => void;
  apiDown: boolean;
  autoExpandToday: boolean;
  notifications: ResolvedSettings['notifications'];
}) {
  const today = currentDayNumber();
  const [expanded, setExpanded] = useState<number | null>(autoExpandToday ? today : null);
  const starting = Date.now() < Date.parse('2026-11-23T00:00:00');
  const doneTasks = Object.keys(progress).length;
  const doneDays = PLAN.days.filter((d) => d.tasks.every((_, i) => progress[progressKey(d.day, i)])).length;

  return (
    <div>
      <ProgressHero doneDays={doneDays} totalDays={60} doneTasks={doneTasks} totalTasks={TOTAL_TASKS} />
      <p className="meta-line">
        Day 1: {en(bnDate(PLAN.day1))} · Day 60: {en(bnDate(PLAN.day60))} · প্রতিদিন {en(PLAN.daily_minutes)}{' '}
        মিনিট · {en(PLAN.mock_schedule_note)}
      </p>
      <NowPanel blockTimes={blockTimes} />
      <ReminderBanner blockTimes={blockTimes} notifications={notifications} />
      <BlockTimeEditor blockTimes={blockTimes} onSave={onSaveBlockTime} onClear={onClearBlockTime} disabled={apiDown} />
      {PLAN.phases.map((phase) => (
        <div key={phase.phase}>
          <div className="phase-head">
            Phase {en(phase.phase)} · {phase.bn} (Day {en(phase.from)}–{en(phase.to)})
          </div>
          <p className="muted" style={{ marginTop: -6 }}>
            {en(phase.desc)}
          </p>
          {PLAN.days
            .filter((d) => d.phase === phase.phase)
            .map((d) => (
              <DayRow
                key={d.day}
                day={d}
                expanded={expanded === d.day}
                onToggle={() => setExpanded(expanded === d.day ? null : d.day)}
                progress={progress}
                onToggleTask={onToggleTask}
                disabled={apiDown}
                isToday={d.day === today}
                starting={starting}
                mockSources={PLAN.mock_sources}
                mockTiming={PLAN.mock_timing}
              />
            ))}
        </div>
      ))}
    </div>
  );
}
