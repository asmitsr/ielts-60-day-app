import type { MockSource } from '../data/plan';
import { en } from '../lib/format';
import { Icon } from '../lib/icons';

export function MockDayPanel({
  mockSources,
  mockTiming,
}: {
  mockSources: MockSource[];
  mockTiming: { listening: number; reading: number; writing: number; speaking: number; note: string };
}) {
  const total = mockTiming.listening + mockTiming.reading + mockTiming.writing + mockTiming.speaking;
  return (
    <div className="mock-panel">
      <div className="mock-banner">আজ ফুল মক টেস্ট — পরীক্ষার আসল সময়</div>
      <p>{en(mockTiming.note)}</p>
      <div className="mock-timing">
        <span className="chip danger">Listening {en(mockTiming.listening)} মিনিট</span>
        <span className="chip danger">Reading {en(mockTiming.reading)} মিনিট</span>
        <span className="chip danger">Writing {en(mockTiming.writing)} মিনিট</span>
        <span className="chip danger">Speaking {en(mockTiming.speaking)} মিনিট</span>
      </div>
      <p>
        মোট ~{en(total)} মিনিট + অ্যানালাইসিস। আজ 6 ঘণ্টার সাধারণ ব্লক নয়।
      </p>
      <div>
        {mockSources.map((s) => (
          <a key={s.url} className="link-chip" href={s.url} target="_blank" rel="noopener noreferrer">
            {s.name} <Icon name="external" size={13} />
          </a>
        ))}
      </div>
    </div>
  );
}
