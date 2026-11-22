import { useEffect, useRef, useState } from 'react';
import { MODULES, MODULE_BN, MODULE_MINUTES } from '../data/plan';
import { en } from '../lib/format';

type Meridiem = 'AM' | 'PM';

// "06:06" -> { hour: 6, minute: 6, meridiem: 'AM' }
function parse24(hhmm: string): { hour: number; minute: number; meridiem: Meridiem } {
  const [h, m] = hhmm.split(':').map(Number);
  return { hour: h % 12 || 12, minute: m, meridiem: h >= 12 ? 'PM' : 'AM' };
}

// 12-hour parts -> "HH:MM" 24-hour. 12 AM = 00, 12 PM = 12, other PM +12.
function to24(hour: number, minute: number, meridiem: Meridiem): string {
  const h24 = meridiem === 'AM' ? hour % 12 : (hour % 12) + 12;
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function format12(hhmm: string): string {
  const { hour, minute, meridiem } = parse24(hhmm);
  return en(`${hour}:${String(minute).padStart(2, '0')} ${meridiem}`);
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const MERIDIEMS: Meridiem[] = ['AM', 'PM'];

export function BlockTimeEditor({
  blockTimes,
  onSave,
  onClear,
  disabled,
}: {
  blockTimes: Record<string, string>;
  onSave: (module: string, startTime: string) => void;
  onClear: (module: string) => void;
  disabled: boolean;
}) {
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [hour, setHour] = useState(6);
  const [minute, setMinute] = useState(0);
  const [meridiem, setMeridiem] = useState<Meridiem>('AM');
  const sheetRef = useRef<HTMLDivElement>(null);

  // Escape closes the sheet; on open, scroll the selected option into view.
  useEffect(() => {
    if (!openModule) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenModule(null);
    };
    window.addEventListener('keydown', onKey);
    sheetRef.current
      ?.querySelectorAll('.tp-opt.selected')
      .forEach((el) => el.scrollIntoView({ block: 'nearest' }));
    return () => window.removeEventListener('keydown', onKey);
  }, [openModule]);

  function openPicker(module: string) {
    const current = blockTimes[module];
    if (current) {
      const p = parse24(current);
      setHour(p.hour);
      setMinute(p.minute);
      setMeridiem(p.meridiem);
    } else {
      setHour(6);
      setMinute(0);
      setMeridiem('AM');
    }
    setOpenModule(module);
  }

  function save() {
    if (!openModule) return;
    onSave(openModule, to24(hour, minute, meridiem));
    setOpenModule(null);
  }

  function clear() {
    if (!openModule) return;
    onClear(openModule);
    setOpenModule(null);
  }

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
          {blockTimes[m] && (
            <button
              type="button"
              className="block-clear-btn"
              aria-label={`${MODULE_BN[m]} সময় ক্লিয়ার করো`}
              disabled={disabled}
              onClick={() => onClear(m)}
            >
              ✕
            </button>
          )}
          <button
            type="button"
            className="block-time-btn"
            aria-label={`${MODULE_BN[m]} শুরুর সময় ${blockTimes[m] ? 'বদলাও' : 'সেট করো'}`}
            disabled={disabled}
            onClick={() => openPicker(m)}
          >
            {blockTimes[m] ? format12(blockTimes[m]) : 'সেট করো'}
          </button>
        </div>
      ))}
      {openModule && (
        <>
          <div className="sheet-backdrop" onClick={() => setOpenModule(null)} aria-hidden="true" />
          <div
            className="sheet"
            role="dialog"
            aria-label={`${MODULE_BN[openModule]} শুরুর সময়`}
            ref={sheetRef}
          >
            <div className="sheet-handle" />
            <h3 className="tp-title">{MODULE_BN[openModule]} — শুরুর সময়</h3>
            <p className="tp-preview" aria-live="polite">
              {en(`${hour}:${String(minute).padStart(2, '0')} ${meridiem}`)}
            </p>
            <div className="tp-cols">
              <div>
                <div className="tp-col-label">ঘণ্টা</div>
                <div className="tp-col" role="listbox" aria-label="ঘণ্টা">
                  {HOURS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      role="option"
                      aria-selected={hour === h}
                      className={`tp-opt${hour === h ? ' selected' : ''}`}
                      onClick={() => setHour(h)}
                    >
                      {en(h)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="tp-col-label">মিনিট</div>
                <div className="tp-col" role="listbox" aria-label="মিনিট">
                  {MINUTES.map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="option"
                      aria-selected={minute === n}
                      className={`tp-opt${minute === n ? ' selected' : ''}`}
                      onClick={() => setMinute(n)}
                    >
                      {en(String(n).padStart(2, '0'))}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="tp-col-label">AM / PM</div>
                <div className="tp-col" role="listbox" aria-label="AM / PM">
                  {MERIDIEMS.map((ap) => (
                    <button
                      key={ap}
                      type="button"
                      role="option"
                      aria-selected={meridiem === ap}
                      className={`tp-opt${meridiem === ap ? ' selected' : ''}`}
                      onClick={() => setMeridiem(ap)}
                    >
                      {ap}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="tp-actions">
              <button type="button" className="btn btn-primary" onClick={save}>
                সেভ করো
              </button>
              {blockTimes[openModule] && (
                <button type="button" className="btn btn-danger" onClick={clear}>
                  ক্লিয়ার করো
                </button>
              )}
              <button type="button" className="btn" onClick={() => setOpenModule(null)}>
                বন্ধ করো
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
