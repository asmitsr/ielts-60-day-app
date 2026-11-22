// AI assistant helpers (server-side only). Two jobs:
// 1. Encrypt/decrypt the user's own API key with AES-GCM — the plaintext
//    key is never stored, logged, or returned. Key = SHA-256(AI_KEY_SECRET).
// 2. Build a grounded context from the app's own data files only, so the
//    model answers from this app's information and nothing else.
// The Pages Functions bundler resolves the ../../src/data imports.
import { b64url, randomBytes } from './auth';
import { PLAN, MODULES, MODULE_BN, MODULE_MINUTES } from '../../src/data/plan';
import { STEP_GROUPS, COMMON_STEPS } from '../../src/data/steps';
import { FORMAT_MODULES, FORMAT_FACTS, FORMAT_CHOICE } from '../../src/data/formatGuide';
import { PRACTICE_BY_MODULE } from '../../src/data/practice';
import { RESOURCE_GROUPS } from '../../src/data/resources';
import { en, currentDayNumber } from '../../src/lib/format';

export interface AiConfigRow {
  provider: string;
  base_url: string;
  model: string;
  key_enc: string;
  iv: string;
}

// ---- Key encryption (AES-GCM, random 12-byte IV per row) ----

async function aesKey(secret: string): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

function b64urlDecode(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

export async function encryptApiKey(
  secret: string,
  plaintext: string,
): Promise<{ keyEnc: string; iv: string }> {
  const key = await aesKey(secret);
  const iv = randomBytes(12) as Uint8Array<ArrayBuffer>; // fresh ArrayBuffer-backed array
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  );
  return { keyEnc: b64url(new Uint8Array(ct)), iv: b64url(iv) };
}

export async function decryptApiKey(secret: string, keyEnc: string, iv: string): Promise<string> {
  const key = await aesKey(secret);
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64urlDecode(iv) },
    key,
    b64urlDecode(keyEnc),
  );
  return new TextDecoder().decode(pt);
}

// ---- Grounded context (app data only, keyword retrieval, no embeddings) ----

const CONTEXT_CAP = 6000;

export const AI_SYSTEM_PROMPT =
  'তুমি IELTS 60-Day অ্যাপের সহায়ক। তুমি শুধু নিচে দেওয়া অ্যাপের তথ্য (context) থেকে উত্তর দেবে — ' +
  'অ্যাপের বাইরের কোনো তথ্য, লিংক, তারিখ বা জ্ঞান ব্যবহার করবে না। প্রশ্নের উত্তর context-এ না থাকলে বাংলায় ' +
  'পরিষ্কার করে বলো যে এই তথ্য অ্যাপে নেই, আর আন্দাজে কিছু বলবে না। context-এ নেই এমন কোনো লিংক, তারিখ বা ' +
  'তথ্য বানাবে না। ব্যবহারকারী যে ভাষায় প্রশ্ন করবে, সেই ভাষায় উত্তর দাও (বাংলায় প্রশ্ন করলে বাংলায়, ' +
  'ইংরেজিতে করলে ইংরেজিতে)। সংখ্যায় ইংরেজি অঙ্ক (0-9) ব্যবহার করো।';

// Today in Asia/Dhaka (the server clock is UTC; the user studies in Dhaka).
function dhakaToday(): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return new Date(get('year'), get('month') - 1, get('day'));
}

function dayBlock(n: number): string {
  const day = PLAN.days.find((d) => d.day === n);
  if (!day) return `Day ${n} এই 60 দিনের প্ল্যানে নেই (Day 1–60)।`;
  const tasks = day.tasks
    .map((t) => `- ${t.label}${t.minutes ? ` (${t.minutes} মিনিট)` : ''}`)
    .join('\n');
  return [`Day ${n} — ${day.focus} (${day.bn_date})`, tasks, day.note ? `নোট: ${day.note}` : '']
    .filter(Boolean)
    .join('\n');
}

function moduleBlock(m: string): string {
  const steps = STEP_GROUPS.find((g) => g.module === m);
  const techniques = PLAN.techniques.filter((t) => t.module === m).map((t) => t.title);
  const links = (PRACTICE_BY_MODULE[m] ?? []).map(
    (l) => `- ${l.name}${l.url ? ` (${l.url})` : ''}${l.note ? ` — ${l.note}` : ''}`,
  );
  return [
    `${m} (${MODULE_BN[m]}, প্রতিদিন ${MODULE_MINUTES[m]} মিনিট)`,
    steps ? `ধাপ:\n${steps.steps.map((s) => `- ${s}`).join('\n')}` : '',
    techniques.length ? `টেকনিক: ${techniques.join('; ')}` : '',
    links.length ? `প্র্যাকটিস লিংক:\n${links.join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

const STOP = new Set([
  'what', 'when', 'which', 'about', 'tell', 'give', 'list', 'show', 'card', 'cards', 'cue',
  'the', 'and', 'for', 'how', 'কিউ', 'কার্ড', 'কী', 'কোন', 'আমাকে', 'দাও', 'বলো', 'দেখাও', 'একটা',
]);

function cueCardBlock(question: string): string {
  const words = question
    .toLowerCase()
    .split(/[^a-z\u0980-\u09ff0-9]+/u)
    .filter((w) => w.length >= 3 && !STOP.has(w));
  const scored = PLAN.cue_cards
    .map((c) => ({ c, score: words.filter((w) => c.title.toLowerCase().includes(w)).length }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => s.c);
  const picks = scored.length ? scored : PLAN.cue_cards.slice(0, 5);
  return [
    `Cue card: মোট ${PLAN.cue_cards.length}টি Makkar cue card আছে (Sep–Dec 2026)।`,
    picks.map((c) => `- #${c.n}: ${c.title} (Makkar পৃষ্ঠা ${c.page})`).join('\n'),
  ].join('\n');
}

function mockBlock(): string {
  const timing = PLAN.mock_timing;
  return [
    `সাপ্তাহিক full mock: প্রতি রবিবার — Day ${PLAN.full_mock_days.join(', ')}।`,
    `Mock-এর সময়: Listening ${timing.listening} + Reading ${timing.reading} + Writing ${timing.writing} + Speaking ${timing.speaking} মিনিট। ${timing.note}`,
    PLAN.mock_schedule_note,
    `Mock সোর্স:\n${PLAN.mock_sources.map((s) => `- ${s.name} (${s.url})${s.note ? ` — ${s.note}` : ''}`).join('\n')}`,
  ].join('\n');
}

function formatBlock(): string {
  return [
    'পরীক্ষার ফরম্যাট:',
    FORMAT_MODULES.map((m) => `- ${m.name} (${m.bn}): ${m.time} — ${m.detail}`).join('\n'),
    FORMAT_FACTS.map((f) => `- ${f}`).join('\n'),
    FORMAT_CHOICE,
  ].join('\n');
}

function overviewBlock(): string {
  const today = currentDayNumber(dhakaToday());
  const structure = PLAN.daily_structure.map((s) => `${s.module} ${s.minutes} মিনিট`).join(' + ');
  const phases = PLAN.phases
    .map((p) => `- Phase ${p.phase} ${p.bn} (Day ${p.from}–${p.to}): ${p.desc}`)
    .join('\n');
  return [
    `প্ল্যান: ${PLAN.title} — লক্ষ্য ${PLAN.target}, Day 1 ${PLAN.day1} থেকে Day 60 ${PLAN.day60}, প্রতিদিন ${PLAN.daily_minutes} মিনিট (${structure})। মোট ${PLAN.days.length} দিন, ${PLAN.techniques.length}টি টেকনিক, ${PLAN.cue_cards.length}টি cue card, ${RESOURCE_GROUPS.length}টি রিসোর্স গ্রুপ।`,
    `Phase:\n${phases}`,
    `আজকের দিন:\n${dayBlock(today)}`,
    `সাধারণ ধাপ:\n${COMMON_STEPS.map((s) => `- ${s}`).join('\n')}`,
  ].join('\n');
}

export function buildAiContext(question: string): string {
  const q = en(question).toLowerCase();
  const sections: string[] = [
    `অ্যাপের তথ্য (IELTS 60-Day — লক্ষ্য ${PLAN.target}, Day 1 ${PLAN.day1} – Day 60 ${PLAN.day60})।`,
  ];
  let matched = false;

  const dayMatch = /(?:day|ডে)\s*(\d{1,2})/.exec(q);
  if (dayMatch) {
    const n = Number(dayMatch[1]);
    if (n >= 1 && n <= 60) {
      sections.push(dayBlock(n));
      matched = true;
    }
  }
  for (const m of MODULES) {
    if (q.includes(m.toLowerCase()) || q.includes(MODULE_BN[m])) {
      sections.push(moduleBlock(m));
      matched = true;
    }
  }
  if (/cue\s*card/.test(q) || q.includes('কিউ কার্ড')) {
    sections.push(cueCardBlock(question));
    matched = true;
  }
  if (q.includes('mock') || q.includes('মক')) {
    sections.push(mockBlock());
    matched = true;
  }
  if (/format|band|fee/.test(q) || q.includes('ফরম্যাট') || q.includes('ব্যান্ড') || q.includes('ফি')) {
    sections.push(formatBlock());
    matched = true;
  }
  if (!matched) sections.push(overviewBlock());

  const joined = en(sections.join('\n\n'));
  if (joined.length <= CONTEXT_CAP) return joined;
  const cut = joined.lastIndexOf('\n', CONTEXT_CAP);
  return joined.slice(0, cut > 1000 ? cut : CONTEXT_CAP) + '\n…';
}
