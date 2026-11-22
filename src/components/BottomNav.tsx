import { BOTTOM_SECTIONS, MORE_SECTIONS, type SectionId } from '../lib/sections';
import { Icon } from '../lib/icons';

export function BottomNav({
  section,
  onSelect,
  onMore,
}: {
  section: SectionId;
  onSelect: (s: SectionId) => void;
  onMore: () => void;
}) {
  const moreActive = MORE_SECTIONS.some((s) => s.id === section);
  return (
    <nav className="bottomnav" aria-label="প্রধান নেভিগেশন">
      {BOTTOM_SECTIONS.map((s) => (
        <button
          key={s.id}
          type="button"
          className={`nav-item${section === s.id ? ' active' : ''}`}
          onClick={() => onSelect(s.id)}
          aria-current={section === s.id ? 'page' : undefined}
        >
          <Icon name={s.icon} size={21} />
          {s.id === 'plan' ? 'প্ল্যান' : s.label}
        </button>
      ))}
      <button type="button" className={`nav-item${moreActive ? ' active' : ''}`} onClick={onMore} aria-haspopup="dialog">
        <Icon name="dots" size={21} />
        আরও
      </button>
    </nav>
  );
}
