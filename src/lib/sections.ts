import type { IconName } from './icons';

export type SectionId =
  | 'plan'
  | 'steps'
  | 'practice'
  | 'resources'
  | 'format'
  | 'cuecards'
  | 'techniques'
  | 'settings'
  | 'info';

export interface SectionMeta {
  id: SectionId;
  label: string;
  icon: IconName;
  blurb: string;
}

export const SECTIONS: SectionMeta[] = [
  { id: 'plan', label: '60 দিনের প্ল্যান', icon: 'calendar', blurb: 'Day 1–60, টিক-অফ, মক টেস্ট' },
  { id: 'steps', label: 'ধাপ গাইড', icon: 'steps', blurb: 'প্রতিটা section-এ ভালো করার ধাপ' },
  { id: 'practice', label: 'প্র্যাকটিস', icon: 'play', blurb: 'কোথা থেকে প্র্যাকটিস করবে' },
  { id: 'resources', label: 'রিসোর্স', icon: 'book', blurb: '101টি লিংক, PDF, অ্যাপ' },
  { id: 'format', label: 'পরীক্ষার ফরম্যাট', icon: 'doc', blurb: '4 module, সময়, স্কোরিং' },
  { id: 'cuecards', label: 'কিউ কার্ড', icon: 'chat', blurb: '148টি Makkar cue card' },
  { id: 'techniques', label: 'টেকনিক', icon: 'bulb', blurb: '12টি টেকনিক, module অনুযায়ী' },
  { id: 'settings', label: 'সেটিংস', icon: 'gear', blurb: 'প্রোফাইল, নিরাপত্তা, নোটিফিকেশন' },
  { id: 'info', label: 'তথ্য ও আইনি', icon: 'info', blurb: 'Privacy, Terms, FAQ, সোর্স' },
];

// Bottom bar shows the first four; the rest live in the "আরও" sheet.
export const BOTTOM_SECTIONS = SECTIONS.slice(0, 4);
export const MORE_SECTIONS = SECTIONS.slice(4);

export function sectionMeta(id: SectionId): SectionMeta {
  return SECTIONS.find((s) => s.id === id) ?? SECTIONS[0];
}
