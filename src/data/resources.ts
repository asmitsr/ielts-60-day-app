// Resource links — parsed from ielts-all-resource-links.md (single source of truth).
// Unverified items carry kind "nolink" and NO url. PAID items are marked kind "paid".
// The 99-taka leaked-bundle site is never linked (piracy) — it appears only as a warning note.
export interface ResourceItem { name: string; url?: string; note?: string; sub?: string; kind: "link" | "nolink" | "paid" | "info" | "note"; }
export interface ResourceGroup { title: string; note?: string; items: ResourceItem[]; }
export const RESOURCE_GROUPS: ResourceGroup[] = [
 {
  "title": "তাঁর নিজের IELTS সাইট ও পেজ",
  "items": [
   {
    "name": "IELTS Pathway (তাঁর আগের ওয়েবসাইট)",
    "url": "https://ielts-pathway-fccu.vercel.app/",
    "note": "ফ্রি; অরিজিনাল লেসন, কুইজ, ফ্ল্যাশকার্ড, YouTube রিসোর্স পেজ",
    "kind": "link"
   },
   {
    "name": "IELTS 60-day routine পেজ (লাইভ)",
    "url": "https://ielts-60-day-routine.asmitsr.workers.dev",
    "note": "Moktadir রুটিন; /notes-এ ১৭৬টি নোট + ১৬ লিংক নোট + Makkar তালিকা",
    "kind": "link"
   },
   {
    "name": "Mentors IELTS playlists পেজ",
    "url": "https://mentors-ielts-playlists.asmitsr.workers.dev",
    "note": "লগইন লাগে",
    "kind": "link"
   }
  ]
 },
 {
  "title": "Moktadir — IELTS School",
  "items": [
   {
    "name": "60 Days IELTS Road Map",
    "url": "https://moktadirsielts.com/roadmap/",
    "note": "তাঁর চলতি রুটিনের উৎস",
    "kind": "link"
   },
   {
    "name": "Recent Questions — আসল পরীক্ষার passage",
    "url": "https://moktadirsielts.com/recent-questions/",
    "kind": "link"
   },
   {
    "name": "IELTS Prep Hub — mock ও spelling",
    "url": "https://ieltsprephub.org",
    "note": "Moktadir-এর mock site; Speaking-এ ৭২০ প্রশ্ন",
    "kind": "link"
   },
   {
    "name": "IELTS Spelling Practice",
    "url": "https://ieltsspelling.com",
    "note": "Category, Top Exam Words, Timed Challenge",
    "kind": "link"
   }
  ]
 },
 {
  "title": "Dhaka English Lab ভিডিও + গ্রুপ",
  "items": [
   {
    "name": "IELTS Study plan for 2 months (ভিডিও)",
    "url": "https://youtu.be/EsXk5Bst2JU",
    "note": "১২m২৭s, ১৫ Jun ২০২৬; ৬০ দিন, টার্গেট ৭.৫+",
    "kind": "link"
   },
   {
    "name": "WhatsApp গ্রুপ (ফ্রি ক্লাস + রিসোর্স)",
    "url": "https://chat.whatsapp.com/F9HR5txlKHxE8iNYf8mRMv",
    "note": "ফ্রি ম্যাটেরিয়াল এই গ্রুপে দেওয়া হয়",
    "kind": "link"
   },
   {
    "name": "৫৫০ পৃষ্ঠার ভোকাব PDF (Cambridge ১–২০ + Official Guide, ১৩,০০০+ শব্দ)",
    "note": "কমেন্টে ফ্রি দেওয়ার কথা বলা হয়েছিল, এখনো পাওয়া যায়নি",
    "kind": "nolink"
   }
  ]
 },
 {
  "title": "Munzeerin Shahid IELTS Course PDFs — DynamicBangla GitHub (৬১ PDF + ১৫ মক, ফ্রি)",
  "items": [
   {
    "name": "Repo",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid",
    "kind": "link"
   },
   {
    "name": "সাইট",
    "url": "https://dynamicbangla.github.io/IELTS-Course-by-Munzeerin-Shahid/",
    "kind": "link"
   },
   {
    "sub": "Listening",
    "name": "1. Listening Form Completion",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/1.%20Listening%20Form%20Completion.pdf",
    "kind": "link"
   },
   {
    "sub": "Listening",
    "name": "3. Listening Multiple Choice Questions (MCQ)",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/3.%20Listening%20Multiple%20Choice%20Questions%20%28MCQ%29.pdf",
    "kind": "link"
   },
   {
    "sub": "Listening",
    "name": "4. Listening Sentence Completion and Gap Fill",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/4.%20Listening%20Sentence%20Completion%20and%20Gap%20Fill.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "5. Reading Format",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/5.%20Reading%20Format.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "6. Reading Paragraph Heading",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/6.%20Reading%20Paragraph%20Heading.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "7. Reading Multiple Choice Questions (MCQ)",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/7.%20Reading%20Multiple%20Choice%20Questions%20%28MCQ%29.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "8. Reading TrueFalseNotGiven",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/8.%20Reading%20TrueFalseNotGiven.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "9. Reading Matching Pragraph Infoemation",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/9.%20Reading%20Matching%20Pragraph%20Infoemation.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "10. Reading Sentence Completion",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/10.%20Reading%20Sentence%20Completion.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "11. Reading Short Answer Question",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/11.%20Reading%20Short%20Answer%20Question.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "12. Reading Gap Fill",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/12.%20Reading%20Gap%20Fill.pdf",
    "kind": "link"
   },
   {
    "sub": "Writing",
    "name": "13. Writing Format",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/13.%20Writing%20Format.pdf",
    "kind": "link"
   },
   {
    "sub": "Writing",
    "name": "14. Writting Task 1 Structure",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/14.%20Writting%20Task%201%20Structure.pdf",
    "kind": "link"
   },
   {
    "sub": "Writing",
    "name": "15. Writing Task 1 Graphs",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/15.%20Writing%20Task%201%20Graphs.pdf",
    "kind": "link"
   },
   {
    "sub": "Writing",
    "name": "16. Writing Task 1 Maps",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/16.%20Writing%20Task%201%20Maps.pdf",
    "kind": "link"
   },
   {
    "sub": "Writing",
    "name": "17. Writing Task 1 - Describing A Diagram Processes",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/17.%20Writing%20Task%201%20-%20Describing%20A%20Diagram%20Processes.pdf",
    "kind": "link"
   },
   {
    "sub": "Writing",
    "name": "18. Writing Task 2 - Structure",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/18.%20Writing%20Task%202%20-%20Structure.pdf",
    "kind": "link"
   },
   {
    "sub": "Writing",
    "name": "19. Writing Task 2 Agree Disagree essay",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/19.%20Writing%20Task%202%20Agree%20Disagree%20essay.pdf",
    "kind": "link"
   },
   {
    "sub": "Writing",
    "name": "20. Writing Task 2 AdvantageDisadvantage essay",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/20.%20Writing%20Task%202%20AdvantageDisadvantage%20essay.pdf",
    "kind": "link"
   },
   {
    "sub": "Writing",
    "name": "21. Writing Task 2 Cause Solution essay",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/21.%20Writing%20Task%202%20Cause%20Solution%20essay.pdf",
    "kind": "link"
   },
   {
    "sub": "Writing",
    "name": "22. Writing Task 2 Discussion essay",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/22.%20Writing%20Task%202%20Discussion%20essay.pdf",
    "kind": "link"
   },
   {
    "sub": "Writing",
    "name": "23. Writing Task 2 - Direct question essay",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/23.%20Writing%20Task%202%20-%20Direct%20question%20essay.pdf",
    "kind": "link"
   },
   {
    "sub": "Speaking",
    "name": "24. Speaking How to Greet Your Examiner",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/24.%20Speaking%20How%20to%20Greet%20Your%20Examiner.pdf",
    "kind": "link"
   },
   {
    "sub": "Speaking",
    "name": "25. Speaking How to improve your IELTS speaking at home",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/25.%20Speaking%20How%20to%20improve%20your%20IELTS%20speaking%20at%20home.pdf",
    "kind": "link"
   },
   {
    "sub": "Speaking",
    "name": "26. Speaking Part 1 - Common topics",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/26.%20Speaking%20Part%201%20-%20Common%20topics.pdf",
    "kind": "link"
   },
   {
    "sub": "Speaking",
    "name": "27. Speaking Part 2 - Common topics",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/27.%20Speaking%20Part%202%20-%20Common%20topics.pdf",
    "kind": "link"
   },
   {
    "sub": "Speaking",
    "name": "28. Speaking 5 Advanced Words to Use in Your IELTS Speaking Test",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/28.%20Speaking%20IELTS%20Speaking%205%20Advanced%20Words%20to%20Use%20in%20Your%20IELTS%20Speaking%20Test.pdf",
    "kind": "link"
   },
   {
    "sub": "Speaking",
    "name": "29. Speaking 5 Advanced Words to Use in Your IELTS Speaking Test 2",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/29.%20Speaking%20IELTS%20Speaking%205%20Advanced%20Words%20to%20Use%20in%20Your%20IELTS%20Speaking%20Test%202.pdf",
    "kind": "link"
   },
   {
    "sub": "Speaking",
    "name": "30. Speaking How to introduce yourself in English",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/30.%20Speaking%20How%20to%20introduce%20yourself%20in%20English.pdf",
    "kind": "link"
   },
   {
    "sub": "Speaking",
    "name": "31. Speaking What are your hobbies - Easy Tips",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/31.%20Speaking%20What%20are%20your%20hobbies%20Easy%20Tips-%20Easy%20Tips%20to%20Answer%20This%20Question.pdf",
    "kind": "link"
   },
   {
    "sub": "Speaking",
    "name": "32. Speaking What's your favorite",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Academic%20PDF/32.%20Speaking%20What%27s%20your%20favorite.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "Reading Diagram Label Completion",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/General%20All%20PDF/Reading%20Diagram%20Label%20Completion.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "Reading Format",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/General%20All%20PDF/Reading%20Format.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "Reading Gap Fill",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/General%20All%20PDF/Reading%20Gap%20Fill.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "Reading Matching Headings",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/General%20All%20PDF/Reading%20Matching%20Headings.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "Reading Matching Information",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/General%20All%20PDF/Reading%20Matching%20Information.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "Reading Matching Sentence Endings",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/General%20All%20PDF/Reading%20Matching%20Sentence%20Endings.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "Reading Multple Choice Questions (MCQ)",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/General%20All%20PDF/Reading%20Multple%20Choice%20Questions%20%28MCQ%29.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "Reading Sentence Completion",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/General%20All%20PDF/Reading%20Sentence%20Completion.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "Reading Short QA",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/General%20All%20PDF/Reading%20Short%20QA.pdf",
    "kind": "link"
   },
   {
    "sub": "Reading",
    "name": "Reading TrueFalseNotGiven",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/General%20All%20PDF/Reading%20TrueFalseNotGiven.pdf",
    "kind": "link"
   },
   {
    "sub": "Writing (General Training - Letter)",
    "name": "WRITING - Format",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/General%20All%20PDF/WRITING%20-%20Format.pdf",
    "kind": "link"
   },
   {
    "sub": "Writing (General Training - Letter)",
    "name": "Writing Structure and Tips for writing task 1 (Letter)",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/General%20All%20PDF/Writing%20Structure%20and%20Tips%20for%20writing%20task%201%20%28Letter%29.pdf",
    "kind": "link"
   },
   {
    "sub": "Writing (General Training - Letter)",
    "name": "Writing Task 1 - Semi-formal Letter",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/General%20All%20PDF/Writing%20Task%201%20-%20Semi-formal%20Letter.pdf",
    "kind": "link"
   },
   {
    "sub": "Writing (General Training - Letter)",
    "name": "Writing Task 1 Informal Letter",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/General%20All%20PDF/Writing%20Task%201%20Informal%20Letter.pdf",
    "kind": "link"
   },
   {
    "sub": "Writing (General Training - Letter)",
    "name": "Writing Task1 Formal Letter",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/General%20All%20PDF/Writing%20Task1%20%20Formal%20Letter.pdf",
    "kind": "link"
   },
   {
    "sub": "Mock Test — ১৫টি",
    "name": "Mock 1",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Mock%20Test/Mock%201.pdf",
    "kind": "link"
   },
   {
    "sub": "Mock Test — ১৫টি",
    "name": "Mock 2",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Mock%20Test/Mock%202.pdf",
    "kind": "link"
   },
   {
    "sub": "Mock Test — ১৫টি",
    "name": "Mock 3",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Mock%20Test/Mock%203.pdf",
    "kind": "link"
   },
   {
    "sub": "Mock Test — ১৫টি",
    "name": "Mock 4",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Mock%20Test/Mock%204.pdf",
    "kind": "link"
   },
   {
    "sub": "Mock Test — ১৫টি",
    "name": "Mock 5",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Mock%20Test/Mock%205.pdf",
    "kind": "link"
   },
   {
    "sub": "Mock Test — ১৫টি",
    "name": "Mock 6",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Mock%20Test/Mock%206.pdf",
    "kind": "link"
   },
   {
    "sub": "Mock Test — ১৫টি",
    "name": "Mock 7",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Mock%20Test/Mock%207.pdf",
    "kind": "link"
   },
   {
    "sub": "Mock Test — ১৫টি",
    "name": "Mock 8",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Mock%20Test/Mock%208.pdf",
    "kind": "link"
   },
   {
    "sub": "Mock Test — ১৫টি",
    "name": "Mock 9",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Mock%20Test/Mock%209.pdf",
    "kind": "link"
   },
   {
    "sub": "Mock Test — ১৫টি",
    "name": "Mock 10",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Mock%20Test/Mock%2010.pdf",
    "kind": "link"
   },
   {
    "sub": "Mock Test — ১৫টি",
    "name": "Mock 11",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Mock%20Test/Mock%2011.pdf",
    "kind": "link"
   },
   {
    "sub": "Mock Test — ১৫টি",
    "name": "Mock 12",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Mock%20Test/Mock%2012.pdf",
    "kind": "link"
   },
   {
    "sub": "Mock Test — ১৫টি",
    "name": "Mock 13",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Mock%20Test/Mock%2013.pdf",
    "kind": "link"
   },
   {
    "sub": "Mock Test — ১৫টি",
    "name": "Mock 14",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Mock%20Test/Mock%2014.pdf",
    "kind": "link"
   },
   {
    "sub": "Mock Test — ১৫টি",
    "name": "Mock 15",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/blob/main/Mock%20Test/Mock%2015.pdf",
    "kind": "link"
   },
   {
    "sub": "ফোল্ডার লিংক (একসাথে সব দেখতে)",
    "name": "Academic PDF ফোল্ডার",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/tree/main/Academic%20PDF",
    "kind": "link"
   },
   {
    "sub": "ফোল্ডার লিংক (একসাথে সব দেখতে)",
    "name": "General All PDF ফোল্ডার",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/tree/main/General%20All%20PDF",
    "kind": "link"
   },
   {
    "sub": "ফোল্ডার লিংক (একসাথে সব দেখতে)",
    "name": "Mock Test ফোল্ডার",
    "url": "https://github.com/DynamicBangla/IELTS-Course-by-Munzeerin-Shahid/tree/main/Mock%20Test",
    "kind": "link"
   }
  ],
  "note": "ম্যাটেরিয়াল ২০২২ সালের, শেষ আপডেট ১৫ জানুয়ারি ২০২৩ — ২০২৪–২০২৬ সালে নতুন কিছু নেই। এই রিপোতে কোনো Google Drive লিংক বা ভিডিও ক্লাস লিংক নেই — শুধু GitHub-এ হোস্ট করা PDF।"
 },
 {
  "title": "Practice ওয়েবসাইট (ফ্রি)",
  "items": [
   {
    "name": "mini-ielts.com — Timed Reading/Listening practice",
    "url": "https://mini-ielts.com",
    "note": "timer + question palette",
    "kind": "link"
   },
   {
    "name": "ieltsOnlineTests.com — Online IELTS test practice",
    "url": "https://ieltsOnlineTests.com",
    "note": "যাচাই করা ফ্রি সাইট",
    "kind": "link"
   },
   {
    "name": "Road to IELTS",
    "url": "https://www.roadtoielts.com",
    "note": "ফ্রি মক",
    "kind": "link"
   },
   {
    "name": "dailydictation.com — Listening dictation",
    "url": "https://dailydictation.com",
    "note": "শুনে হুবহু লেখা; কান তৈরি ও spelling [Dhaka]",
    "kind": "link"
   },
   {
    "name": "aeon.co — English articles",
    "url": "https://aeon.co",
    "note": "প্রতিদিন ২–৩টা article [Dhaka]",
    "kind": "link"
   },
   {
    "name": "News in Levels — Level অনুযায়ী English news",
    "url": "https://www.newsinlevels.com",
    "note": "[Dhaka + Sheet]",
    "kind": "link"
   },
   {
    "name": "Duolingo — Daily English habit",
    "url": "https://www.duolingo.com",
    "kind": "link"
   },
   {
    "name": "HelloTalk — Speaking partner খোঁজা",
    "url": "https://www.hellotalk.com",
    "kind": "link"
   },
   {
    "name": "Khan Academy — Foundation English",
    "url": "https://www.khanacademy.org",
    "kind": "link"
   },
   {
    "name": "MIT OpenCourseWare — Foundation",
    "url": "https://ocw.mit.edu",
    "kind": "link"
   }
  ]
 },
 {
  "title": "অফিসিয়াল (ফ্রি)",
  "items": [
   {
    "name": "IELTS.org",
    "url": "https://www.ielts.org",
    "note": "অফিসিয়াল format ও marking বোঝার জন্য",
    "kind": "link"
   },
   {
    "name": "British Council LearnEnglish",
    "url": "https://learnenglish.britishcouncil.org",
    "note": "অফিসিয়াল ফ্রি resource",
    "kind": "link"
   },
   {
    "name": "British Council Learning Hub",
    "note": "নাম জানা, URL যাচাই হয়নি",
    "kind": "nolink"
   },
   {
    "name": "IDP IELTS webinar",
    "note": "নাম জানা, URL যাচাই হয়নি",
    "kind": "nolink"
   }
  ]
 },
 {
  "title": "YouTube চ্যানেল (ফ্রি লেসন)",
  "items": [
   {
    "name": "IELTS Liz",
    "url": "https://www.youtube.com/@ieltsliz",
    "note": "চার স্কিলের ফ্রি লেসন — URL যাচাই ২৮ Oct ২০২৬",
    "kind": "link"
   },
   {
    "name": "IELTS Advantage",
    "url": "https://www.youtube.com/@Ieltsadvantage",
    "note": "Writing ও Speaking ফ্রি ভিডিও — URL যাচাই ২৮ Oct ২০২৬",
    "kind": "link"
   },
   {
    "name": "British Council | LearnEnglish",
    "url": "https://www.youtube.com/user/BritishCouncilLE",
    "note": "অফিসিয়াল — URL যাচাই ২৮ Oct ২০২৬",
    "kind": "link"
   },
   {
    "name": "Take IELTS Official — British Council",
    "url": "https://www.youtube.com/user/BCIELTS",
    "note": "অফিসিয়াল — URL যাচাই ২৮ Oct ২০২৬",
    "kind": "link"
   },
   {
    "name": "IELTS Official",
    "url": "https://www.youtube.com/user/IELTSOfficial",
    "note": "অফিসিয়াল — URL যাচাই ২৮ Oct ২০২৬",
    "kind": "link"
   },
   {
    "name": "Banglay IELTS (চ্যানেল)",
    "url": "https://www.youtube.com/@banglayielts",
    "note": "বাংলায় IELTS — URL যাচাই ২৮ Oct ২০২৬",
    "kind": "link"
   },
   {
    "name": "Banglay IELTS — Listening Section 1 ভিডিও",
    "url": "https://www.youtube.com/watch?v=2Ydp6wu5i7A",
    "note": "বাংলায় Listening লেসন — URL যাচাই ২৮ Oct ২০২৬",
    "kind": "link"
   },
   {
    "name": "Asad Yakub",
    "note": "ফেসবুক/স্ক্রিনশট সূত্রে নাম জানা; চ্যানেল লিংক যাচাই হয়নি — YouTube-এ সার্চ করো",
    "kind": "nolink"
   },
   {
    "name": "Fastrack IELTS",
    "note": "ফেসবুক/স্ক্রিনশট সূত্রে নাম জানা; চ্যানেল লিংক যাচাই হয়নি — YouTube-এ সার্চ করো",
    "kind": "nolink"
   },
   {
    "name": "VIVID ENGLISH BD",
    "note": "ফেসবুক কমেন্ট সূত্রে নাম জানা; চ্যানেল লিংক যাচাই হয়নি — YouTube-এ সার্চ করো",
    "kind": "nolink"
   },
   {
    "name": "IELTS Journey",
    "note": "কমেন্টে guideline-এর জন্য best বলা হয়েছে; চ্যানেল লিংক যাচাই হয়নি — YouTube-এ সার্চ করো",
    "kind": "nolink"
   },
   {
    "name": "TED Talks (Speaking শোনার জন্য)",
    "url": "https://www.ted.com",
    "note": "প্রতিদিন শোনো — Speaking ভালো করতে শুনতে হবে [Dhaka]",
    "kind": "link"
   },
   {
    "name": "BBC News (Listening অভ্যাস)",
    "url": "https://www.bbc.com/news",
    "note": "প্রতিদিন শোনো",
    "kind": "link"
   }
  ]
 },
 {
  "title": "অ্যাপস (ফ্রি)",
  "items": [
   {
    "name": "Anki",
    "note": "ভোকাব + ভুলের spaced repetition, ১–৩–৭–১৪ দিনের cycle (Play Store থেকে নাও)",
    "kind": "info"
   },
   {
    "name": "IELTS Prep App by British Council",
    "note": "অফিসিয়াল practice (Play Store থেকে নাও)",
    "kind": "info"
   },
   {
    "name": "IELTS Prep by IDP (Play Store থেকে নাও)",
    "kind": "info"
   },
   {
    "name": "IELTS Coach by BC (Play Store থেকে নাও)",
    "kind": "info"
   },
   {
    "name": "E2 Test Prep (Play Store থেকে নাও)",
    "kind": "info"
   }
  ]
 },
 {
  "title": "Banglay IELTS / Mentors — ফ্রি জিনিস (paid আলাদা করে চিহ্নিত)",
  "items": [
   {
    "name": "Banglay IELTS — অফিসিয়াল সাইট",
    "url": "https://banglayielts.com",
    "note": "ফ্রি YouTube/Facebook/blog লেসন",
    "kind": "link"
   },
   {
    "name": "Banglay IELTS — Facebook Page",
    "url": "https://www.facebook.com/BanglayIELTS",
    "kind": "link"
   },
   {
    "name": "Banglay IELTS — Facebook গ্রুপ",
    "url": "https://www.facebook.com/groups/2087807478023509",
    "kind": "link"
   },
   {
    "name": "BIIC — ফ্রি diagnostic test + weekly mock",
    "url": "https://biic.com.bd",
    "kind": "link"
   },
   {
    "name": "Banglay IELTS চট্টগ্রাম শাখা: Aerial Legend (4th Floor), CDA Avenue, GEC Circle",
    "note": "ফোন 01332-843602",
    "kind": "info"
   },
   {
    "name": "Mentors — অফিসিয়াল সাইট",
    "url": "https://mentorslearning.com",
    "note": "ফ্রি: Introduction to IELTS (২ lessons)",
    "kind": "link"
   },
   {
    "name": "Mentors PAID (ফ্রি নয়)",
    "note": "IELTS Regular on-campus ৳১৩,৮০০ (৩.৫ মাস, ২০ মক), Crash ৳৯,৫০০ (১.৫ মাস, ১০ মক), Executive/Weekend ৳১৩,৮০০",
    "kind": "paid"
   },
   {
    "name": "Mentors চট্টগ্রাম: Mannan Bhaban, 156 Nur Ahmed Road, Jubilee Road; ১২ Oct ২০২৬-এর লিস্টিংয়ে IELTS রেজিস্ট্রেশনে ৫টি ফ্রি মক টেস্টের কথা ছিল",
    "kind": "info"
   }
  ]
 },
 {
  "title": "বই ও সতর্কতা",
  "items": [
   {
    "name": "Cambridge IELTS Books ১০–১৯ + Official Guide — timed self-mock-এর জন্য (বই, কোনো লিংক নেই)",
    "kind": "note"
   },
   {
    "name": "Makkar Speaking (Sep–Dec ২০২৬ PDF) — তাঁর নিজের ফাইল; ১৪৮ cue card অ্যাপে আছে (কোনো পাবলিক লিংক নেই)",
    "kind": "note"
   },
   {
    "name": "Protiksha Das ক্লাস: শুধু ১টি ফ্রি trial class — পুরো কোর্স ফ্রি নয়",
    "kind": "note"
   },
   {
    "name": "সতর্কতা: JumpRinto ও Onmock-এর AI Writing স্কোর নির্ভরযোগ্য নয় (লাইন বাই লাইন দিলে বেশি, পুরো লেখা দিলে কম দেয়) — AI স্কোরকে আসল band ভেবো না",
    "kind": "note"
   },
   {
    "name": "৳৯৯-এর leaked-course bundle সাইট — কখনো লিংক করো না (পাইরেসি)",
    "kind": "note"
   }
  ]
 }
];
