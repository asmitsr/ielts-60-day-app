import { MODULES, MODULE_BN, MODULE_MINUTES } from '../data/plan';
import { en } from '../lib/format';

export function BlockTimeEditor({
  blockTimes,
  onSave,
  disabled,
}: {
  blockTimes: Record<string, string>;
  onSave: (module: string, startTime: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="card">
      <h3>প্রতিদিনের সময়</h3>
      <p className="muted">
        প্রতিটা block কখন শুরু করবে নিজে বেছে নাও। সময়ের দৈর্ঘ্য ঠিক করা আছে — শুধু শুরুর সময় তোমার।
      </p>
      {MODULES.map((m) => (
        <div className="block-row" key={m}>
          <span className="block-name">
            {MODULE_BN[m]} <span className="muted">· {en(MODULE_MINUTES[m])} মিনিট</span>
          </span>
          <input
            type="time"
            aria-label={`${MODULE_BN[m]} শুরুর সময়`}
            value={blockTimes[m] ?? ''}
            disabled={disabled}
            onChange={(e) => {
              if (e.target.value) onSave(m, e.target.value);
            }}
          />
        </div>
      ))}
    </div>
  );
}
