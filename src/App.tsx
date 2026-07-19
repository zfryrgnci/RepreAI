import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Copy,
  Check,
  Trash2,
  Languages,
  Smile,
  Meh,
  Frown,
  FileText,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  MessageSquare,
  Briefcase,
  History,
  Info,
  Terminal,
  Activity,
  Maximize2,
  CheckCircle2,
  Eye,
  Sliders,
  Flame,
  Volume2,
  Share2,
  Cpu
} from "lucide-react";

// Types
interface ReviewResponse {
  generated_response: string;
  sentiment_score: "Positive" | "Neutral" | "Negative";
  key_insights: string[];
}

interface SavedGeneration {
  id: string;
  timestamp: string;
  review: string;
  tone: string;
  language: string;
  response: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  insights: string[];
}

const TONES = [
  { 
    id: "Professional", 
    label: "Professional", 
    desc: "Executive, polite, & objective", 
    color: "from-blue-600/20 to-cyan-600/10",
    border: "border-blue-500/30 hover:border-blue-500/70",
    text: "text-blue-400",
    glow: "shadow-blue-500/10"
  },
  { 
    id: "Warm", 
    label: "Warm", 
    desc: "Empathetic, personal, & supportive", 
    color: "from-amber-600/20 to-orange-600/10",
    border: "border-amber-500/30 hover:border-amber-500/70",
    text: "text-amber-400",
    glow: "shadow-amber-500/10"
  },
  { 
    id: "Apologetic", 
    label: "Apologetic", 
    desc: "Solution-focused, serious, & regretful", 
    color: "from-violet-600/20 to-purple-600/10",
    border: "border-violet-500/30 hover:border-violet-500/70",
    text: "text-violet-400",
    glow: "shadow-violet-500/10"
  },
  { 
    id: "Playful", 
    label: "Playful", 
    desc: "Witty, lighthearted, & vibrant", 
    color: "from-fuchsia-600/20 to-pink-600/10",
    border: "border-fuchsia-500/30 hover:border-fuchsia-500/70",
    text: "text-fuchsia-400",
    glow: "shadow-fuchsia-500/10"
  },
];

const LANGUAGES = [
  { id: "Turkish", label: "Turkish", code: "TR", native: "Türkçe", flag: "🇹🇷" },
  { id: "English", label: "English", code: "EN", native: "English", flag: "🇬🇧" },
  { id: "German", label: "German", code: "DE", native: "Deutsch", flag: "🇩🇪" },
];

const SAMPLE_REVIEWS = [
  {
    language: "Turkish",
    type: "Positive",
    label: "Positive B2B Integration Review",
    text: "Harika bir deneyimdi! B2B entegrasyonu son derece akıcı ve ekip her sorumuza anında yanıt verdi. İş akışımızı inanılmaz hızlandırdı. Yatırım geri dönüşünü şimdiden görmeye başladık.",
  },
  {
    language: "Turkish",
    type: "Negative",
    label: "Critical Enterprise Escalation",
    text: "Yazılımda birkaç kritik hata ile karşılaştık ve destek ekibinin yanıt vermesi 3 gün sürdü. Bu aksaklık nedeniyle enterprise canlı yayına geçişimizi ertelemek zorunda kaldık.",
  },
  {
    language: "English",
    type: "Positive",
    label: "Global SaaS Client Feedback",
    text: "Excellent service and top-tier product performance. The direct API support team was prompt and extremely professional. Looking forward to a long-term enterprise partnership!",
  },
  {
    language: "English",
    type: "Negative",
    label: "Deployment Delay Incident",
    text: "Extremely frustrating setup. The documentation is outdated, and the custom webhooks failed multiple times during our enterprise deployment testing. No reply on the private Slack channel.",
  },
  {
    language: "German",
    type: "Positive",
    label: "CRM integration Praise",
    text: "Hervorragendes Produkt und sehr kompetentes Support-Team. Die Integration in unsere CRM-Infrastruktur verlief absolut reibungslos. Sehr zu empfehlen für Großkonzerne!",
  },
  {
    language: "German",
    type: "Negative",
    label: "API Scaling Bottleneck",
    text: "Enttäuschender Service. Trotz des hohen Enterprise-Preises haben wir nach einer Woche immer noch keine Rückmeldung zu unseren kritischen Skalierungsproblemen erhalten. Bitte sofort melden.",
  },
];

export default function App() {
  const [review, setReview] = useState("");
  const [tone, setTone] = useState("Professional");
  const [language, setLanguage] = useState("English");
  
  // AI Response states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ReviewResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Stats or latency ticker
  const [pingTime, setPingTime] = useState(38);

  // History state loaded from localStorage
  const [history, setHistory] = useState<SavedGeneration[]>(() => {
    try {
      const stored = localStorage.getItem("repreai_history");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem("repreai_history", JSON.stringify(history));
  }, [history]);

  // Simulate slightly changing engine health latency
  useEffect(() => {
    const interval = setInterval(() => {
      setPingTime(prev => {
        const diff = Math.floor(Math.random() * 7) - 3;
        const next = prev + diff;
        return next < 15 ? 15 : next > 65 ? 65 : next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle Review Response Generation
  const handleGenerate = async () => {
    if (!review.trim()) {
      setError("Please enter or select a customer review first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const apiResponse = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          review,
          tone,
          language,
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${apiResponse.status}`);
      }

      const data: ReviewResponse = await apiResponse.json();
      setResponse(data);

      // Save to local history log
      const newLog: SavedGeneration = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " • " + new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
        review: review.trim(),
        tone,
        language,
        response: data.generated_response,
        sentiment: data.sentiment_score,
        insights: data.key_insights,
      };

      setHistory((prev) => [newLog, ...prev]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to contact RepreAI generation engine. Please check your network or configuration.");
    } finally {
      setLoading(false);
    }
  };

  // Copy reply to clipboard helper
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Select sample review directly
  const handleSelectSample = (sample: typeof SAMPLE_REVIEWS[number]) => {
    setReview(sample.text);
    setLanguage(sample.language);
    // Auto tune tone to apologetic for negative reviews, professional for positive
    setTone(sample.type === "Negative" ? "Apologetic" : "Professional");
    setError(null);
  };

  // Load a historic entry back into current active state
  const handleLoadHistory = (item: SavedGeneration) => {
    setReview(item.review);
    setTone(item.tone);
    setLanguage(item.language);
    setResponse({
      generated_response: item.response,
      sentiment_score: item.sentiment,
      key_insights: item.insights,
    });
    setError(null);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  // Delete an item from history log
  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear all history
  const handleClearAllHistory = () => {
    if (window.confirm("Are you sure you want to delete all stored response generation logs?")) {
      setHistory([]);
    }
  };

  // Sentiment distribution analytics
  const totalProcessed = history.length;
  const positiveCount = history.filter((h) => h.sentiment === "Positive").length;
  const neutralCount = history.filter((h) => h.sentiment === "Neutral").length;
  const negativeCount = history.filter((h) => h.sentiment === "Negative").length;

  return (
    <div id="repreai_workspace" className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-teal-500/40 selection:text-teal-100 relative overflow-x-hidden">
      
      {/* Dynamic ambient dark net grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111622_1px,transparent_1px),linear-gradient(to_bottom,#111622_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none z-0" />
      
      {/* Background ultra high-end blurred tech glow lines */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-purple-600/5 blur-[160px] rounded-full pointer-events-none z-0" />

      {/* Cyber Mission Control Top Ticker Bar */}
      <div className="bg-[#030508] border-b border-slate-800/40 py-1.5 px-4 lg:px-8 text-center text-[10px] font-mono text-slate-500 tracking-wider flex flex-wrap items-center justify-between gap-2 z-50 relative">
        <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
          <span className="text-slate-400">ENGINE SECURE SSL CODES</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>MODEL: <strong className="text-teal-400">gemini-3.5-flash</strong></span>
          <span>•</span>
          <span>LATENCY: <strong className="text-sky-400">{pingTime}ms</strong></span>
          <span>•</span>
          <span>CRYPTO ALIGNMENT: <strong className="text-slate-300">ACTIVE</strong></span>
        </div>
      </div>

      {/* Modern High-Tech Navigation Header */}
      <header id="repreai_cyber_header" className="sticky top-0 z-40 bg-[#07090e]/90 backdrop-blur-lg border-b border-slate-800/50 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-purple-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <div className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-[#0a0f1d] border border-teal-500/30 text-teal-400">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Repre<span className="text-teal-400 font-mono tracking-normal">AI</span>
                </h1>
                <span className="text-[9px] font-mono bg-teal-500/10 text-teal-300 border border-teal-400/20 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
                B2B Reputation Engine & AI Assistant
              </p>
            </div>
          </div>

          {/* Quick Metrics HUD inside Header */}
          <div className="hidden md:flex items-center gap-6 bg-slate-900/50 border border-slate-800/60 px-4 py-2 rounded-xl">
            <div className="text-center">
              <span className="block text-[9px] text-slate-500 font-mono uppercase">Processed</span>
              <span className="text-sm font-bold font-mono text-white">{totalProcessed}</span>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div className="text-center">
              <span className="block text-[9px] text-slate-500 font-mono uppercase">Avg Sentiment</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {totalProcessed > 0 ? `${Math.round((positiveCount / totalProcessed) * 100)}% Pos` : "0%"}
              </span>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <a
              href="#history-section"
              className="px-3 py-1.5 rounded-lg bg-slate-950 text-xs text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-teal-400" />
              <span>Audit Vault</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 relative z-10 space-y-8">
        
        {/* Futuristic Grid Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: Control deck & Parameters (5 Columns) */}
          <section className="lg:col-span-5 space-y-6">
            
            {/* Interactive Param Dial Panel */}
            <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Response Specifications
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  SYSTEM READY
                </span>
              </div>

              {/* 1. LANGUAGE SELECT: Segmented synthesizer styled buttons */}
              <div className="space-y-3 mb-6">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-teal-500" />
                  Target Native Language
                </label>
                <div className="grid grid-cols-3 gap-2 bg-[#04060b] p-1.5 rounded-xl border border-slate-800">
                  {LANGUAGES.map((lang) => {
                    const isSelected = language === lang.id;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={`py-2 px-1 rounded-lg text-xs font-semibold tracking-wider transition-all flex flex-col items-center justify-center gap-1 relative overflow-hidden cursor-pointer ${
                          isSelected 
                            ? "bg-slate-900 text-teal-400 border border-teal-500/30 shadow-md shadow-teal-500/5 font-bold" 
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                        }`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span className="text-[10px] font-mono uppercase">{lang.code}</span>
                        {isSelected && (
                          <motion.div 
                            layoutId="lang_active_glow" 
                            className="absolute bottom-0 inset-x-4 h-0.5 bg-gradient-to-r from-teal-400 to-sky-400" 
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. TONE SELECTION: Futuristic visual card deck */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-teal-500" />
                    Interactive Tone Vibe
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    Select 1 of 4
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {TONES.map((t) => {
                    const isSelected = tone === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTone(t.id)}
                        className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden group flex flex-col justify-between h-20 cursor-pointer ${
                          isSelected 
                            ? `bg-gradient-to-br ${t.color} ${t.border} ${t.glow} border-t-2 border-teal-400`
                            : "bg-[#04060b] border-slate-800 hover:border-slate-700 hover:bg-slate-900/20"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-bold ${isSelected ? t.text : "text-slate-300"}`}>
                            {t.label}
                          </span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                          )}
                        </div>
                        <p className="text-[9px] text-slate-500 leading-tight group-hover:text-slate-400">
                          {t.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TEXT INPUT AREA: Coder Syntax layout with Left Margin numbers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-teal-500" />
                    RAW FEED INGRESS FEEDBACK
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {review.length} CHARS
                  </span>
                </div>

                <div className="relative rounded-xl border border-slate-800 bg-[#04060b] overflow-hidden group focus-within:border-teal-500/50 transition-all">
                  {/* Visual editor header */}
                  <div className="bg-[#0b0f19] border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500/60 inline-block" />
                      <span className="w-2 h-2 rounded-full bg-yellow-500/60 inline-block" />
                      <span className="w-2 h-2 rounded-full bg-green-500/60 inline-block" />
                      <span className="ml-1 text-slate-400">review_prompt_source.log</span>
                    </span>
                    <span className="text-teal-500 font-bold uppercase">UTF-8</span>
                  </div>

                  {/* Editor body with simulated margins */}
                  <div className="flex">
                    {/* Simulated code editor line numbers */}
                    <div className="bg-[#070a12]/70 px-2 py-3 text-right text-[10px] font-mono text-slate-600 select-none border-r border-slate-900 min-w-[32px] space-y-1">
                      <div>01</div>
                      <div>02</div>
                      <div>03</div>
                      <div>04</div>
                      <div>05</div>
                      <div>06</div>
                    </div>
                    <textarea
                      id="customer_review_textarea"
                      value={review}
                      onChange={(e) => {
                        setReview(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Paste raw corporate review log, email chain, or customer comment here..."
                      className="w-full bg-transparent p-3 text-xs font-mono text-slate-300 placeholder-slate-700 focus:outline-none resize-none leading-relaxed min-h-[135px] max-h-[220px]"
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Errors */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button: Cyber-Styled */}
              <button
                id="generate_response_button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full mt-5 relative overflow-hidden group py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-400 to-sky-500 text-slate-950 font-black text-xs tracking-wider uppercase hover:from-teal-300 hover:to-sky-400 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400/50 shadow-lg shadow-teal-500/15 disabled:opacity-45 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>AI COMPUTING RESPONSE...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
                    <span>ENGAGE GENERATOR DECK</span>
                  </>
                )}
              </button>
            </div>

            {/* HIGH-TECH SIDEBAR SEED FEED (Client Feed Sandbox) */}
            <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-5 shadow-xl relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-teal-500" />
                  Live Client Feed Sandbox
                </span>
                <span className="text-[9px] font-mono text-slate-500">6 LOGS LOADED</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-4">
                Simulate enterprise feedback from Turkish, German, or English partners by seeding the controller deck:
              </p>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {SAMPLE_REVIEWS.map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSample(sample)}
                    className="w-full text-left p-3 rounded-xl bg-[#04060b] hover:bg-[#070b14] border border-slate-850 hover:border-slate-700/80 transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{sample.language === "Turkish" ? "🇹🇷" : sample.language === "German" ? "🇩🇪" : "🇬🇧"}</span>
                        <span className="text-[9px] font-mono uppercase text-slate-400">{sample.label}</span>
                      </div>
                      <span className={`text-[8px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${
                        sample.type === "Positive" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {sample.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 group-hover:text-slate-200">
                      "{sample.text}"
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT SIDE: Holographic Output & Real-time Analytics (7 Columns) */}
          <section className="lg:col-span-7">
            
            <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 shadow-2xl min-h-[580px] flex flex-col justify-between relative overflow-hidden">
              {/* Radial decor background */}
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Header Indicator */}
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse shrink-0" />
                    <h2 className="text-xs font-mono uppercase tracking-widest text-slate-200">
                      Holographic Core & Insight Array
                    </h2>
                  </div>
                  {response && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      STABLE OUT
                    </span>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {loading ? (
                    /* Futuristic High-tech Loading Terminal Screen */
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6 py-8 font-mono"
                    >
                      <div className="p-4 rounded-xl bg-[#04060b] border border-slate-800 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/30">
                          <RefreshCw className="w-5 h-5 text-teal-400 animate-spin" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-slate-300 uppercase tracking-widest">GEMINI API NEURAL GATEWAY</div>
                          <div className="text-[10px] text-teal-400">CONNECTING VIA SERVER PORT 3000...</div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#04060b]/40 border border-slate-800/40 space-y-3.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>STAGE 1/3: SENTIMENT DISCRIMINATOR</span>
                          <span className="text-teal-400">COMPILING...</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal-500 to-sky-400 animate-pulse w-3/4" />
                        </div>
                        <div className="text-[10px] text-slate-400 space-y-1">
                          <p className="text-slate-500">&gt; Parsing vocabulary vectors...</p>
                          <p className="text-slate-500">&gt; Neutralizing native context flags [lang={language}]</p>
                          <p className="text-teal-400/90 animate-pulse">&gt; Generation agent drafting response with tone parameters...</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-16 bg-[#04060b] rounded-xl border border-slate-850 animate-pulse" />
                        <div className="h-16 bg-[#04060b] rounded-xl border border-slate-850 animate-pulse" />
                        <div className="h-16 bg-[#04060b] rounded-xl border border-slate-850 animate-pulse" />
                      </div>
                    </motion.div>
                  ) : response ? (
                    /* Fully loaded high-end output */
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      {/* SENTIMENT VISUAL SPEEDOMETER GAUGE */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        
                        {/* Custom visual speedometer dial (5 cols) */}
                        <div className="sm:col-span-5 bg-[#04060b] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                            Sentiment Meter
                          </span>

                          {/* Gauge CSS Graphic */}
                          <div className="relative w-32 h-16 overflow-hidden mb-2">
                            {/* Arc */}
                            <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[10px] border-slate-800" />
                            {/* Dial colored sectors */}
                            <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[10px] border-transparent border-t-rose-500/20 border-l-rose-500/20" />
                            <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[10px] border-transparent border-t-emerald-500/20 border-r-emerald-500/20 rotate-45" />
                            
                            {/* Indicator Hand */}
                            <div 
                              className="absolute bottom-0 left-1/2 w-1.5 h-12 bg-teal-400 rounded-full origin-bottom transition-all duration-1000 ease-out"
                              style={{
                                transform: `translateX(-50%) rotate(${
                                  response.sentiment_score === "Positive" ? "55deg" :
                                  response.sentiment_score === "Negative" ? "-55deg" : "0deg"
                                })`
                              }}
                            />
                            {/* Pin */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-teal-400" />
                          </div>

                          {/* Classification Title */}
                          <div className="space-y-0.5">
                            <span className="block text-[10px] font-mono text-slate-400">CLASSIFIED AS:</span>
                            <span className={`text-base font-black tracking-wider uppercase font-mono ${
                              response.sentiment_score === "Positive" ? "text-emerald-400" :
                              response.sentiment_score === "Negative" ? "text-rose-400" : "text-amber-400"
                            }`}>
                              {response.sentiment_score}
                            </span>
                          </div>
                        </div>

                        {/* Tone & Spec Telemetry Info Box (7 cols) */}
                        <div className="sm:col-span-7 bg-[#04060b] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                          <div>
                            <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2.5">
                              Parameters Config Matrix
                            </span>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="block text-[10px] text-slate-500 font-mono">SPECIFIED TONE:</span>
                                <span className="text-sm font-bold text-slate-200">{tone}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] text-slate-500 font-mono">LANGUAGE ENVELOPE:</span>
                                <span className="text-sm font-bold text-teal-400">{language}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span>REPRE_AGENT: ACTIVE</span>
                            <span>COMPILATION: NATIVE</span>
                          </div>
                        </div>

                      </div>

                      {/* TERMINAL DISPLAY: Generated response preview with Copy */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                            Drafted Response Output
                          </label>
                          <button
                            onClick={() => handleCopyToClipboard(response.generated_response)}
                            className="text-[11px] font-mono text-teal-300 hover:text-white flex items-center gap-1.5 bg-teal-500/10 hover:bg-teal-500/20 px-3.5 py-1.5 rounded-lg border border-teal-500/20 transition-all cursor-pointer"
                          >
                            {copied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>COPIED TO BUFFERS</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>COPY DRAFT TO CLIPBOARD</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="relative rounded-xl border border-slate-800 bg-[#04060b] overflow-hidden">
                          {/* Top prompt bar */}
                          <div className="bg-[#0b0f19] border-b border-slate-800 px-4 py-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                              <span>GENERATED RESPONSE TEXT BUFFER</span>
                            </span>
                            <span className="text-slate-500 font-mono">READONLY CODE</span>
                          </div>

                          <div className="p-5 text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap select-text max-h-[300px] overflow-y-auto">
                            {response.generated_response}
                          </div>

                          {/* Footer details */}
                          <div className="bg-[#04060b] border-t border-slate-850 px-4 py-1.5 text-[9px] font-mono text-slate-600 flex items-center justify-between">
                            <span>SECURE PIPELINE SYNC</span>
                            <span>REPREAI CORP</span>
                          </div>
                        </div>
                      </div>

                      {/* HIGH INTERACTIVE B2B INSIGHTS ARRAY */}
                      <div className="bg-[#04060b] border border-slate-800 rounded-xl p-5">
                        <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                          Key Extracted Corporate Takeaways
                        </span>

                        {response.key_insights && response.key_insights.length > 0 ? (
                          <div className="grid grid-cols-1 gap-2.5">
                            {response.key_insights.map((insight, idx) => (
                              <div key={idx} className="p-3 bg-[#0a0f1d] border border-slate-850 rounded-lg flex items-start gap-3">
                                <span className="text-teal-400 font-mono text-xs font-bold bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-500/20 shrink-0">
                                  0{idx + 1}
                                </span>
                                <span className="text-xs text-slate-300 leading-relaxed">{insight}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">No business insights compiled.</p>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    /* Standard Beautiful Empty HUD Graphic */
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full py-20 flex flex-col items-center justify-center text-center space-y-4"
                    >
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-tr from-teal-500 to-purple-500 rounded-2xl blur opacity-25" />
                        <div className="relative w-16 h-16 rounded-2xl bg-[#04060b] border border-slate-800 flex items-center justify-center">
                          <Cpu className="w-8 h-8 text-teal-500/60" />
                        </div>
                      </div>
                      <div className="max-w-xs space-y-1.5">
                        <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase font-mono">No Active Feed</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Once reviews are loaded and analyzed, real-time sentiment radar dials and insights will assemble in this console.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Total Analytics Status Bar */}
              {totalProcessed > 0 && (
                <div className="border-t border-slate-800/60 pt-4 mt-6 flex flex-wrap items-center justify-between gap-4 text-[10px] text-slate-500 font-mono">
                  <span>SESSION ENGINE STATS:</span>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> POSITIVE: <strong className="text-slate-300">{positiveCount}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> NEUTRAL: <strong className="text-slate-300">{neutralCount}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> NEGATIVE: <strong className="text-slate-300">{negativeCount}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

          </section>
        </div>

        {/* AUDIT VAULT: Historical RepreAI Logs (Entirely different layout) */}
        <section id="history-section" className="mt-12 scroll-mt-24">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-teal-400" />
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Corporate Audit Vault
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                View previous generated answers, insights, and reputation data stored in local buffers.
              </p>
            </div>

            {history.length > 0 && (
              <button
                onClick={handleClearAllHistory}
                className="text-xs text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-1.5 rounded-lg border border-rose-500/20 transition-all font-semibold font-mono cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 inline-block mr-1" />
                PURGE CRYPTO LOGS
              </button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  layoutId={item.id}
                  onClick={() => handleLoadHistory(item)}
                  className="bg-[#0b0f19] hover:bg-[#101524] border border-slate-850 hover:border-teal-500/30 rounded-xl p-5 cursor-pointer group transition-all relative flex flex-col justify-between"
                  whileHover={{ y: -3 }}
                >
                  <div className="space-y-4">
                    {/* Top level tags */}
                    <div className="flex items-start justify-between">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-mono bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          {item.language === "Turkish" ? "🇹🇷 TR" : item.language === "German" ? "🇩🇪 DE" : "🇬🇧 EN"}
                        </span>
                        <span className="text-[9px] font-mono bg-slate-950 text-teal-400 px-2 py-0.5 rounded border border-teal-950">
                          {item.tone}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          item.sentiment === "Positive" ? "bg-emerald-500" :
                          item.sentiment === "Negative" ? "bg-rose-500" : "bg-amber-500"
                        }`} />
                        <button
                          onClick={(e) => handleDeleteHistory(item.id, e)}
                          className="text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-slate-950 transition-colors"
                          title="Purge record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Review snapshot */}
                    <div>
                      <span className="block text-[9px] font-mono uppercase text-slate-500 tracking-wider mb-1">
                        INPUT LOG PREVIEW:
                      </span>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-mono bg-slate-950/50 p-2 rounded border border-slate-900">
                        "{item.review}"
                      </p>
                    </div>

                    {/* Reply draft preview */}
                    <div className="border-t border-slate-800/60 pt-3">
                      <span className="block text-[9px] font-mono uppercase text-slate-500 tracking-wider mb-1.5 flex items-center justify-between">
                        DRAFT OUT
                        <span className="text-teal-400 group-hover:underline text-[9px] font-semibold">
                          RESTORE DECK →
                        </span>
                      </span>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed bg-[#04060b] p-3 rounded-lg border border-slate-950">
                        {item.response}
                      </p>
                    </div>
                  </div>

                  <div className="text-[9px] font-mono text-slate-600 mt-4 text-right pt-2 border-t border-slate-950">
                    RECORDED: {item.timestamp}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl bg-[#04060b] border border-slate-800 border-dashed text-slate-500 text-xs font-mono">
              <History className="w-8 h-8 text-slate-700 mx-auto mb-2.5 animate-pulse" />
              VAULT BLANK • NO AUDITED ENTRIES REGISTERED IN CURRENT SESSION
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#030508] text-slate-600 py-8 px-4 text-center text-xs mt-16 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span>© 2026 RepreAI B2B. Built securely with React 19 + Node SSL API + Gemini Intelligence.</span>
          </div>
          <div className="flex gap-4">
            <span className="text-teal-500/50">PWA Manifest Validated</span>
            <span>•</span>
            <span className="text-teal-500/50">Enterprise Port Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

