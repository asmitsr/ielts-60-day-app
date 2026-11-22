import { useEffect } from 'react';
import { MORE_SECTIONS, type SectionId } from '../lib/sections';
import { Icon } from '../lib/icons';

export function MoreSheet({
  open,
  active,
  onClose,
  onSelect,
  theme,
  onToggleTheme,
  email,
  onLogout,
}: {
  open: boolean;
  active: SectionId;
  onClose: () => void;
  onSelect: (s: SectionId) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  email: string;
  onLogout: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="sheet" role="dialog" aria-label="আরও">
        <div className="sheet-handle" />
        {MORE_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="sheet-row"
            onClick={() => onSelect(s.id)}
            aria-current={active === s.id ? 'page' : undefined}
          >
            <Icon name={s.icon} size={22} />
            <span>
              {s.label}
              <small>{s.blurb}</small>
            </span>
          </button>
        ))}
        <hr className="divider" />
        <button type="button" className="sheet-row" onClick={onToggleTheme}>
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={22} />
          <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
        </button>
        <button type="button" className="sheet-row" onClick={onLogout}>
          <Icon name="logout" size={22} />
          <span>
            লগআউট
            <small>{email}</small>
          </span>
        </button>
        <button type="button" className="sheet-row" onClick={onClose}>
          <Icon name="close" size={22} />
          <span>বন্ধ করো</span>
        </button>
      </div>
    </>
  );
}
