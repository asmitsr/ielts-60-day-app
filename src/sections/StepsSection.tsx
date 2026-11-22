import { COMMON_STEPS, STEP_GROUPS } from '../data/steps';
import { en } from '../lib/format';

export function StepsSection() {
  return (
    <div>
      <h2 className="section-title">ধাপ গাইড — প্রতিটা Section-এ ভালো করার ধাপ</h2>
      {STEP_GROUPS.map((g) => (
        <div className="card" key={g.module}>
          <h3>
            {g.module} — {g.bn}
          </h3>
          <ol className="step-list">
            {g.steps.map((s, i) => (
              <li key={i}>{en(s)}</li>
            ))}
          </ol>
        </div>
      ))}
      <div className="card">
        <h3>সব Section-এ common</h3>
        <ol className="step-list">
          {COMMON_STEPS.map((s, i) => (
            <li key={i}>{en(s)}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
