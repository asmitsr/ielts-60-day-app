// Bengali digits ০-৯ → English 0-9. Applied to every rendered string that
// may carry Bengali digits (dates, focuses, notes) so the UI shows English
// numerals (0–9) everywhere.
const BN = '০১২৩৪৫৬৭৮৯';
export function en(value: string | number): string {
  return String(value).replace(/[০-৯]/g, (d) => String(BN.indexOf(d)));
}

// Day 1 = Monday 23 Nov 2026 (local time).
const DAY1 = new Date(2026, 10, 23);

export function currentDayNumber(now = new Date()): number {
  const start = new Date(DAY1.getFullYear(), DAY1.getMonth(), DAY1.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((today.getTime() - start.getTime()) / 86400000) + 1;
  return Math.min(60, Math.max(1, diff));
}

export function progressKey(day: number, taskIndex: number): string {
  return `${day}:${taskIndex}`;
}

export function minutesLabel(minutes?: number): string {
  return minutes === undefined ? '' : `${minutes} মিনিট`;
}
