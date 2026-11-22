// Typed view over plan.json (the 60-day plan data, copied verbatim from
// ielts-app-data/ielts-60day-data.json). The JSON also carries a numeric
// `reel` field on techniques — it is deliberately NOT in the Technique type
// and is never rendered: no 'reel' wording anywhere in the UI.
import raw from './plan.json';

export interface PlanTask {
  label: string;
  bn?: string;
  module?: string;
  minutes?: number;
}
export interface PlanDay {
  day: number;
  focus: string;
  bn_date: string;
  type: string;
  date: string;
  phase: number;
  tasks: PlanTask[];
  note?: string;
}
export interface CueCard {
  n: number;
  title: string;
  page: number;
}
export interface Technique {
  module: string;
  title: string;
}
export interface MockSource {
  name: string;
  url: string;
  note?: string;
}
export interface PlanData {
  title: string;
  target: string;
  day1: string;
  day60: string;
  daily_minutes: number;
  daily_structure: { module: string; bn: string; minutes: number }[];
  window: { wake: string; wake_latest: string; sleep: string; sleep_latest: string };
  full_mock_days: number[];
  phases: { phase: number; name: string; bn: string; from: number; to: number; desc: string }[];
  days: PlanDay[];
  techniques: Technique[];
  cue_cards: CueCard[];
  mock_schedule_note: string;
  mock_timing: { listening: number; reading: number; writing: number; speaking: number; note: string };
  mock_sources: MockSource[];
}

export const PLAN = raw as unknown as PlanData;
export const TOTAL_TASKS = PLAN.days.reduce((n, d) => n + d.tasks.length, 0);
export const FULL_MOCK_DAYS = new Set(PLAN.full_mock_days);
export const MODULES = ['Listening', 'Reading', 'Writing', 'Speaking'] as const;
export const MODULE_BN: Record<string, string> = {
  Listening: 'লিসেনিং',
  Reading: 'রিডিং',
  Writing: 'রাইটিং',
  Speaking: 'স্পিকিং',
};
export const MODULE_MINUTES: Record<string, number> = {
  Listening: 120,
  Reading: 120,
  Writing: 90,
  Speaking: 30,
};
