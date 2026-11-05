import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { MessageCircle, X, Send, RotateCcw } from "lucide-react";
import { chatWithRankora } from "@/lib/public.functions";

type Msg = { role: "user" | "assistant"; content: string; createdAt?: number };

const STORAGE_KEY = "rankora-chat";
const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi, I'm **Rank** — your Rankora guide. 👋\n\nI can help you audit a site, understand your score, pick the right AI agent, or improve your rankings. What are you working on?",
};

const QUICK = [
  "How do I audit my website?",
  "What does each AI agent do?",
  "How can I improve my SEO score?",
  "Connect Google Search Console",
];

function formatTime(timestamp?: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp ? new Date(timestamp) : new Date());
}

export function ChatWidget() {
  const chat = useServerFn(chatWithRankora);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // restore conversation so a refresh keeps the user where they left off
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Msg[];
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages, busy]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setError(null);
    setInput("");
    const next = [...messages, { role: "user" as const, content: clean, createdAt: Date.now() }];
    setMessages(next);
    setBusy(true);
    try {
      const history = next.filter((m) => m !== GREETING).slice(-16);
      const res = await chat({ data: { messages: history } });
      setMessages([...next, { role: "assistant", content: res.reply, createdAt: Date.now() }]);
    } catch (e) {
      setError((e as Error).message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Rankora assistant" : "Open Rankora assistant"}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-royal via-primary to-violet text-white shadow-2xl neon-glow transition hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald ring-2 ring-background animate-pulse-glow" />
        )}
      </button>

      {/* Panel */}
      <div
        className={`fixed bottom-24 right-5 z-50 flex w-[min(94vw,400px)] origin-bottom-right flex-col overflow-hidden rounded-3xl glass-strong gradient-border shadow-2xl transition-all duration-300 ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
        style={{ height: "min(70vh, 560px)" }}
        role="dialog"
        aria-label="Rankora assistant"
      >
        <header className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-royal via-primary to-violet text-white">
            <svg
              viewBox="0 0 24 24"
              className="h-4.5 w-4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M4 18V9" />
              <path d="M10 18V5" />
              <path d="M16 18v-6" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold leading-tight">Rank · Rankora Assistant</div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> Online — usually replies
              instantly
            </div>
          </div>
          <button
            onClick={() => setMessages([GREETING])}
            title="New conversation"
            aria-label="New conversation"
            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="chat-message flex justify-end">
                <div className="chat-bubble chat-bubble-user max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground">
                  {m.content}
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-primary-foreground/70">
                    <span>{formatTime(m.createdAt)}</span>
                    <span aria-label="Sent and delivered">✓✓</span>
                  </div>
                </div>
              </div>
            ) : (
              <div key={i} className="chat-message flex items-end gap-2">
                <div className="chat-avatar grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-royal via-primary to-violet text-xs font-semibold text-white">
                  R
                </div>
                <div className="chat-bubble chat-bubble-assistant max-w-[88%] rounded-2xl rounded-bl-md px-3.5 py-2 text-sm leading-relaxed text-foreground chat-md">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {formatTime(m.createdAt)}
                  </div>
                </div>
              </div>
            ),
          )}

          {busy && (
            <div className="chat-message flex items-end gap-2">
              <div className="chat-avatar grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-royal via-primary to-violet text-xs font-semibold text-white">
                R
              </div>
              <div
                className="chat-bubble chat-bubble-assistant flex items-center gap-1 rounded-2xl rounded-bl-md px-4 py-3"
                aria-label="Rank is typing"
              >
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
                <span className="ml-1 text-[11px] text-muted-foreground">Typing…</span>
              </div>
            </div>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}

          {messages.length <= 1 && !busy && (
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-border/70 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-border/60 p-3"
        >
          <div className="flex items-end gap-2 rounded-2xl border border-border/70 bg-input/50 px-3 py-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask about your SEO, score or next steps…"
              className="max-h-28 flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={busy || !input.trim()}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-violet text-primary-foreground transition disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
