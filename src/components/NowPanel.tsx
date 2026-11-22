import { useEffect, useState } from 'react';
import { MODULES, MODULE_BN, MODULE_MINUTES } from '../data/plan';
import { en } from '../lib/format';

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function fmtClock(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
function fmtHM(mins: number): string {
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}

export function NowPanel({ blockTimes }: { blockTimes: Record<string, string> }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const nowMins = now.getHours() * 60 + now.getMinutes();
  const windows = MODULES.filter((m) => blockTimes[m]).map((m) => ({
    module: m,
    start: toMinutes(blockTimes[m]),
    end: toMinutes(blockTimes[m]) + MODULE_MINUTES[m],
  }));
  const current = windows.find((w) => nowMins >= w.start && nowMins < w.end);
  const next = windows
    .filter((w) => w.start > nowMins)
    .sort((a, b) => a.start - b.start)[0];

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <h3 style={{ margin: 0 }}>এখন কী পড়ার সময়</h3>
        <span className="now-clock">{en(fmtClock(now))}</span>
      </div>
      {windows.length === 0 ? (
        <p className="muted" style={{ marginTop: 8 }}>
          তুমি এখনো কোনো block-এর শুরুর সময় সেট করোনি। নিচের <b>প্রতিদিনের সময়</b> অংশে প্রতিটা block কখন শুরু
          করবে নিজে বেছে নাও — এই প্যানেল তখন তোমার সময় অনুযায়ী চলবে।
        </p>
      ) : current ? (
        <p style={{ marginTop: 8 }}>
          এখন <b>{MODULE_BN[current.module]}</b> পড়ার সময় — {en(fmtHM(current.start))}–{en(fmtHM(current.end))}।
          আর <b>{en(current.end - nowMins)} মিনিট</b> বাকি।
        </p>
      ) : next ? (
        <p style={{ marginTop: 8 }}>
          পরের block: <b>{MODULE_BN[next.module]}</b> — {en(fmtHM(next.start))} থেকে। আর{' '}
          <b>{en(next.start - nowMins)} মিনিট</b> পরে শুরু।
        </p>
      ) : (
        <p style={{ marginTop: 8 }}>আজকের সব block শেষ। ভালো কাজ হয়েছে — কাল আবার দেখা হবে।</p>
      )}
    </div>
  );
}
