import { useState } from 'react';
import { RESOURCE_GROUPS } from '../data/resources';
import { en } from '../lib/format';
import { Icon, type IconName } from '../lib/icons';

export type InfoPageId = 'privacy' | 'terms' | 'disclaimer' | 'faq' | 'about' | 'contact' | 'sources';

const PAGES: { id: InfoPageId; label: string; icon: IconName; blurb: string }[] = [
  { id: 'privacy', label: 'Privacy Policy', icon: 'shield', blurb: 'কী ডেটা থাকে, কেন থাকে' },
  { id: 'terms', label: 'Terms & Conditions', icon: 'doc', blurb: 'অ্যাকাউন্ট ব্যবহারের নিয়ম' },
  { id: 'disclaimer', label: 'Disclaimer', icon: 'alert', blurb: 'দায়বদ্ধতার সীমা' },
  { id: 'faq', label: 'FAQ', icon: 'help', blurb: 'সাধারণ প্রশ্নের উত্তর' },
  { id: 'about', label: 'About', icon: 'info', blurb: 'এই অ্যাপটা কী' },
  { id: 'contact', label: 'Contact & Support', icon: 'mail', blurb: 'যোগাযোগ ও সমস্যা জানানো' },
  { id: 'sources', label: 'Data Sources & References', icon: 'book', blurb: 'সব 101টি লিংকের উৎস' },
];

const SUPPORT_EMAIL = 'asmitsr.official@gmail.com';

function PageShell({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button type="button" className="back-row" onClick={onBack}>
        <Icon name="back" size={18} /> ফিরে যাও
      </button>
      <h2 className="section-title">{title}</h2>
      <div className="card legal">{children}</div>
    </div>
  );
}

function PrivacyPage({ onBack }: { onBack: () => void }) {
  return (
    <PageShell title="Privacy Policy" onBack={onBack}>
      <p className="muted">সর্বশেষ আপডেট: 22 নভেম্বর 2026</p>
      <h3>আমরা কী ডেটা রাখি</h3>
      <ul>
        <li>
          <strong>অ্যাকাউন্ট:</strong> তোমার email, optional full name, আর password-এর একমুখী hash (আসল password
          কোথাও রাখা হয় না)।
        </li>
        <li>
          <strong>পড়ার progress:</strong> কোন দিনের কোন task-এ টিক দিয়েছো, আর প্রতিটা block-এর শুরুর সময়।
        </li>
        <li>
          <strong>সেটিংস:</strong> থিম পছন্দ, নোটিফিকেশন পছন্দ, পড়ার পছন্দ।
        </li>
        <li>
          <strong>সেশন:</strong> লগইন করা ডিভাইসের তথ্য (browser/device ধরন) — Active Sessions তালিকায় দেখানোর জন্য।
        </li>
        <li>
          <strong>সম্মতি:</strong> Terms আর Privacy Policy-তে রাজি হওয়ার তারিখ (রেজিস্ট্রেশনের সময়)।
        </li>
      </ul>
      <h3>ডেটা কোথায় থাকে</h3>
      <p>
        ডেটা থাকে Cloudflare D1 ডেটাবেসে (Cloudflare-এর সার্ভারে)। তোমার password PBKDF2-HMAC-SHA256 দিয়ে hash
        করা হয় (100,000 iteration, আলাদা salt) — hash থেকে আসল password ফেরত পাওয়া যায় না। লগইন সেশন HttpOnly
        cookie দিয়ে চলে, JavaScript থেকে পড়া যায় না।
      </p>
      <h3>আমরা যা করি না</h3>
      <ul>
        <li>কোনো বিজ্ঞাপন, tracker বা analytics নেই।</li>
        <li>তোমার ডেটা কারো কাছে বিক্রি বা শেয়ার করা হয় না।</li>
        <li>তোমার পড়ার ডেটা তুমি ছাড়া আর কেউ দেখতে পারে না — প্রতিটা query তোমার user ID দিয়ে সীমাবদ্ধ।</li>
      </ul>
      <h3>তোমার অধিকার</h3>
      <p>
        Settings → Privacy থেকে তুমি তোমার ডেটা ডাউনলোড করতে পারো, আর Settings → Account Management থেকে পুরো
        অ্যাকাউন্ট মুছে ফেলতে পারো — মুছলে অ্যাকাউন্ট, progress, block time, সেশন, সেটিংস — সব স্থায়ীভাবে মুছে
        যায়।
      </p>
      <h3>যোগাযোগ</h3>
      <p>
        Privacy নিয়ে প্রশ্ন থাকলে লেখো:{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </PageShell>
  );
}

function TermsPage({ onBack }: { onBack: () => void }) {
  return (
    <PageShell title="Terms & Conditions" onBack={onBack}>
      <p className="muted">সর্বশেষ আপডেট: 22 নভেম্বর 2026</p>
      <h3>এই অ্যাপটা কী</h3>
      <p>
        IELTS 60-Day App একটি ব্যক্তিগত পড়ার ট্র্যাকার: 60 দিনের স্টাডি প্ল্যান, টিক-অফ, মক টেস্টের সময়সূচি,
        আর বাছাই করা ফ্রি রিসোর্সের লিংক। এটি IELTS পরীক্ষার অফিসিয়াল অ্যাপ নয়।
      </p>
      <h3>তোমার অ্যাকাউন্ট</h3>
      <ul>
        <li>তোমার অ্যাকাউন্ট আর password-এর দায়িত্ব তোমার। Password কারো সাথে শেয়ার করো না।</li>
        <li>একটি email দিয়ে একটি অ্যাকাউন্ট। ভুল তথ্য দিয়ে অ্যাকাউন্ট খুলো না।</li>
        <li>অন্য কারো অ্যাকাউন্টে ঢোকার চেষ্টা করা নিষেধ।</li>
      </ul>
      <h3>ব্যবহারের নিয়ম</h3>
      <ul>
        <li>অ্যাপটি শুধু নিজের IELTS প্রস্তুতির জন্য ব্যবহার করো।</li>
        <li>অ্যাপের ভেতরের কনটেন্ট (প্ল্যান, কিউ কার্ড তালিকা, নোট) অন্য কোথাও কপি করে বিক্রি করো না।</li>
        <li>বাইরের লিংকগুলো তাদের নিজ নিজ মালিকের — সেগুলোর নিয়ম সেখানে প্রযোজ্য।</li>
      </ul>
      <h3>সার্ভিসের সীমা</h3>
      <p>
        অ্যাপটি বিনামূল্যে, &quot;যেমন আছে&quot; ভিত্তিতে দেওয়া হয়। কোনো স্কোর বা ফলাফলের গ্যারান্টি নেই। সার্ভার
        রক্ষণাবেক্ষণের জন্য মাঝে মাঝে সার্ভিস বন্ধ থাকতে পারে।
      </p>
      <h3>অ্যাকাউন্ট বন্ধ করা</h3>
      <p>
        তুমি যেকোনো সময় Settings থেকে অ্যাকাউন্ট মুছে ফেলতে পারো। নিয়ম ভাঙলে অ্যাকাউন্ট বন্ধ করে দেওয়া হতে পারে।
      </p>
    </PageShell>
  );
}

function DisclaimerPage({ onBack }: { onBack: () => void }) {
  return (
    <PageShell title="Disclaimer" onBack={onBack}>
      <h3>কোনো অফিসিয়াল সম্পর্ক নেই</h3>
      <p>
        এই অ্যাপ IELTS, British Council, IDP, বা Cambridge-এর সাথে অফিসিয়ালভাবে যুক্ত নয়, তাদের অনুমোদিত নয়, বা
        তাদের পক্ষ থেকে তৈরি নয়। IELTS নাম ও লোগো তাদের নিজ নিজ মালিকের ট্রেডমার্ক।
      </p>
      <h3>ফলাফলের গ্যারান্টি নেই</h3>
      <p>
        এই প্ল্যান অনুসরণ করলে কোনো নির্দিষ্ট ব্যান্ড স্কোরের গ্যারান্টি নেই। তোমার ফলাফল তোমার চেষ্টা, বেসিক
        লেভেল, আর পরীক্ষার দিনের পারফরম্যান্সের উপর নির্ভর করে।
      </p>
      <h3>বাইরের লিংক</h3>
      <p>
        অ্যাপের বাইরের ওয়েবসাইট, PDF, ভিডিও আর অ্যাপগুলো তাদের নিজ নিজ মালিকের। সেগুলোর কনটেন্ট, সঠিকতা, বা
        availability-এর দায়িত্ব এই অ্যাপের নয়। কোনো লিংক কাজ না করলে Contact &amp; Support-এ জানাও।
      </p>
      <h3>কনটেন্টের উৎস</h3>
      <p>
        স্টাডি প্ল্যানটি Moktadir&apos;s IELTS School-এর 60 দিনের রুটিন আর Dhaka English Lab-এর 60 দিনের ভিডিও
        প্ল্যানের উপর ভিত্তি করে তৈরি। কিউ কার্ডগুলো Makkar IELTS Speaking (Sep–Dec 2026) বইয়ের তালিকা থেকে নেওয়া
        — বইটি এখানে কপি করা হয়নি, শুধু কার্ডের টাইটেল তালিকা আছে। বিস্তারিত Data Sources &amp; References পেজে।
      </p>
    </PageShell>
  );
}

function FaqPage({ onBack }: { onBack: () => void }) {
  const QA: [string, string][] = [
    [
      'Progress কি সব ডিভাইসে একই থাকে?',
      'হ্যাঁ। টিক-অফ, block time আর সেটিংস তোমার অ্যাকাউন্টে সার্ভারে সেভ হয়। একই অ্যাকাউন্ট দিয়ে যেকোনো ডিভাইসে লগইন করলে একই progress দেখাবে।',
    ],
    [
      'Password ভুলে গেলে কী করবো?',
      'লগইন পেজে "Password ভুলে গেছো?" চাপো — তোমার email-এ reset লিংক যাবে। লিংক একবারই কাজ করে, 1 ঘণ্টা পর মেয়াদ শেষ হয়। লিংক দিয়ে password বদলালে সব ডিভাইস থেকে লগআউট হয়ে যাবে।',
    ],
    [
      'Day 1 কবে থেকে শুরু?',
      'Day 1 = 23 নভেম্বর 2026 (সোমবার), Day 60 = 21 জানুয়ারি 2027 (বৃহস্পতিবার)। প্রতিদিন 6 ঘণ্টা: Listening 2 ঘণ্টা, Reading 2 ঘণ্টা, Writing 1.5 ঘণ্টা, Speaking 30 মিনিট।',
    ],
    [
      'মক টেস্ট কবে?',
      'প্রতি রবিবার পূর্ণ মক টেস্ট — Day 7, 14, 21, 28, 35, 42, 49, 56। মক টেস্টের দিন আসল পরীক্ষার সময় ধরে টেস্ট দাও (Listening 30 + Reading 60 + Writing 60 + Speaking 15 মিনিট)।',
    ],
    [
      'রিসোর্সগুলো কি ফ্রি?',
      'বেশিরভাগই ফ্রি। যেগুলো paid (যেমন Mentors-এর কিছু কোর্স), সেগুলো "paid" চিহ্ন দিয়ে আলাদা করা আছে। কোনো paid জিনিসের দাম অ্যাপ থেকে নেওয়া হয় না।',
    ],
    [
      'নোটিফিকেশন কীভাবে কাজ করে?',
      'এই অ্যাপে in-app নোটিফিকেশন আছে: পড়ার block-এর সময় হলে অ্যাপের ভেতরে reminder দেখায়। অ্যাপ বন্ধ থাকলে push নোটিফিকেশন আসে না — ফোনের Clock অ্যালার্ম ব্যবহার করো। Settings → Notifications থেকে reminder চালু/বন্ধ আর সময় বদলাতে পারো।',
    ],
    [
      'আমার ডেটা কীভাবে মুছবো?',
      'Settings → Account Management → Delete Account। Password দিয়ে নিশ্চিত করলে অ্যাকাউন্ট, progress, block time, সেশন, সেটিংস — সব স্থায়ীভাবে মুছে যাবে। এটা ফেরত আনা যায় না।',
    ],
    [
      'থিম কীভাবে বদলাবো?',
      'আরও মেনু থেকে Dark/Light বদলাতে পারো, আর Settings → Appearance থেকে System Default-ও বেছে নিতে পারো (ফোনের থিম অনুযায়ী বদলাবে)।',
    ],
  ];
  return (
    <PageShell title="FAQ — সাধারণ প্রশ্ন" onBack={onBack}>
      {QA.map(([q, a]) => (
        <div key={q} className="faq-item">
          <h3>{q}</h3>
          <p>{a}</p>
        </div>
      ))}
    </PageShell>
  );
}

function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <PageShell title="About — এই অ্যাপ সম্পর্কে" onBack={onBack}>
      <p>
        IELTS 60-Day App একটি 60 দিনের IELTS প্রস্তুতি ট্র্যাকার — Band 7+ লক্ষ্য নিয়ে তৈরি। প্রতিদিন 6 ঘণ্টার
        স্টাডি ব্লক, সাপ্তাহিক ফুল মক টেস্ট, আর বাছাই করা ফ্রি রিসোর্স — সব এক জায়গায়।
      </p>
      <h3>ভেতরে যা আছে</h3>
      <ul>
        <li>60 দিনের প্ল্যান, 233টি task, টিক-অফসহ progress ট্র্যাকিং</li>
        <li>8টি সাপ্তাহিক ফুল মক টেস্ট (প্রতি রবিবার)</li>
        <li>101টি রিসোর্স লিংক, 148টি Makkar cue card, 38টি ধাপ, 12টি টেকনিক</li>
        <li>Listening, Reading, Writing, Speaking — প্রতিটার আলাদা প্র্যাকটিস গাইড</li>
        <li>অ্যাকাউন্টভিত্তিক progress — সব ডিভাইসে একই</li>
      </ul>
      <h3>প্ল্যানের ভিত্তি</h3>
      <p>
        দিনের ফোকাস Moktadir&apos;s IELTS School-এর 60 দিনের রুটিন থেকে নেওয়া, আর দৈনিক 6 ঘণ্টার ব্লক কাঠামো
        Dhaka English Lab-এর 60 দিনের ভিডিও প্ল্যান থেকে। বিস্তারিত Data Sources &amp; References পেজে আছে।
      </p>
      <h3>তৈরি</h3>
      <p>
        তৈরি করেছেন Asmit Sarkar। ডিজাইন: Nord color system। অ্যাপটি ব্যক্তিগত পড়ার জন্য তৈরি — কোনো বাণিজ্যিক
        প্রতিষ্ঠানের পণ্য নয়।
      </p>
      <p className="muted">Version 1.0.0 · 22 নভেম্বর 2026</p>
    </PageShell>
  );
}

function ContactPage({ onBack }: { onBack: () => void }) {
  return (
    <PageShell title="Contact & Support" onBack={onBack}>
      <h3>যোগাযোগ</h3>
      <p>
        প্রশ্ন, সমস্যা, বা পরামর্শ থাকলে email করো:{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
      <a
        className="btn btn-primary"
        href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('IELTS 60-Day App — Support')}`}
      >
        <Icon name="mail" size={17} /> Email পাঠাও
      </a>
      <h3 style={{ marginTop: 20 }}>সমস্যা জানানোর সময় যা লিখবে</h3>
      <ul>
        <li>কোন পেজে / কোন কাজ করতে গিয়ে সমস্যা হলো</li>
        <li>কী দেখতে পেয়েছো (error লেখাটা থাকলে সেটা)</li>
        <li>তোমার ফোনের মডেল আর browser (যদি জানো)</li>
      </ul>
      <h3>ভাঙা লিংক</h3>
      <p>
        কোনো রিসোর্স লিংক কাজ না করলে সেটার নামসহ জানাও — যাচাই করে ঠিক করা হবে। বাইরের সাইটের কনটেন্টের জন্য এই
        অ্যাপ দায়ী নয়।
      </p>
    </PageShell>
  );
}

function SourcesPage({ onBack }: { onBack: () => void }) {
  const totalLinks = RESOURCE_GROUPS.reduce(
    (n, g) => n + g.items.filter((i) => i.url).length,
    0,
  );
  return (
    <PageShell title="Data Sources & References" onBack={onBack}>
      <p>
        এই অ্যাপের সব বাইরের লিংক নিচে গ্রুপ অনুযায়ী দেওয়া আছে — মোট {en(totalLinks)}টি লিংক। প্রতিটা লিংক
        তার আসল মালিকের সাইটে যায়; অ্যাপটি সেগুলোর কনটেন্ট নিজের বলে দাবি করে না।
      </p>
      <h3>Attribution</h3>
      <ul>
        <li>
          <strong>Munzeerin Shahid IELTS Course PDFs:</strong> DynamicBangla-এর public GitHub রিপোজিটরি
          (DynamicBangla/IELTS-Course-by-Munzeerin-Shahid) থেকে — 61টি PDF, ফ্রি।
        </li>
        <li>
          <strong>Makkar cue cards:</strong> Makkar IELTS Speaking (Sep–Dec 2026) বইয়ের কার্ডের টাইটেল তালিকা।
          বইটি এখানে কপি করা হয়নি।
        </li>
        <li>
          <strong>60 দিনের রুটিন:</strong> Moktadir&apos;s IELTS School-এর 60 দিনের রোডম্যাপ আর Dhaka English
          Lab-এর 60 দিনের ভিডিও প্ল্যানের উপর ভিত্তি করে তৈরি।
        </li>
        <li>
          <strong>অন্যান্য লিংক:</strong> প্রতিটা লিংক তার নিজের সাইটের — British Council, IDP, IELTS.org,
          mini-ielts.com, BBC, TED সহ অন্যান্য।
        </li>
      </ul>
      <p className="muted">
        কোনো লিংক ভুল বা পুরনো মনে হলে Contact &amp; Support-এ জানাও। &quot;লিংক যাচাই হয়নি&quot; চিহ্নিত
        জিনিসগুলোর লিংক এখনো যাচাই করা হয়নি — সেগুলোতে ক্লিক করা যায় না।
      </p>
      {RESOURCE_GROUPS.map((g) => (
        <div key={g.title}>
          <h3 className="res-sub" style={{ fontSize: 15 }}>
            {g.title}
          </h3>
          {g.items.map((item) => (
            <div key={item.name} className="res-item">
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.name} <Icon name="external" size={13} />
                </a>
              ) : (
                <span style={{ fontWeight: 600 }}>{item.name}</span>
              )}
              {item.note && <span className="note"> — {item.note}</span>}
              {item.kind === 'paid' && <span className="chip danger">paid</span>}
              {item.kind === 'nolink' && <span className="chip">লিংক যাচাই হয়নি</span>}
            </div>
          ))}
        </div>
      ))}
    </PageShell>
  );
}

export function InfoSection({
  initialPage,
  onBack,
}: {
  initialPage?: InfoPageId;
  onBack?: () => void;
}) {
  const [page, setPage] = useState<InfoPageId | 'list'>(initialPage ?? 'list');

  if (page === 'privacy') return <PrivacyPage onBack={() => setPage('list')} />;
  if (page === 'terms') return <TermsPage onBack={() => setPage('list')} />;
  if (page === 'disclaimer') return <DisclaimerPage onBack={() => setPage('list')} />;
  if (page === 'faq') return <FaqPage onBack={() => setPage('list')} />;
  if (page === 'about') return <AboutPage onBack={() => setPage('list')} />;
  if (page === 'contact') return <ContactPage onBack={() => setPage('list')} />;
  if (page === 'sources') return <SourcesPage onBack={() => setPage('list')} />;

  return (
    <div>
      {onBack && (
        <button type="button" className="back-row" onClick={onBack}>
          <Icon name="back" size={18} /> লগইনে ফিরে যাও
        </button>
      )}
      <h2 className="section-title">তথ্য ও আইনি</h2>
      <p className="muted">Privacy, Terms, FAQ, আর সব রিসোর্সের উৎস — এক জায়গায়।</p>
      <div className="card" style={{ padding: 6 }}>
        {PAGES.map((p) => (
          <button key={p.id} type="button" className="sheet-row" onClick={() => setPage(p.id)}>
            <Icon name={p.icon} size={22} />
            <span>
              {p.label}
              <small>{p.blurb}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
