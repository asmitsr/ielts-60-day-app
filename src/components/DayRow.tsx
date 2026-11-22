import type { MockSource, PlanDay } from '../data/plan';
import { FULL_MOCK_DAYS } from '../data/plan';
import { practiceForModule } from '../data/practice';
import { en, minutesLabel, progressKey } from '../lib/format';
import { Icon } from '../lib/icons';
import { MockDayPanel } from './MockDayPanel';

const TYPE_BN: Record<string, string> = {
  Foundation: 'ফাউন্ডেশন',
  Module: 'মডিউল',
  MOCK: 'মক টেস্ট',
  'Review / Rest': 'রিভিউ / রেস্ট',
  Analysis: 'অ্যানালাইসিস',
  'Exam Eve': 'পরীক্ষার আগের দিন',
};

function moduleChipClass(module: string | undefined): string {
  switch (module) {
    case 'Listening':
      return 'chip mod-listening';
    case 'Reading':
      return 'chip mod-reading';
    case 'Writing':
      return 'chip mod-writing';
    case 'Speaking':
      return 'chip mod-speaking';
    default:
      return 'chip';
  }
}

export function DayRow({
  day,
  expanded,
  onToggle,
  progress,
  onToggleTask,
  disabled,
  isToday,
  starting,
  mockSources,
  mockTiming,
}: {
  day: PlanDay;
  expanded: boolean;
  onToggle: () => void;
  progress: Record<string, true>;
  onToggleTask: (day: number, taskIndex: number, done: boolean) => void;
  disabled: boolean;
  isToday: boolean;
  starting: boolean;
  mockSources: MockSource[];
  mockTiming: { listening: number; reading: number; writing: number; speaking: number; note: string };
}) {
  const isFullMock = FULL_MOCK_DAYS.has(day.day);
  const doneCount = day.tasks.filter((_, i) => progress[progressKey(day.day, i)]).length;
  const allDone = doneCount === day.tasks.length;
  const status = allDone ? 'শেষ ✓' : isToday ? 'চলছে' : 'বাকি';
  return (
    <article className={`day${isToday ? ' today' : ''}`}>
      <button
        type="button"
        className="day-head"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={`Day ${day.day}: ${day.focus}`}
      >
        <span className="day-head-top">
          <span>
            {starting && day.day === 1 ? 'শুরু হচ্ছে · ' : ''}Day {en(day.day)} · {en(day.bn_date)} ·{' '}
            {TYPE_BN[day.type] ?? day.type}
          </span>
          <span className={`chip${allDone || isToday ? ' accent' : ''}`}>{status}</span>
          <span className={`chev${expanded ? ' open' : ''}`}>
            <Icon name="chevron" size={18} />
          </span>
        </span>
        <h3>{en(day.focus)}</h3>
        <span className="muted">
          {en(doneCount)}/{en(day.tasks.length)} টাস্ক শেষ · {TYPE_BN[day.type] ?? day.type}
        </span>
        <div className="progress-bar">
          <div style={{ width: `${(doneCount / day.tasks.length) * 100}%` }} />
        </div>
      </button>
      {expanded && (
        <div className="day-tasks">
          {isFullMock && <MockDayPanel mockSources={mockSources} mockTiming={mockTiming} />}
          {day.tasks.map((task, i) => {
            const done = !!progress[progressKey(day.day, i)];
            const links = isFullMock ? [] : practiceForModule(task.module);
            return (
              <div className="task" key={i}>
                <button
                  type="button"
                  className={`task-check${done ? ' done' : ''}`}
                  aria-label={`${task.label} ${done ? 'শেষ' : 'বাকি'}`}
                  aria-pressed={done}
                  disabled={disabled}
                  onClick={() => onToggleTask(day.day, i, !done)}
                >
                  {done && <Icon name="check" size={16} />}
                </button>
                <div className="task-body">
                  <div className={`task-label${done ? ' done' : ''}`}>{en(task.bn ?? task.label)}</div>
                  <div className="task-meta">
                    {task.module && <span className={moduleChipClass(task.module)}>{task.module}</span>}
                    {task.minutes !== undefined && <span>{en(minutesLabel(task.minutes))}</span>}
                  </div>
                  {links.length > 0 && (
                    <div className="practice-links">
                      <div className="practice-label">প্র্যাকটিস করো এখানে:</div>
                      {links.map((l) =>
                        l.url ? (
                          <a key={l.name} className="link-chip" href={l.url} target="_blank" rel="noopener noreferrer">
                            {l.name}
                            {l.daily ? ' · রোজ আপডেট হয়' : ''} <Icon name="external" size={13} />
                          </a>
                        ) : (
                          <span key={l.name} className="link-chip" style={{ color: 'var(--muted)' }}>
                            {l.name}
                            {l.note ? ` — ${l.note}` : ''}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {day.type === 'MOCK' && !isFullMock && (
            <div className="practice-links">
              <div className="practice-label">মক প্র্যাকটিস:</div>
              {mockSources.map((s) => (
                <a key={s.url} className="link-chip" href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.name} <Icon name="external" size={13} />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
      {day.note && <div className="day-note">{en(day.note)}</div>}
    </article>
  );
}
