import { useState } from 'react';
import { PLAN, TOTAL_TASKS } from '../data/plan';
import { currentDayNumber, en, progressKey } from '../lib/format';
import { ProgressHero } from '../components/ProgressHero';
import { NowPanel } from '../components/NowPanel';
import { BlockTimeEditor } from '../components/BlockTimeEditor';
import { DayRow } from '../components/DayRow';

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
  apiDown,
}: {
  progress: Record<string, true>;
  blockTimes: Record<string, string>;
  onToggleTask: (day: number, taskIndex: number, done: boolean) => void;
  onSaveBlockTime: (module: string, startTime: string) => void;
  apiDown: boolean;
}) {
  const today = currentDayNumber();
  const [expanded, setExpanded] = useState<number | null>(today);
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
      <BlockTimeEditor blockTimes={blockTimes} onSave={onSaveBlockTime} disabled={apiDown} />
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
