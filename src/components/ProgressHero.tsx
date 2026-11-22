import { en } from '../lib/format';

export function ProgressHero({
  doneDays,
  totalDays,
  doneTasks,
  totalTasks,
}: {
  doneDays: number;
  totalDays: number;
  doneTasks: number;
  totalTasks: number;
}) {
  const pct = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="hero">
      <div className="hero-ring" aria-label={`${pct}% শেষ`}>
        <svg width="104" height="104" viewBox="0 0 104 104">
          <circle cx="52" cy="52" r={r} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="10" />
          <circle
            cx="52"
            cy="52"
            r={r}
            fill="none"
            stroke="#88c0d0"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (c * pct) / 100}
          />
        </svg>
        <span className="pct">{en(pct)}%</span>
      </div>
      <div>
        <h2>
          {en(doneDays)}/{en(totalDays)} দিন শেষ
        </h2>
        <p>
          {en(doneTasks)}/{en(totalTasks)} টাস্ক শেষ
        </p>
      </div>
    </div>
  );
}
