import { useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { Icon } from '../lib/icons';

// AI সহায়ক — grounded Q&A over this app's own data only. Chat history is
// session-only (component state, never persisted). When unconfigured, the
// user is sent to Settings → AI to save their own provider API key.
interface Msg {
  role: 'user' | 'ai';
  text: string;
}

export function AiSection({ onOpenSettings }: { onOpenSettings: () => void }) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getAiSettings()
      .then((r) => setConfigured(r.configured))
      .catch(() => setConfigured(false));
  }, []);

  async function send() {
    const question = input.trim();
    if (!question || busy) return;
    setInput('');
    setError('');
    setBusy(true);
    setMessages((m) => [...m, { role: 'user', text: question }]);
    try {
      const res = await api.askAi(question);
      setMessages((m) => [...m, { role: 'ai', text: res.answer }]);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) setConfigured(false);
      setError(err instanceof ApiError ? err.message : 'কিছু একটা ভুল হয়েছে।');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="section-title">AI সহায়ক</h2>
      <div className="ai-note">
        <Icon name="spark" size={18} />
        <span>
          এই AI শুধু এই অ্যাপের তথ্য থেকে উত্তর দেয় — 60 দিনের প্ল্যান, ধাপ গাইড, টেকনিক, কিউ কার্ড, মক
          টেস্ট, ফরম্যাট। অ্যাপের বাইরের কিছু জানতে চাইলে সে পরিষ্কার করে বলবে যে এটা অ্যাপে নেই।
        </span>
      </div>

      {configured === null && <p className="muted">লোড হচ্ছে…</p>}

      {configured === false && (
        <div className="card">
          <h3>AI এখনো সেটআপ করা হয়নি</h3>
          <p className="muted">
            তোমার নিজের API key দিয়ে চালাও — FreeModel (Claude), Gemini, বা যেকোনো OpenAI-compatible
            API। Key তোমার অ্যাকাউন্টে encrypt করে রাখা হয়।
          </p>
          <button type="button" className="btn btn-primary" onClick={onOpenSettings}>
            Settings → AI-তে সেটআপ করো
          </button>
        </div>
      )}

      {configured === true && (
        <div>
          <div className="ai-thread" aria-live="polite">
            {messages.length === 0 && (
              <p className="muted">
                যেমন: “আজকে কী পড়বো?”, “Day 10-এর task কী?”, “Listening-এ ভালো করার ধাপ কী?”, “মক
                টেস্ট কবে কবে?”
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role}`}>
                <span className="ai-msg-role">{m.role === 'user' ? 'তুমি' : 'AI সহায়ক'}</span>
                <span className="ai-msg-text">{m.text}</span>
              </div>
            ))}
            {busy && (
              <div className="ai-msg ai">
                <span className="ai-msg-role">AI সহায়ক</span>
                <span className="ai-msg-text muted">ভাবছে…</span>
              </div>
            )}
          </div>
          {error && (
            <div className="alert" role="alert">
              <Icon name="alert" size={18} />
              <span>{error}</span>
            </div>
          )}
          <form
            className="ai-composer"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              type="text"
              value={input}
              maxLength={1000}
              onChange={(e) => setInput(e.target.value)}
              placeholder="প্রশ্ন লেখো…"
              aria-label="AI-কে প্রশ্ন করো"
              disabled={busy}
            />
            <button type="submit" className="btn btn-primary" disabled={busy || input.trim().length === 0}>
              পাঠাও
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
