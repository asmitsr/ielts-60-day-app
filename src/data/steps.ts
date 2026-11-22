// Point-form step guides per section — from ielts-section-steps.md (verbatim).
// [Dhaka] = Dhaka English Lab video, [Pathway] = IELTS Pathway site.
export interface StepGroup {
  module: string;
  bn: string;
  steps: string[];
}

export const STEP_GROUPS: StepGroup[] = [
  {
    module: 'Listening',
    bn: 'লিসেনিং',
    steps: [
      'Word limit আগে পড়ো, উত্তর লেখার পর গুনে দেখো — limit-এর বেশি লিখলেই উত্তর বাতিল।',
      'MCQ "Choose TWO letters"-এ audio-তে ওঠা সব option টিক দিও না — প্রশ্নের verb (explain / make a point) দেখে বাছো।',
      'Section 3 (আলোচনা/MCQ): option আগে পড়ে রাখো, বাদ পড়া option চেনো। Section 4 (lecture, gap fill): script ধরে paraphrase মেলাও — audio যা বলে, উত্তর প্রায়ই তার synonym-এ বদলে যায়।',
      'Spelling আলাদা করে drill করো — ieltsspelling.com (Category, Top Exam Words, Timed Challenge) আর ieltsprephub.org-এর Spelling Practice। নাম, জায়গা, তারিখের spelling ভুল মানেই নম্বর কাটা।',
      'প্রতিদিন 20–30 মিনিট ইংরেজি শোনো — BBC, TED Talks, documentary, English podcast। কান তৈরি না হলে strategy কাজে লাগবে না। [Dhaka]',
      'Dictation করো — dailydictation.com-এ শুনে হুবহু লেখো। [Dhaka]',
      'Timed practice করো mini-ielts.com-এ; একটানা block-এ timer চালিয়ে পড়ো, মাঝখানে ফোন নয়।',
      'একদিনে সব নয় — প্রতিদিন নির্দিষ্ট 1টা tip ধরে 1 ঘণ্টা practice (Listening Tips Day 1–5 ধারাবাহিক)। [Featured post]',
    ],
  },
  {
    module: 'Reading',
    bn: 'রিডিং',
    steps: [
      'Key-Word Method: প্রতিটি প্রশ্নের key word বেছে নাও, passage-এ সেই word বা তার synonym খোঁজো, তারপর সিদ্ধান্ত নাও।',
      'T/F/NG বিচার: TRUE = passage-এর সাথে মেলে; FALSE = passage উল্টো কথা বলে; NOT GIVEN = passage-এ ওই তথ্যই নেই।',
      'Y/N/NG বনাম T/F/NG গুলিও না: T/F/NG = তথ্য (fact) মেলে কিনা; Y/N/NG = লেখকের মতামত/দাবির সাথে মেলে কিনা। [Day 37]',
      'Matching Headings: প্রতিটি paragraph-এর main idea-র সাথে heading মেলাও — প্রথম ও শেষ লাইন সবচেয়ে বেশি সাহায্য করে।',
      'Paragraph Matching ("Which paragraph contains...?"): পুরো passage পড়া লাগে না, প্রতিটি paragraph-এর topic sentence ধরে scan করো।',
      'Summary completion-এ word limit সবসময় গুনে দেখো (ONE WORD / TWO WORDS)।',
      'প্রতিদিন 2–3টা English article পড়ো — aeon.co আর News in Levels থেকে; প্রতিটা paragraph-এর main idea বের করার চেষ্টা করো। [Dhaka]',
      'আসল পরীক্ষায় আসা passage solve করো — moktadirsielts.com/recent-questions/ (The History of Tea, Conformity, Surviving City Life...)।',
      'Timed practice না করলে main exam-এ সময় ফুরিয়ে যাবে — mini-ielts.com-এ timer-সহ set করো।',
    ],
  },
  {
    module: 'Writing',
    bn: 'রাইটিং',
    steps: [
      "Task 1 Introduction = মাত্র 1 বাক্য, 2টা Master Formula: (A) The [chart type] + [illustrates/compares] + [the number/proportion/amount of] + [subject] + [location] + [time period]; (B) The [chart type] + [provides information about / highlights] + how [subject] + [verb] + [location] + [time period]। প্রশ্ন হুবহু copy করা যাবে না — paraphrase করো; 'below'/'above' লিখো না।",
      'Bar Chart comparison sentence শেখো: প্রায় সমান → "roughly/almost the same as"; সামান্য বেশি → "slightly higher than ... at X compared with Y"।',
      'পরিমাণ অনুযায়ী শব্দ বাছাই করো: একটু বেশি = slightly/marginally higher than; অনেক বেশি = considerably/significantly higher than; সবচেয়ে বেশি = the highest figure/proportion; সবচেয়ে কম = the lowest figure।',
      'Map vocabulary: নতুন তৈরি = built/constructed/added; সরিয়ে ফেলা = removed/demolished/replaced; স্থান বদল = relocated/moved; বড় করা = expanded/extended।',
      'Task 2 Two-part প্রশ্নে দুটি অংশেরই সমান উত্তর দিতে হয় — একটা বাদ দিলে নম্বর কাটা।',
      '5-Step System: চারটি marking criteria-র (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy) মধ্যে কোনটা দুর্বল তা বের করো, তারপর সেই একটাই ঠিক করো — সবকিছুতে ছড়িয়ে পড়ো না।',
      'সময় মেনে লেখো: Task 1 = 20 মিনিটে 150+ শব্দ; Task 2 = 40 মিনিটে 250+ শব্দ।',
      'Task 2 type অনুযায়ী practice করো: Agree/Disagree, Both views, Double questions, Positive/Negative development, Advantage/Disadvantage। [Dhaka]',
    ],
  },
  {
    module: 'Speaking',
    bn: 'স্পিকিং',
    steps: [
      'Part 1: 15টা topic, প্রতিদিন 1টা (Hometown, Home, Work/Study, Daily routine, Hobbies, Free time, Friends, Family, Food, Music, Sports, Weather, Reading, Shopping, Technology)। প্রতিটিতে 10টা C1-level vocabulary + 10টা প্রশ্ন, নিজে উত্তর দিয়ে polish করো। উত্তর মুখস্থ করো না — শব্দ আর ধরনটা শেখো।',
      'Part 3: A.R.E.A Method — Answer (সরাসরি উত্তর) → Reason (কেন) → Example (উদাহরণ) → Alternative (বিকল্প দিক)। এই চার ধাপে উত্তর 4–5 লাইনের হয়, থামতে হয় না। [Day 13]',
      'Cue Card: 1 মিনিট preparation-এ card-এর bullet point-গুলোই তোমার কাঠামো। Note সাজাও 4 শব্দে: explain / benefits / use / result।',
      'Cue card আগে থেকে ঠিক করে রাখো: Person/Place/Object/Emotion/Activity — 5 ভাগে ভাগ করে প্রতিটা প্রশ্নে কাকে/কী বর্ণনা করবে তা pre-decide করো। [Dhaka]',
      'Shadowing: British accent ভিডিওর সাথে সাথে হুবহু repeat করো, প্রতিদিন 5–10 মিনিট — উচ্চারণ ও rhythm দুটোই তৈরি হয়।',
      'Describe the Image: overview বাক্য → foreground-এর বিবরণ → আশপাশের বিবরণ। ভিডিও pause করে আগে নিজে বর্ণনা করো, তারপর model answer শোনো।',
      'Speaking ভালো করতে শুনতে হবে: প্রতিদিন TED Talks, BBC, podcast শোনো — শোনা ছাড়া বলা ভালো হয় না। [Dhaka]',
      'নতুন শব্দ শুধু শিখলেই হবে না — Speaking উত্তরে ব্যবহার করতে হবে।',
      "Lollipop Method (Part 2, Winners' Academy) আর Idioms technique — বিস্তারিত মূল ভিডিও দেখে নিতে হবে।",
    ],
  },
];

export const COMMON_STEPS: string[] = [
  'প্রতিদিন 10–15টা নতুন শব্দ শেখো — listening script বা reading passage থেকে, ডিকশনারি মুখস্থ নয়; synonym আর paraphrase শেখো আর ব্যবহার করো। [Dhaka]',
  'Grammar যেটা লাগবেই: tense, subject-verb agreement, article, preposition, pronoun, suffix/prefix, conditional, active/passive, simple/complex/compound sentence, linking words। [Dhaka]',
  'Mock-এর পরের দিন শুধু analysis — ভুলটা vocabulary, paraphrase, spelling, নাকি শোনায়, তা আলাদা করে খাতায় লেখো।',
  'Practice-এ যেমন করবে, main exam-এ তেমনই হবে — বাড়িতে practice না করে পরীক্ষায় বসলে ভালো perform করা যায় না। [Dhaka]',
];
