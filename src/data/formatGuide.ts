// IELTS exam format guide — from the Pattern PDF + facts verified in-call
// (22 Nov 2026). Fee is APPROXIMATE — check British Council / IDP for exact.
export interface FormatModule {
  name: string;
  bn: string;
  time: string;
  detail: string;
}

export const FORMAT_MODULES: FormatModule[] = [
  {
    name: 'Listening',
    bn: 'লিসেনিং',
    time: '30 মিনিট',
    detail: '40 প্রশ্ন, 4টি section। Paper: উত্তর লেখার জন্য +10 মিনিট transfer time। Computer: শুনতে শুনতে টাইপ করো + 2 মিনিট check।',
  },
  {
    name: 'Reading',
    bn: 'রিডিং',
    time: '60 মিনিট',
    detail: '40 প্রশ্ন, 3টি passage।',
  },
  {
    name: 'Writing',
    bn: 'রাইটিং',
    time: '60 মিনিট',
    detail: 'Task 1: 150+ শব্দ, ~20 মিনিট। Task 2: 250+ শব্দ, ~40 মিনিট।',
  },
  {
    name: 'Speaking',
    bn: 'স্পিকিং',
    time: '11–14 মিনিট',
    detail: '3টি part, examiner-এর সাথে face-to-face (কখনো video call-এ)।',
  },
];

export const FORMAT_FACTS: string[] = [
  'মোট পরীক্ষা ~2 ঘণ্টা 45 মিনিট (4টি module)।',
  'স্কোর: প্রতিটা module Band 0–9; overall = চারটার গড়।',
  'Band 7 পেতে Listening আর Reading-এ ~30/40 সঠিক লাগে।',
  'Computer-based রেজাল্ট 1–5 দিনে (paper: 13 দিন)। Computer-এ পরীক্ষার তারিখ বেশি থাকে।',
  'Writing on Paper অপশন (1 Oct 2026 থেকে, IDP Bangladesh): Listening + Reading কম্পিউটারে, Writing-এর উত্তর কাগজে হাতে লিখে। ফি আর স্কোরিং computer-based-এর মতোই।',
  'বাংলাদেশে ফি আনুমানিক 25,000–28,000 টাকা — আনুমানিক হিসাব; সঠিক ফি British Council / IDP সাইটে দেখে নাও।',
  'পরীক্ষা কেন্দ্র: British Council Chattogram।',
];

export const FORMAT_CHOICE =
  'তোমার পছন্দ: computer-based পরীক্ষা, Writing কাগজে (হাতে লিখে)।';
