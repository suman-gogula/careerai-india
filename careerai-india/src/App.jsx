import { useState, useEffect, useRef } from "react";

const THEMES = {
  dark: {
    bg: "#070B14",
    surface: "#0D1526",
    card: "#111827",
    border: "#1E2D45",
    accent: "#F97316",
    accent2: "#3B82F6",
    accent3: "#10B981",
    text: "#F1F5F9",
    muted: "#64748B",
    subtle: "#1E293B",
  },
};

const T = THEMES.dark;

// ─── Dummy data ──────────────────────────────────────────────────────────────
const SCORE_DATA = {
  overall: 74,
  ats: 68,
  recruiter: 81,
  impact: 72,
  keywords: 65,
  sections: [
    { label: "Contact Info", score: 95, color: "#10B981" },
    { label: "Work Experience", score: 78, color: "#3B82F6" },
    { label: "Skills", score: 62, color: "#F97316" },
    { label: "Education", score: 88, color: "#10B981" },
    { label: "Achievements", score: 55, color: "#EF4444" },
    { label: "Summary", score: 70, color: "#F97316" },
  ],
};

const CAREER_PATHS = [
  { title: "Full Stack Developer", match: 87, salary: "₹12–28 LPA", trend: "↑ High Demand" },
  { title: "Data Scientist", match: 74, salary: "₹15–40 LPA", trend: "↑ Very High" },
  { title: "DevOps Engineer", match: 68, salary: "₹10–25 LPA", trend: "↑ Growing" },
  { title: "Product Manager", match: 61, salary: "₹18–50 LPA", trend: "→ Stable" },
];

const SKILL_GAPS = [
  { skill: "System Design", priority: "High", timeToLearn: "3–4 months" },
  { skill: "AWS/Cloud", priority: "High", timeToLearn: "2–3 months" },
  { skill: "Docker & K8s", priority: "Medium", timeToLearn: "1–2 months" },
  { skill: "TypeScript", priority: "Medium", timeToLearn: "3–4 weeks" },
];

const INTERVIEW_QUESTIONS = [
  "Tell me about a time you optimized a slow database query.",
  "How would you design a URL shortening service?",
  "What's your approach to code reviews?",
  "Describe your experience with microservices architecture.",
];

const NAV = [
  { id: "score", icon: "◈", label: "AI Score" },
  { id: "match", icon: "⬡", label: "Job Match" },
  { id: "career", icon: "◉", label: "Career Path" },
  { id: "interview", icon: "◆", label: "Interview AI" },
  { id: "skills", icon: "▲", label: "Skill Map" },
];

// ─── Utility components ───────────────────────────────────────────────────────
function CircleGauge({ value, size = 120, strokeWidth = 10, color = T.accent, label }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    let start = null;
    const duration = 1200;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setAnimated(Math.round(ease * value));
      if (p < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${(animated / 100) * circ} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.05s linear", filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 2,
      }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: T.text, fontFamily: "'Space Mono', monospace" }}>
          {animated}
        </span>
        {label && <span style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>}
      </div>
    </div>
  );
}

function BarGauge({ label, value, color }) {
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(() => setW(value), 100); }, [value]);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: T.muted }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "monospace" }}>{value}</span>
      </div>
      <div style={{ height: 6, background: T.border, borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99, background: color,
          width: `${w}%`, transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 8px ${color}66`,
        }} />
      </div>
    </div>
  );
}

function Badge({ text, color = T.accent }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
      padding: "3px 8px", borderRadius: 4, background: `${color}22`, color, border: `1px solid ${color}44`,
    }}>{text}</span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 16,
      padding: 24, ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ children, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <span style={{ fontSize: 16, color: T.accent }}>{icon}</span>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: 0.5 }}>{children}</h2>
    </div>
  );
}

// ─── Panels ───────────────────────────────────────────────────────────────────
function ScorePanel() {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => { setUploading(false); setUploaded(true); }, 1200);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setLoading(true);
    setFeedback("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are an expert Indian career coach and ATS specialist. A fresher/professional has uploaded their resume for analysis on CareerAI India platform.

Generate a CONCISE, actionable resume analysis in this exact JSON structure (no markdown, raw JSON only):
{
  "topStrength": "one key strength in 1 sentence",
  "criticalFix": "the single most important fix needed",
  "atsWarning": "specific ATS issue detected",
  "indianMarketTip": "India-specific career advice for IT/tech sector",
  "quickWins": ["action 1", "action 2", "action 3"]
}`,
          }],
        }),
      });
      const data = await res.json();
      const raw = data.content.map(i => i.text || "").join("");
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setFeedback(parsed);
    } catch {
      setFeedback({ topStrength: "Strong educational background with relevant projects", criticalFix: "Add quantified achievements (e.g. 'Reduced load time by 40%')", atsWarning: "Missing keywords: REST API, Agile, CI/CD", indianMarketTip: "Add CGPA if above 7.5; mention internships prominently for campus placements", quickWins: ["Add a professional summary", "Quantify every bullet point", "Add GitHub/portfolio URL"] });
    }
    setLoading(false);
    setAnalyzing(false);
    setDone(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Upload zone */}
      <Card>
        <SectionTitle icon="◈">Resume Upload & AI Analysis</SectionTitle>
        {!uploaded ? (
          <div
            onClick={handleUpload}
            style={{
              border: `2px dashed ${T.border}`, borderRadius: 12, padding: "40px 24px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
              cursor: "pointer", transition: "all 0.3s",
              background: uploading ? `${T.accent}08` : "transparent",
            }}
          >
            <div style={{ fontSize: 36 }}>📄</div>
            <div style={{ color: T.text, fontWeight: 600 }}>
              {uploading ? "Uploading…" : "Drop your resume here"}
            </div>
            <div style={{ color: T.muted, fontSize: 13 }}>PDF, DOCX, PNG supported • English + Hindi</div>
            <div style={{
              padding: "10px 24px", background: T.accent, color: "#fff",
              borderRadius: 8, fontWeight: 700, fontSize: 14,
            }}>
              {uploading ? "Processing…" : "Upload Resume"}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12, padding: 16,
              background: `${T.accent3}11`, border: `1px solid ${T.accent3}33`, borderRadius: 10,
            }}>
              <span style={{ fontSize: 24 }}>✅</span>
              <div>
                <div style={{ color: T.text, fontWeight: 600 }}>resume_priya_sharma.pdf</div>
                <div style={{ color: T.muted, fontSize: 12 }}>2.3 MB • Uploaded successfully</div>
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              style={{
                padding: "14px 24px", background: analyzing ? T.muted : `linear-gradient(135deg, ${T.accent}, #EC4899)`,
                color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15,
                cursor: analyzing ? "wait" : "pointer", letterSpacing: 0.5,
                boxShadow: analyzing ? "none" : `0 0 24px ${T.accent}44`,
              }}
            >
              {analyzing ? "🤖 Analyzing with AI…" : "⚡ Analyze with CareerAI"}
            </button>
          </div>
        )}
      </Card>

      {/* Score cards */}
      {done && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {[
              { label: "Overall Score", value: SCORE_DATA.overall, color: T.accent },
              { label: "ATS Score", value: SCORE_DATA.ats, color: T.accent2 },
              { label: "Recruiter Score", value: SCORE_DATA.recruiter, color: T.accent3 },
              { label: "Impact Score", value: SCORE_DATA.impact, color: "#A78BFA" },
            ].map(({ label, value, color }) => (
              <Card key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 20 }}>
                <CircleGauge value={value} size={90} strokeWidth={8} color={color} />
                <div style={{ fontSize: 12, color: T.muted, textAlign: "center" }}>{label}</div>
              </Card>
            ))}
          </div>

          {/* Section scores */}
          <Card>
            <SectionTitle icon="▦">Section-wise Breakdown</SectionTitle>
            {SCORE_DATA.sections.map(({ label, score, color }) => (
              <BarGauge key={label} label={label} value={score} color={color} />
            ))}
          </Card>

          {/* AI Feedback */}
          <Card style={{ border: `1px solid ${T.accent}44`, background: `${T.accent}08` }}>
            <SectionTitle icon="🤖">AI Career Mentor Insights</SectionTitle>
            {loading ? (
              <div style={{ color: T.muted, fontSize: 14 }}>Generating AI insights…</div>
            ) : feedback && typeof feedback === "object" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ padding: 14, background: `${T.accent3}15`, borderRadius: 10, borderLeft: `3px solid ${T.accent3}` }}>
                  <div style={{ fontSize: 11, color: T.accent3, fontWeight: 700, marginBottom: 4 }}>💪 TOP STRENGTH</div>
                  <div style={{ fontSize: 14, color: T.text }}>{feedback.topStrength}</div>
                </div>
                <div style={{ padding: 14, background: `${T.accent}15`, borderRadius: 10, borderLeft: `3px solid ${T.accent}` }}>
                  <div style={{ fontSize: 11, color: T.accent, fontWeight: 700, marginBottom: 4 }}>🔧 CRITICAL FIX</div>
                  <div style={{ fontSize: 14, color: T.text }}>{feedback.criticalFix}</div>
                </div>
                <div style={{ padding: 14, background: "#EF444415", borderRadius: 10, borderLeft: "3px solid #EF4444" }}>
                  <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, marginBottom: 4 }}>⚠️ ATS WARNING</div>
                  <div style={{ fontSize: 14, color: T.text }}>{feedback.atsWarning}</div>
                </div>
                <div style={{ padding: 14, background: `${T.accent2}15`, borderRadius: 10, borderLeft: `3px solid ${T.accent2}` }}>
                  <div style={{ fontSize: 11, color: T.accent2, fontWeight: 700, marginBottom: 4 }}>🇮🇳 INDIA MARKET TIP</div>
                  <div style={{ fontSize: 14, color: T.text }}>{feedback.indianMarketTip}</div>
                </div>
                <div style={{ padding: 14, background: `${T.subtle}`, borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, marginBottom: 10 }}>⚡ QUICK WINS</div>
                  {(feedback.quickWins || []).map((w, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                      <span style={{ color: T.accent, fontWeight: 700, minWidth: 20 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, color: T.text }}>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
        </>
      )}
    </div>
  );
}

function JobMatchPanel() {
  const [jd, setJd] = useState("");
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState(null);

  const handleMatch = async () => {
    if (!jd.trim()) return;
    setMatching(true);
    setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are an Indian ATS and recruitment specialist. Analyze this job description and return ONLY raw JSON (no markdown):

Job Description: "${jd}"

Return:
{
  "matchScore": <number 0-100>,
  "missingKeywords": ["kw1","kw2","kw3"],
  "matchedKeywords": ["kw1","kw2"],
  "interviewProbability": <number 0-100>,
  "salaryRange": "₹X–Y LPA",
  "topAdvice": "one actionable sentence to improve match"
}`,
          }],
        }),
      });
      const data = await res.json();
      const raw = data.content.map(i => i.text || "").join("");
      const clean = raw.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch {
      setResult({ matchScore: 71, missingKeywords: ["System Design", "Kubernetes", "GraphQL"], matchedKeywords: ["React", "Node.js", "MongoDB", "REST API"], interviewProbability: 58, salaryRange: "₹12–18 LPA", topAdvice: "Add a System Design project to your GitHub to improve match by ~15%" });
    }
    setMatching(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle icon="⬡">Job Description Matcher</SectionTitle>
        <textarea
          value={jd}
          onChange={e => setJd(e.target.value)}
          placeholder="Paste the job description here…"
          style={{
            width: "100%", minHeight: 140, background: T.subtle, border: `1px solid ${T.border}`,
            borderRadius: 10, color: T.text, padding: 14, fontSize: 13, resize: "vertical",
            outline: "none", fontFamily: "inherit", boxSizing: "border-box",
          }}
        />
        <button
          onClick={handleMatch}
          disabled={!jd.trim() || matching}
          style={{
            marginTop: 12, padding: "12px 24px", background: matching ? T.muted : T.accent2,
            color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: matching ? "wait" : "pointer",
            width: "100%", fontSize: 14,
          }}
        >
          {matching ? "Matching…" : "⬡ Analyze Job Match"}
        </button>
      </Card>

      {result && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <CircleGauge value={result.matchScore} size={100} color={result.matchScore > 70 ? T.accent3 : T.accent} />
              <div style={{ fontSize: 12, color: T.muted }}>Match Score</div>
            </Card>
            <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <CircleGauge value={result.interviewProbability} size={100} color="#A78BFA" />
              <div style={{ fontSize: 12, color: T.muted }}>Interview Probability</div>
            </Card>
          </div>

          <Card>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>✅ MATCHED KEYWORDS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.matchedKeywords.map(k => <Badge key={k} text={k} color={T.accent3} />)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>❌ MISSING KEYWORDS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.missingKeywords.map(k => <Badge key={k} text={k} color="#EF4444" />)}
              </div>
            </div>
          </Card>

          <Card style={{ border: `1px solid ${T.accent2}33` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ color: T.muted, fontSize: 13 }}>Expected Salary</span>
              <span style={{ color: T.accent3, fontWeight: 800, fontSize: 18, fontFamily: "monospace" }}>{result.salaryRange}</span>
            </div>
            <div style={{ padding: 14, background: `${T.accent2}11`, borderRadius: 8, fontSize: 13, color: T.text }}>
              💡 {result.topAdvice}
            </div>
          </Card>
        </>
      )}

      {/* Career paths */}
      <Card>
        <SectionTitle icon="◉">Best Matching Roles for You</SectionTitle>
        {CAREER_PATHS.map(({ title, match, salary, trend }) => (
          <div key={title} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "12px 0",
            borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: `linear-gradient(135deg, ${T.accent2}33, ${T.accent3}33)`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>💼</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{title}</div>
              <div style={{ color: T.muted, fontSize: 12 }}>{salary}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: match > 80 ? T.accent3 : T.accent, fontWeight: 800, fontFamily: "monospace" }}>{match}%</div>
              <div style={{ fontSize: 10, color: T.muted }}>{trend}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function CareerPanel() {
  const [goal, setGoal] = useState("");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRoadmap = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setRoadmap(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are an Indian career coach. Create a realistic career roadmap for someone targeting: "${goal}".
Return ONLY raw JSON (no markdown):
{
  "timeframe": "X months",
  "targetSalary": "₹X LPA",
  "steps": [
    {"month": "Month 1-2", "focus": "topic", "action": "specific action", "resource": "course/platform name"},
    {"month": "Month 3-4", "focus": "topic", "action": "specific action", "resource": "course/platform name"},
    {"month": "Month 5-6", "focus": "topic", "action": "specific action", "resource": "course/platform name"}
  ],
  "indianCompanies": ["Company1","Company2","Company3"],
  "certifications": ["Cert1","Cert2"]
}`,
          }],
        }),
      });
      const data = await res.json();
      const raw = data.content.map(i => i.text || "").join("");
      const clean = raw.replace(/```json|```/g, "").trim();
      setRoadmap(JSON.parse(clean));
    } catch {
      setRoadmap({ timeframe: "6 months", targetSalary: "₹12–18 LPA", steps: [{ month: "Month 1–2", focus: "Core Skills", action: "Complete DSA on LeetCode (Easy + Medium)", resource: "Striver's DSA Sheet" }, { month: "Month 3–4", focus: "System Design", action: "Build 2 full-stack projects with REST APIs", resource: "Neetcode.io + freeCodeCamp" }, { month: "Month 5–6", focus: "Job Hunt", action: "Apply to 20 companies/week, mock interviews daily", resource: "Pramp + InterviewBit" }], indianCompanies: ["Infosys", "Wipro", "TCS", "Zomato", "Razorpay"], certifications: ["AWS Cloud Practitioner", "Meta Front-End Developer"] });
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle icon="◉">AI Career Roadmap Generator</SectionTitle>
        <input
          value={goal}
          onChange={e => setGoal(e.target.value)}
          placeholder="e.g. Senior Data Scientist at a Bangalore startup"
          style={{
            width: "100%", padding: "12px 14px", background: T.subtle,
            border: `1px solid ${T.border}`, borderRadius: 8, color: T.text,
            fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
          }}
        />
        <button
          onClick={handleRoadmap}
          disabled={!goal.trim() || loading}
          style={{
            marginTop: 12, padding: "12px 24px", background: loading ? T.muted : `linear-gradient(135deg, #7C3AED, ${T.accent2})`,
            color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: loading ? "wait" : "pointer",
            width: "100%", fontSize: 14,
          }}
        >
          {loading ? "Generating Roadmap…" : "◉ Generate My Career Roadmap"}
        </button>
      </Card>

      {roadmap && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>🗓</div>
              <div style={{ color: T.text, fontWeight: 800, fontSize: 18 }}>{roadmap.timeframe}</div>
              <div style={{ color: T.muted, fontSize: 12 }}>Timeline</div>
            </Card>
            <Card style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>💰</div>
              <div style={{ color: T.accent3, fontWeight: 800, fontSize: 18 }}>{roadmap.targetSalary}</div>
              <div style={{ color: T.muted, fontSize: 12 }}>Target Salary</div>
            </Card>
          </div>

          <Card>
            <SectionTitle icon="▲">Your Roadmap</SectionTitle>
            {roadmap.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, #7C3AED, ${T.accent2})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0,
                  }}>{i + 1}</div>
                  {i < roadmap.steps.length - 1 && <div style={{ width: 2, flex: 1, background: T.border, marginTop: 4 }} />}
                </div>
                <div style={{ paddingBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#A78BFA", fontWeight: 700, marginBottom: 2 }}>{step.month}</div>
                  <div style={{ color: T.text, fontWeight: 600, marginBottom: 4 }}>{step.focus}</div>
                  <div style={{ color: T.muted, fontSize: 13, marginBottom: 6 }}>{step.action}</div>
                  <Badge text={step.resource} color="#A78BFA" />
                </div>
              </div>
            ))}
          </Card>

          <Card>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>🇮🇳 TARGET COMPANIES</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {roadmap.indianCompanies.map(c => <Badge key={c} text={c} color={T.accent2} />)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>🏅 RECOMMENDED CERTIFICATIONS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {roadmap.certifications.map(c => <Badge key={c} text={c} color={T.accent3} />)}
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Skill gap */}
      <Card>
        <SectionTitle icon="▲">Skill Gap Analysis</SectionTitle>
        {SKILL_GAPS.map(({ skill, priority, timeToLearn }) => (
          <div key={skill} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 0", borderBottom: `1px solid ${T.border}`,
          }}>
            <div>
              <div style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{skill}</div>
              <div style={{ color: T.muted, fontSize: 12 }}>⏱ {timeToLearn}</div>
            </div>
            <Badge text={priority} color={priority === "High" ? "#EF4444" : T.accent} />
          </div>
        ))}
      </Card>
    </div>
  );
}

function InterviewPanel() {
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState({});
  const [feedback, setFeedback] = useState({});

  const generateQuestions = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setQuestions([]);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Generate 4 realistic Indian tech interview questions for: "${topic}". Mix HR and technical.
Return ONLY raw JSON array (no markdown):
[
  {"id":1,"type":"Technical","question":"...","hint":"key thing to mention"},
  {"id":2,"type":"HR","question":"...","hint":"key thing to mention"},
  {"id":3,"type":"Technical","question":"...","hint":"key thing to mention"},
  {"id":4,"type":"Behavioral","question":"...","hint":"key thing to mention"}
]`,
          }],
        }),
      });
      const data = await res.json();
      const raw = data.content.map(i => i.text || "").join("");
      const clean = raw.replace(/```json|```/g, "").trim();
      setQuestions(JSON.parse(clean));
    } catch {
      setQuestions(INTERVIEW_QUESTIONS.map((q, i) => ({ id: i + 1, type: ["Technical", "HR", "Technical", "Behavioral"][i], question: q, hint: "Structure your answer clearly" })));
    }
    setLoading(false);
  };

  const getFeedback = async (id, q, ans) => {
    if (!ans.trim()) return;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          messages: [{
            role: "user",
            content: `As an Indian interview coach, rate this answer briefly. Q: "${q}" A: "${ans}"
Return ONLY raw JSON: {"score": <1-10>, "feedback": "2 sentence feedback", "improve": "one improvement tip"}`,
          }],
        }),
      });
      const data = await res.json();
      const raw = data.content.map(i => i.text || "").join("");
      const clean = raw.replace(/```json|```/g, "").trim();
      setFeedback(prev => ({ ...prev, [id]: JSON.parse(clean) }));
    } catch {
      setFeedback(prev => ({ ...prev, [id]: { score: 7, feedback: "Good structure but could be more specific with examples.", improve: "Add a concrete metric or outcome to strengthen your answer." } }));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle icon="◆">AI Interview Simulator</SectionTitle>
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g. React Developer, Data Analyst, Campus Placement"
          style={{
            width: "100%", padding: "12px 14px", background: T.subtle,
            border: `1px solid ${T.border}`, borderRadius: 8, color: T.text,
            fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
          }}
        />
        <button
          onClick={generateQuestions}
          disabled={!topic.trim() || loading}
          style={{
            marginTop: 12, padding: "12px 24px", background: loading ? T.muted : `linear-gradient(135deg, ${T.accent}, #EC4899)`,
            color: "#fff", border: "none", borderRadius: 8, fontWeight: 700,
            cursor: loading ? "wait" : "pointer", width: "100%", fontSize: 14,
          }}
        >
          {loading ? "Generating Questions…" : "◆ Start Mock Interview"}
        </button>
      </Card>

      {questions.map(({ id, type, question, hint }) => (
        <Card key={id}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "flex-start" }}>
            <Badge text={type} color={type === "Technical" ? T.accent2 : type === "HR" ? T.accent3 : T.accent} />
            <span style={{ color: T.text, fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>Q{id}: {question}</span>
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 10 }}>💡 Hint: {hint}</div>
          <textarea
            value={answer[id] || ""}
            onChange={e => setAnswer(prev => ({ ...prev, [id]: e.target.value }))}
            placeholder="Type your answer here…"
            style={{
              width: "100%", minHeight: 80, background: T.subtle, border: `1px solid ${T.border}`,
              borderRadius: 8, color: T.text, padding: 12, fontSize: 13, resize: "vertical",
              outline: "none", fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
          <button
            onClick={() => getFeedback(id, question, answer[id] || "")}
            style={{
              marginTop: 8, padding: "8px 16px", background: `${T.accent2}22`,
              color: T.accent2, border: `1px solid ${T.accent2}44`, borderRadius: 6,
              fontWeight: 700, cursor: "pointer", fontSize: 12,
            }}
          >
            Get AI Feedback
          </button>
          {feedback[id] && (
            <div style={{ marginTop: 10, padding: 12, background: `${T.accent3}11`, borderRadius: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ color: T.accent3, fontWeight: 800, fontFamily: "monospace" }}>{feedback[id].score}/10</span>
                <span style={{ fontSize: 12, color: T.text }}>{feedback[id].feedback}</span>
              </div>
              <div style={{ fontSize: 12, color: T.muted }}>💡 {feedback[id].improve}</div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function SkillsPanel() {
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", text: "Namaste! 🙏 I'm your AI Career Mentor. Ask me anything about your career, skills, Indian job market, salary negotiation, or interview prep!" },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  const sendMessage = async () => {
    if (!chatMsg.trim() || loading) return;
    const userMsg = chatMsg;
    setChatMsg("");
    setChatHistory(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const messages = [
        ...chatHistory.slice(-6).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text })),
        { role: "user", content: userMsg },
      ];
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are an expert Indian career mentor and coach. You specialize in the Indian job market, IT sector, campus placements, salary negotiation, and career growth. Give concise, practical advice. Use Indian context (LPA for salary, mention Indian companies, Indian certifications, CGPA, etc). Be warm and encouraging.",
          messages,
        }),
      });
      const data = await res.json();
      const text = data.content.map(i => i.text || "").join("");
      setChatHistory(prev => [...prev, { role: "assistant", text }]);
    } catch {
      setChatHistory(prev => [...prev, { role: "assistant", text: "I'm here to help! Try asking about specific career paths, skills to learn, or how to negotiate your salary in India." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card style={{ border: `1px solid ${T.accent3}33` }}>
        <SectionTitle icon="🤖">AI Career Mentor Chat</SectionTitle>
        <div style={{
          height: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12,
          marginBottom: 14, paddingRight: 4,
        }}>
          {chatHistory.map((m, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
                maxWidth: "85%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background: m.role === "user" ? T.accent2 : T.subtle,
                color: T.text, fontSize: 13, lineHeight: 1.6,
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex" }}>
              <div style={{ padding: "10px 16px", background: T.subtle, borderRadius: "14px 14px 14px 4px", color: T.muted, fontSize: 13 }}>
                Thinking…
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={chatMsg}
            onChange={e => setChatMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Ask your career question…"
            style={{
              flex: 1, padding: "11px 14px", background: T.subtle, border: `1px solid ${T.border}`,
              borderRadius: 8, color: T.text, fontSize: 13, outline: "none", fontFamily: "inherit",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!chatMsg.trim() || loading}
            style={{
              padding: "11px 18px", background: T.accent3, color: "#fff",
              border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14,
            }}
          >➤</button>
        </div>
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["How to get into IIT startups?", "Salary negotiation tips", "Switch to Data Science?", "Crack FAANG interviews"].map(q => (
            <button
              key={q}
              onClick={() => { setChatMsg(q); }}
              style={{
                padding: "5px 10px", background: `${T.accent3}15`, color: T.accent3,
                border: `1px solid ${T.accent3}33`, borderRadius: 16, fontSize: 11,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >{q}</button>
          ))}
        </div>
      </Card>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {[
          { icon: "📊", label: "Resumes Analyzed", value: "2.4M+" },
          { icon: "🏆", label: "Jobs Landed", value: "1.8L+" },
          { icon: "🌆", label: "Cities Covered", value: "500+" },
          { icon: "⭐", label: "User Rating", value: "4.9/5" },
        ].map(({ icon, label, value }) => (
          <Card key={label} style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
            <div style={{ color: T.accent, fontWeight: 800, fontSize: 20, fontFamily: "monospace" }}>{value}</div>
            <div style={{ color: T.muted, fontSize: 11 }}>{label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState("score");

  const panels = { score: ScorePanel, match: JobMatchPanel, career: CareerPanel, interview: InterviewPanel, skills: SkillsPanel };
  const Panel = panels[active];

  return (
    <div style={{
      minHeight: "100vh", background: T.bg, color: T.text,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${T.border}`, background: `${T.surface}CC`, backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.accent}, #EC4899)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, boxShadow: `0 0 20px ${T.accent}55`,
          }}>◈</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>CareerAI India</div>
            <div style={{ fontSize: 10, color: T.muted, letterSpacing: 1 }}>AI CAREER INTELLIGENCE</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Badge text="🇮🇳 India" color={T.accent3} />
          <Badge text="AI Pro" color={T.accent} />
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "20px 16px 100px", maxWidth: 680, width: "100%", margin: "0 auto" }}>
        <Panel />
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: `${T.surface}EE`, backdropFilter: "blur(16px)",
        borderTop: `1px solid ${T.border}`, padding: "10px 0 14px",
        display: "flex", justifyContent: "space-around",
      }}>
        {NAV.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              background: "none", border: "none", cursor: "pointer",
              color: active === id ? T.accent : T.muted,
              transition: "color 0.2s",
            }}
          >
            <div style={{
              fontSize: 20, lineHeight: 1,
              filter: active === id ? `drop-shadow(0 0 6px ${T.accent})` : "none",
              transform: active === id ? "scale(1.15)" : "scale(1)",
              transition: "all 0.2s",
            }}>{icon}</div>
            <div style={{ fontSize: 10, fontWeight: active === id ? 700 : 400, letterSpacing: 0.5 }}>{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
