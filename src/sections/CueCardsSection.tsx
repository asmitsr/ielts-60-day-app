import { useMemo, useState } from 'react';
import { PLAN } from '../data/plan';
import { en } from '../lib/format';
import { Icon } from '../lib/icons';

export function CueCardsSection() {
  const [q, setQ] = useState('');
  const cards = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return PLAN.cue_cards;
    return PLAN.cue_cards.filter(
      (c) => c.title.toLowerCase().includes(needle) || String(c.n) === needle,
    );
  }, [q]);

  return (
    <div>
      <h2 className="section-title">কিউ কার্ড — Makkar Speaking (Sep–Dec 2026)</h2>
      <p className="muted">
        তোমার Makkar PDF থেকে {en(PLAN.cue_cards.length)}টি কার্ড। Part 2 প্র্যাকটিসের সময় এখান থেকে কার্ড নিও —
        প্রতিটা কার্ডে 1 মিনিট নোট + 2 মিনিট বলা।
      </p>
      <div className="search">
        <Icon name="search" size={18} />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="কার্ড খোঁজো — যেমন: book, river, person…"
          aria-label="কিউ কার্ড খোঁজো"
        />
      </div>
      <p className="muted">
        {en(cards.length)}টি কার্ড দেখাচ্ছে
      </p>
      <div className="cue-grid">
        {cards.map((c) => (
          <div className="cue-card" key={c.n}>
            <div className="cue-num">
              Card {en(c.n)} · পেজ {en(c.page)}
            </div>
            <div>{c.title}</div>
          </div>
        ))}
      </div>
      {cards.length === 0 && <p className="muted">কোনো কার্ড পাওয়া যায়নি। অন্য কিছু লিখে খোঁজো।</p>}
    </div>
  );
}
