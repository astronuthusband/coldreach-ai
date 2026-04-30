import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#fff8ee",
  card: "#ffffff",
  border: "#f0d9b0",
  text: "#1e1a14",
  muted: "#7a6e5f",
  faint: "#b0a090",
  orange: "#f07000",
  orangeHover: "#d96200",
  orangeLight: "#fff0e0",
  orangeFaint: "#fde8cc",
  green: "#1a7a50",
  greenBg: "#eafaf2",
  amber: "#c47a00",
  amberBg: "#fff8e0",
  red: "#c43030",
  redBg: "#fff0f0",
};

const TONES = [
  { id: "formal", label: "Formal", desc: "Professional & polished" },
  { id: "neutral", label: "Neutral", desc: "Balanced & clear" },
  { id: "confident", label: "Confident", desc: "Direct & assured" },
  { id: "bold", label: "Bold", desc: "Assertive & energetic" },
];

async function generateEmails({ url, bio, tone }) {
  const toneGuide = {
    formal: "formal, measured, professional — like a seasoned consultant writing to a board member",
    neutral: "clear, human, and direct — like a smart colleague reaching out for the first time",
    confident: "self-assured and clear — makes a strong case without being pushy",
    bold: "high-energy, assertive, and punchy — gets to the point fast, no fluff",
  }[tone];

  const prompt = `You are an expert B2B cold email copywriter. A user wants to send a cold email to a prospect.

Company website: ${url}
Prospect bio/background: ${bio}
Tone: ${toneGuide}

STRICT RULES:
- Never use "Hope this email finds you well", "I came across your company", "I wanted to reach out", "touching base", "circle back", "synergy", "leverage", "game-changer", "revolutionary", "disruptive"
- Every email must reference something SPECIFIC from the company URL context and the person's actual role/background
- Write like a real human, not a robot
- Subject lines must be intriguing and specific
- Follow-ups must be short, add new value

Return ONLY valid JSON with this exact structure (no markdown, no preamble, no backticks):
{
  "emails": [
    { "id": 1, "variant": "Direct Value", "subject": "...", "body": "..." },
    { "id": 2, "variant": "Insight-Led", "subject": "...", "body": "..." },
    { "id": 3, "variant": "Challenge-First", "subject": "...", "body": "..." }
  ],
  "subjectLines": ["subject 1","subject 2","subject 3","subject 4","subject 5"],
  "followUps": [
    { "id": 1, "delay": "3 days later", "body": "..." },
    { "id": 2, "delay": "1 week later", "body": "..." }
  ],
  "cringeScore": 25,
  "cringeReason": "one sentence explaining the score"
}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.REACT_APP_ANTHROPIC_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(JSON.stringify(errData));
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} style={{
      fontSize: 12, padding: "4px 10px", borderRadius: 6,
      border: `1px solid ${C.border}`, background: copied ? C.greenBg : C.card,
      color: copied ? C.green : C.muted,
      transition: "all 0.2s", fontFamily: "inherit", whiteSpace: "nowrap",
    }}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function CringeGauge({ score, reason }) {
  const color = score <= 30 ? C.green : score <= 60 ? C.amber : C.red;
  const bgColor = score <= 30 ? C.greenBg : score <= 60 ? C.amberBg : C.redBg;
  const label = score <= 30 ? "Excellent" : score <= 60 ? "Decent" : "Needs Work";
  return (
    <div style={{ background: bgColor, border: `1.5px solid ${color}22`, borderRadius: 14, padding: "20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>Cringe Score</div>
          <div style={{ fontSize: 32, fontWeight: 700, color, letterSpacing: "-1px" }}>{score}</div>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color, background: `${color}18`, border: `1px solid ${color}30`, padding: "4px 12px", borderRadius: 20 }}>
          {label}
        </span>
      </div>
      <div style={{ background: `${color}20`, borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ width: `${score}%`, height: "100%", borderRadius: 99, background: color, transition: "width 1s ease" }} />
      </div>
      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{reason}</div>
    </div>
  );
}

function EmailCard({ email, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  const variantColors = [
    { bg: "#f5f0ff", accent: "#6b4de6" },
    { bg: "#f0f8ff", accent: "#2a7abf" },
    { bg: "#f5fff0", accent: "#2a8a50" },
  ];
  const vc = variantColors[index % 3];
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: expanded ? "0 4px 24px rgba(0,0,0,0.06)" : "none" }}>
      <div onClick={() => setExpanded(!expanded)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: expanded ? vc.bg : C.card }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: vc.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{index + 1}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{email.variant}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Subject: {email.subject}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CopyButton text={`Subject: ${email.subject}\n\n${email.body}`} />
          <span style={{ color: C.faint, fontSize: 16, transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>›</span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ height: 1, background: C.border, margin: "0 0 16px" }} />
          <pre style={{ fontFamily: "inherit", fontSize: 14, lineHeight: 1.8, color: C.text, whiteSpace: "pre-wrap", margin: 0 }}>{email.body}</pre>
        </div>
      )}
    </div>
  );
}

function FollowUpCard({ followUp, index }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: C.orange, background: C.orangeLight, padding: "3px 8px", borderRadius: 6 }}>Follow-up {index + 1}</span>
          <span style={{ fontSize: 12, color: C.faint }}>{followUp.delay}</span>
        </div>
        <CopyButton text={followUp.body} />
      </div>
      <pre style={{ fontFamily: "inherit", fontSize: 14, lineHeight: 1.75, color: C.text, whiteSpace: "pre-wrap", margin: 0 }}>{followUp.body}</pre>
    </div>
  );
}

function LoadingState() {
  const [step, setStep] = useState(0);
  const steps = ["Analyzing company context...", "Researching your prospect...", "Crafting personalized emails...", "Scoring for cringe..."];
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % steps.length), 1600);
    return () => clearInterval(t);
  }, [steps.length]);
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", border: `3px solid ${C.orangeFaint}`, borderTop: `3px solid ${C.orange}`, animation: "spin 0.8s linear infinite", margin: "0 auto 24px" }} />
      <div style={{ fontSize: 15, color: C.muted }}>{steps[step]}</div>
    </div>
  );
}

function HistoryPanel({ history, onLoad, onClear }) {
  if (!history.length) return null;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Recent generations</span>
        <button onClick={onClear} style={{ fontSize: 12, color: C.faint, background: "none", border: "none", fontFamily: "inherit" }}>Clear history</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {history.slice(0, 3).map((item, i) => (
          <button key={i} onClick={() => onLoad(item)} style={{ textAlign: "left", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, fontFamily: "inherit", fontSize: 13, color: C.muted }}>
            <span style={{ color: C.text, fontWeight: 500 }}>{item.url.replace(/^https?:\/\//, "").split("/")[0]}</span>
            {" · "}{item.tone} · {new Date(item.ts).toLocaleDateString()}
          </button>
        ))}
      </div>
    </div>
  );
}

// Custom cursor — rendered once, works across both views
function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;

    const move = (e) => {
      if (dot) { dot.style.left = e.clientX + "px"; dot.style.top = e.clientY + "px"; }
      if (ring) { ring.style.left = e.clientX + "px"; ring.style.top = e.clientY + "px"; }
    };

    const grow = () => {
      if (ring) { ring.style.width = "48px"; ring.style.height = "48px"; ring.style.opacity = "0.5"; }
    };
    const shrink = () => {
      if (ring) { ring.style.width = "32px"; ring.style.height = "32px"; ring.style.opacity = "1"; }
    };

    window.addEventListener("mousemove", move);

    // Attach hover effects and re-attach whenever new elements appear
    const attachHover = () => {
      document.querySelectorAll("button, a, input, textarea").forEach((el) => {
        el.removeEventListener("mouseenter", grow);
        el.removeEventListener("mouseleave", shrink);
        el.addEventListener("mouseenter", grow);
        el.addEventListener("mouseleave", shrink);
      });
    };

    attachHover();
    const observer = new MutationObserver(attachHover);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", move);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={dotRef} style={{
        width: 8, height: 8,
        background: C.orange,
        borderRadius: "50%",
        position: "fixed",
        pointerEvents: "none",
        zIndex: 9999,
        transform: "translate(-50%, -50%)",
        top: -20, left: -20,
      }} />
      <div ref={ringRef} style={{
        width: 32, height: 32,
        border: `1.5px solid ${C.orange}`,
        borderRadius: "50%",
        position: "fixed",
        pointerEvents: "none",
        zIndex: 9998,
        transform: "translate(-50%, -50%)",
        transition: "left 0.1s ease, top 0.1s ease, width 0.2s ease, height 0.2s ease, opacity 0.2s ease",
        top: -20, left: -20,
      }} />
    </>
  );
}

export default function ColdReachAI() {
  const [view, setView] = useState("landing");
  const [url, setUrl] = useState("");
  const [bio, setBio] = useState("");
  const [tone, setTone] = useState("neutral");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("coldreach_history") || "[]"); } catch { return []; }
  });
  const resultsRef = useRef(null);

  const saveHistory = (item) => {
    const updated = [item, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("coldreach_history", JSON.stringify(updated));
  };

  const generate = async () => {
    if (!url.trim() || !bio.trim()) { setError("Please fill in both fields before generating."); return; }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await generateEmails({ url, bio, tone });
      setResult(data);
      saveHistory({ url, bio, tone, ts: Date.now() });
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setError("Generation failed: " + e.message);
    }
    setLoading(false);
  };

  const loadHistory = (item) => { setUrl(item.url); setBio(item.bio); setTone(item.tone); setResult(null); };

  // All global styles in one place
  const globalStyles = `
    * { box-sizing: border-box; margin: 0; padding: 0; cursor: none !important; }
    ::placeholder { color: ${C.faint}; }
    textarea:focus, input:focus { outline: 2px solid ${C.orange}40; outline-offset: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .f1 { animation: fadeUp 0.6s ease both; }
    .f2 { animation: fadeUp 0.6s 0.15s ease both; }
    .f3 { animation: fadeUp 0.6s 0.3s ease both; }
    .f4 { animation: fadeUp 0.6s 0.45s ease both; }
    .result-fade { animation: fadeIn 0.4s ease both; }
  `;

  // ─── Landing ──────────────────────────────────────────────────
  if (view === "landing") {
    return (
      <div style={{ fontFamily: "Georgia, serif", background: C.bg, minHeight: "100vh" }}>
        <style>{globalStyles}</style>
        <CustomCursor />

        <nav style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: C.orange, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "system-ui, sans-serif", color: C.text }}>ColdReach AI</span>
          </div>
          <button onClick={() => setView("app")} style={{ fontSize: 13, padding: "8px 18px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.text, fontFamily: "inherit", fontWeight: 500 }}>
            Open App →
          </button>
        </nav>

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 40px 60px", textAlign: "center" }}>
          <div className="f1" style={{ display: "inline-block", fontSize: 12, fontFamily: "system-ui, sans-serif", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.orange, background: C.orangeLight, padding: "5px 14px", borderRadius: 20, marginBottom: 28, border: `1px solid ${C.orangeFaint}` }}>
            AI-powered cold outreach
          </div>
          <h1 className="f2" style={{ fontSize: "clamp(36px, 6vw, 60px)", lineHeight: 1.1, color: C.text, marginBottom: 20, letterSpacing: "-2px" }}>
            Cold emails that<br /><span style={{ color: C.orange }}>actually get replies.</span>
          </h1>
          <p className="f3" style={{ fontSize: 18, color: C.muted, lineHeight: 1.7, fontFamily: "system-ui, sans-serif", maxWidth: 520, margin: "0 auto 40px" }}>
            Paste a company URL and a prospect's bio. Get 3 personalized emails, 5 subject lines, 2 follow-ups — and a cringe score.
          </p>
          <div className="f4">
            <button
              onClick={() => setView("app")}
              style={{ fontSize: 16, fontWeight: 600, padding: "16px 36px", borderRadius: 12, border: "none", background: C.orange, color: "#fff", fontFamily: "system-ui, sans-serif" }}
              onMouseEnter={e => e.target.style.background = C.orangeHover}
              onMouseLeave={e => e.target.style.background = C.orange}
            >
              Generate My Emails
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 40px 80px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { icon: "✉", title: "3 email variants", desc: "Direct, insight-led, challenge-first — pick the style that fits." },
              { icon: "◈", title: "Cringe score", desc: "Instant feedback on how generic or spammy your email sounds." },
              { icon: "↩", title: "Follow-ups included", desc: "Two ready-to-send follow-ups with built-in delay suggestions." },
              { icon: "◎", title: "Tone control", desc: "From formal to bold — the AI adapts to your voice." },
            ].map(f => (
              <div key={f.title} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px" }}>
                <div style={{ fontSize: 22, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6, fontFamily: "system-ui, sans-serif" }}>{f.title}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, fontFamily: "system-ui, sans-serif" }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── App ──────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: C.bg, minHeight: "100vh" }}>
      <style>{globalStyles}</style>
      <CustomCursor />

      <nav style={{ padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, background: C.bg, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => setView("landing")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none" }}>
          <div style={{ width: 24, height: 24, background: C.orange, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>ColdReach AI</span>
        </button>
        <span style={{ fontSize: 12, color: C.faint }}>Powered by Groq · Llama 3.3</span>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 80px" }}>
        <HistoryPanel history={history} onLoad={loadHistory} onClear={() => { setHistory([]); localStorage.removeItem("coldreach_history"); }} />

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px", marginBottom: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4, letterSpacing: "-0.4px" }}>Generate personalized emails</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Paste the company URL and your prospect's bio to get started.</p>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>Company website URL</label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://stripe.com"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, fontSize: 14, color: C.text, fontFamily: "inherit" }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>Prospect's LinkedIn bio or description</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Paste their LinkedIn About section, job description, or any background info here..."
              rows={5}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, fontSize: 14, color: C.text, fontFamily: "inherit", resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 12 }}>Tone</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)} style={{ padding: "10px 8px", borderRadius: 10, border: tone === t.id ? `2px solid ${C.orange}` : `1px solid ${C.border}`, background: tone === t.id ? C.orangeLight : C.bg, fontFamily: "inherit", transition: "all 0.15s", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: tone === t.id ? C.orange : C.text, marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.3 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: C.redBg, border: `1px solid ${C.red}30`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.red }}>
              {error}
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading ? C.faint : C.orange, color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "inherit", transition: "background 0.2s" }}
            onMouseEnter={e => !loading && (e.target.style.background = C.orangeHover)}
            onMouseLeave={e => !loading && (e.target.style.background = C.orange)}
          >
            {loading ? "Generating..." : "Generate emails →"}
          </button>
        </div>

        {loading && <LoadingState />}

        {result && !loading && (
          <div ref={resultsRef} className="result-fade">
            <div style={{ marginBottom: 20 }}>
              <CringeGauge score={result.cringeScore} reason={result.cringeReason} />
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
                <span>Subject lines</span>
                <span style={{ fontSize: 12, color: C.faint, fontWeight: 400 }}>{result.subjectLines.length} options</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.subjectLines.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", borderRadius: 8, background: C.bg, gap: 12 }}>
                    <span style={{ fontSize: 13, color: C.text, flex: 1 }}>{s}</span>
                    <CopyButton text={s} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>Email variants</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.emails.map((email, i) => <EmailCard key={email.id} email={email} index={i} />)}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>Follow-up messages</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.followUps.map((f, i) => <FollowUpCard key={f.id} followUp={f} index={i} />)}
              </div>
            </div>

            <button
              onClick={generate}
              style={{ width: "100%", padding: "13px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, color: C.text, fontSize: 14, fontWeight: 600, fontFamily: "inherit", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.background = C.orangeLight; e.target.style.borderColor = C.orange; e.target.style.color = C.orange; }}
              onMouseLeave={e => { e.target.style.background = C.card; e.target.style.borderColor = C.border; e.target.style.color = C.text; }}
            >
              ↺ Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}