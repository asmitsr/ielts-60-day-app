// Per-module practice mapping — from ielts-practice-links.md.
// Every practice instruction names its exact website + link; daily-updating
// sites (BBC, TED, aeon, News in Levels) carry daily: true.
// ref: 'resources' = the links live in the Resources section;
// ref: 'cuecards' = the in-app Makkar cue cards section.
export interface PracticeLink {
  name: string;
  url?: string;
  note?: string;
  daily?: boolean;
  ref?: 'resources' | 'cuecards';
}

export const PRACTICE_BY_MODULE: Record<string, PracticeLink[]> = {
  Listening: [
    { name: 'mini-ielts.com', url: 'https://mini-ielts.com', note: 'Timed Listening test (timer + question palette)' },
    { name: 'dailydictation.com', url: 'https://dailydictation.com', note: 'শুনে হুবহু লেখা (dictation), কান তৈরি' },
    { name: 'BBC News', url: 'https://www.bbc.com/news', note: 'প্রতিদিন শোনো (একটাই লিংক, রোজ আপডেট হয়)', daily: true },
    { name: 'TED Talks', url: 'https://www.ted.com', note: 'প্রতিদিন 1টা talk শোনো (একটাই লিংক, রোজ নতুন talk)', daily: true },
    { name: 'IELTS Prep Hub', url: 'https://ieltsprephub.org', note: 'Mock Listening test' },
    { name: 'IELTS Spelling', url: 'https://ieltsspelling.com', note: 'Listening-এর spelling (নাম/জায়গা/তারিখ)' },
  ],
  Reading: [
    { name: 'mini-ielts.com', url: 'https://mini-ielts.com', note: 'Timed Reading test' },
    { name: 'aeon.co', url: 'https://aeon.co', note: 'প্রতিদিন 2–3টা article পড়ো (একটাই লিংক, রোজ নতুন article)', daily: true },
    { name: 'News in Levels', url: 'https://www.newsinlevels.com', note: 'Level অনুযায়ী news পড়ো (একটাই লিংক, রোজ আপডেট)', daily: true },
    { name: 'Recent Questions', url: 'https://moktadirsielts.com/recent-questions/', note: 'আসল পরীক্ষায় আসা passage solve করো' },
    { name: 'IELTS Prep Hub', url: 'https://ieltsprephub.org', note: 'Mock Reading test' },
  ],
  Writing: [
    { name: 'Munzeerin Writing PDFs', ref: 'resources', note: 'Task 1 Structure / Graphs / Maps / Diagram + Task 2 Structure ও essay type-এর PDF (রিসোর্স অংশে লিংক আছে)' },
    { name: 'IELTS Prep Hub', url: 'https://ieltsprephub.org', note: 'Mock Writing test' },
    { name: 'Task 2 type অনুযায়ী practice', note: 'Dhaka ভিডিওর 40 প্রশ্নের তালিকা (Master PDF Part A-তে)' },
  ],
  Speaking: [
    { name: 'Makkar cue cards', ref: 'cuecards', note: 'অ্যাপের ভেতরেই 148টা card আছে' },
    { name: 'IELTS Prep Hub', url: 'https://ieltsprephub.org', note: 'Speaking-এ 720টি প্রশ্ন' },
    { name: 'TED Talks', url: 'https://www.ted.com', note: 'শুনে speaking শেখো' },
    { name: 'BBC News', url: 'https://www.bbc.com/news', note: 'শুনে speaking শেখো' },
    { name: 'Shadowing', ref: 'resources', note: 'YouTube-এর British accent ভিডিও (IELTS Liz / IELTS Advantage চ্যানেল — রিসোর্স অংশে লিংক আছে)' },
  ],
  Spelling: [
    { name: 'IELTS Spelling', url: 'https://ieltsspelling.com', note: 'THE spelling সাইট: Categorized Practice, Top Exam Words, A-Z Word Lists, Timed Challenge, My Custom Sets; Day Streak ও Daily Goal track করে' },
    { name: 'IELTS Prep Hub Spelling Practice', url: 'https://ieltsprephub.org', note: 'IELTS Spelling Practice সেকশন' },
  ],
  Vocabulary: [
    { name: 'aeon.co', url: 'https://aeon.co', note: 'passage থেকে প্রতিদিন 10–15টা নতুন শব্দ' },
    { name: 'News in Levels', url: 'https://www.newsinlevels.com', note: 'news থেকে শব্দ শেখো' },
    { name: 'Munzeerin Speaking 5 Advanced Words PDFs (x2)', ref: 'resources', note: 'রিসোর্স অংশে লিংক আছে' },
    { name: 'Anki', note: 'ভোকাব spaced repetition (অ্যাপ, Play Store থেকে নাও)' },
  ],
  Mock: [
    { name: 'IELTS Prep Hub', url: 'https://ieltsprephub.org' },
    { name: 'mini-ielts.com', url: 'https://mini-ielts.com' },
    { name: 'ieltsOnlineTests.com', url: 'https://ieltsOnlineTests.com' },
    { name: 'Road to IELTS', url: 'https://www.roadtoielts.com' },
    { name: 'Munzeerin Mock 1–15 PDFs', ref: 'resources', note: 'রিসোর্স অংশে লিংক আছে' },
  ],
};

export const SPELLING_DRILL =
  'প্রতিদিন নাম, জায়গা, তারিখের spelling drill করো — Listening-এ spelling ভুল মানেই নম্বর কাটা';

// Which practice links to show beside a task of a given module.
// Mock days show the mock sources in the mock panel instead.
export function practiceForModule(module: string | undefined): PracticeLink[] {
  switch (module) {
    case 'Listening':
    case 'Reading':
    case 'Writing':
    case 'Speaking':
    case 'Mock':
      return PRACTICE_BY_MODULE[module] ?? [];
    case 'Vocab + Grammar':
      return PRACTICE_BY_MODULE.Vocabulary;
    case 'Revision':
    case 'Analysis':
    case 'Weakness':
      return PRACTICE_BY_MODULE.Spelling;
    default:
      return [];
  }
}
