import { PLAN } from '../data/plan';
import { en } from '../lib/format';

const MODULES = ['Listening', 'Reading', 'Writing', 'Speaking'] as const;
const BN: Record<string, string> = {
  Listening: 'লিসেনিং',
  Reading: 'রিডিং',
  Writing: 'রাইটিং',
  Speaking: 'স্পিকিং',
};
const CHIP: Record<string, string> = {
  Listening: 'chip mod-listening',
  Reading: 'chip mod-reading',
  Writing: 'chip mod-writing',
  Speaking: 'chip mod-speaking',
};

export function TechniquesSection() {
  return (
    <div>
      <h2 className="section-title">টেকনিক — {en(PLAN.techniques.length)}টি</h2>
      {MODULES.map((m) => {
        const list = PLAN.techniques.filter((t) => t.module === m);
        if (list.length === 0) return null;
        return (
          <div className="card" key={m}>
            <h3>
              {m} — {BN[m]}
            </h3>
            {list.map((t) => (
              <div className="res-item" key={t.title}>
                <span className={CHIP[m]}>{m}</span> <b>{en(t.title)}</b>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
