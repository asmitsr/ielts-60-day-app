import { FORMAT_CHOICE, FORMAT_FACTS, FORMAT_MODULES } from '../data/formatGuide';
import { en } from '../lib/format';

export function FormatSection() {
  return (
    <div>
      <h2 className="section-title">পরীক্ষার ফরম্যাট</h2>
      <div className="card" style={{ borderColor: 'var(--accent)' }}>
        <p style={{ margin: 0 }}>
          <b>{FORMAT_CHOICE}</b>
        </p>
      </div>
      {FORMAT_MODULES.map((m) => (
        <div className="card" key={m.name}>
          <h3>
            {m.name} — {m.bn} · {en(m.time)}
          </h3>
          <p>{en(m.detail)}</p>
        </div>
      ))}
      <div className="card">
        <h3>জানার মতো তথ্য</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>
          {FORMAT_FACTS.map((f, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              {en(f)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
