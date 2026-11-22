import { PRACTICE_BY_MODULE, SPELLING_DRILL } from '../data/practice';
import type { SectionId } from '../lib/sections';
import { Icon } from '../lib/icons';

const ORDER = ['Listening', 'Reading', 'Writing', 'Speaking', 'Spelling', 'Vocabulary', 'Mock'] as const;
const BN: Record<string, string> = {
  Listening: 'লিসেনিং',
  Reading: 'রিডিং',
  Writing: 'রাইটিং',
  Speaking: 'স্পিকিং',
  Spelling: 'স্পেলিং',
  Vocabulary: 'ভোকাবুলারি',
  Mock: 'মক টেস্ট',
};

export function PracticeSection({ onNavigate }: { onNavigate: (s: SectionId) => void }) {
  return (
    <div>
      <h2 className="section-title">প্র্যাকটিস — কোথা থেকে প্র্যাকটিস করবে</h2>
      <div className="card">
        <h3>IELTS Pathway — তোমার আগের ওয়েবসাইট</h3>
        <p>
          ফ্রি IELTS প্র্যাকটিস সাইট — অরিজিনাল লেসন, কুইজ, ফ্ল্যাশকার্ড, YouTube রিসোর্স পেজ। বাংলা + English,
          dark/light theme।
        </p>
        <a
          className="link-chip"
          href="https://ielts-pathway-fccu.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          ielts-pathway-fccu.vercel.app <Icon name="external" size={13} />
        </a>
        <p className="muted" style={{ marginTop: 8 }}>
          নোট: Pathway-র planner পুরনো তারিখ ব্যবহার করে — এটা প্র্যাকটিসের জন্য, প্ল্যানের জন্য নয়।
        </p>
      </div>
      {ORDER.map((mod) => (
        <div className="card" key={mod}>
          <h3>
            {mod} — {BN[mod]}
          </h3>
          {PRACTICE_BY_MODULE[mod].map((l) => (
            <div className="res-item" key={l.name}>
              {l.url ? (
                <a href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.name} <Icon name="external" size={13} />
                </a>
              ) : l.ref ? (
                <button
                  type="button"
                  onClick={() => onNavigate(l.ref === 'resources' ? 'resources' : 'cuecards')}
                  style={{ fontWeight: 600, color: 'var(--accent)', textAlign: 'left' }}
                >
                  {l.name} →
                </button>
              ) : (
                <b>{l.name}</b>
              )}
              {l.note && (
                <div className="note">
                  {l.note}
                  {l.daily ? ' · রোজ আপডেট হয়' : ''}
                </div>
              )}
            </div>
          ))}
          {mod === 'Spelling' && <p className="muted" style={{ marginTop: 10 }}>{SPELLING_DRILL}</p>}
        </div>
      ))}
    </div>
  );
}
