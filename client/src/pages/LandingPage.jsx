import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import {
  Droplets, Zap, Brain, BarChart3, Bell,
  ArrowRight, Leaf, TrendingDown, Languages, Activity, Lock, Database,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/* ── Rotating hero words ─────────────────────────────────── */
const HERO_WORDS = [
  { word: 'WATER',  color: '#00E87A', glow: 'rgba(0,232,122,0.45)'   },
  { word: 'ENERGY', color: '#FF9500', glow: 'rgba(255,149,0,0.45)'   },
  { word: 'CARBON', color: '#C084FC', glow: 'rgba(192,132,252,0.45)' },
  { word: 'COSTS',  color: '#38BDF8', glow: 'rgba(56,189,248,0.45)'  },
];

/* ── Terminal lines ──────────────────────────────────────── */
const TERMINAL_LINES = [
  { t: '$ hydrogrid connect --live --auth=jwt',    c: 'neon'  },
  { t: '',                                           c: ''      },
  { t: '  \u2713  IoT gateway: Maharashtra Grid',  c: 'ok'    },
  { t: '  \u2713  MongoDB: 44,000 readings loaded', c: 'ok'    },
  { t: '  \u2713  AI Engine: Groq LLM ready',       c: 'ok'    },
  { t: '',                                           c: ''      },
  { t: '  \u2500\u2500 LIVE METRICS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500', c: 'dim' },
  { t: '  \U0001f4a7  Water flow   8,450 L   \u25b2 OK',    c: 'neon'  },
  { t: '  \u26a1  Power load   620 kWh  \u26a0 HIGH',      c: 'warn'  },
  { t: '  \U0001f4b0  Savings      \u20b95,382  \u25b2 +28%', c: 'neon' },
  { t: '',                                           c: ''      },
  { t: '  [AI] Anomaly: Kitchen spike @ 14:32',    c: 'warn'  },
  { t: '  [AI] Rec: Schedule AC after 22:00',      c: 'ok'    },
  { t: '  [AI] 30% savings achievable this month', c: 'ok'    },
  { t: '',                                           c: ''      },
  { t: '$ _',                                        c: 'neon'  },
];

/* ── Feature bento ───────────────────────────────────────── */
const FEATURES = [
  { icon: BarChart3, title: 'Smart Dashboard',      desc: 'Interactive charts with daily, weekly, monthly comparisons. Live WebSocket feed updates in real-time.', accent: 'neon',   span: 2 },
  { icon: Brain,     title: 'AI Analytics Engine',  desc: 'Z-score anomaly detection, exponential smoothing forecasts, Groq LLM natural language insights.',       accent: 'purple', span: 1 },
  { icon: Bell,      title: 'Threshold Alerts',     desc: 'Green / yellow / red severity alerts fired the moment limits are exceeded.',                             accent: 'orange', span: 1 },
  { icon: Lock,      title: 'Secure by Default',    desc: 'JWT tokens, bcrypt hashing, role-based access control. Admin and user roles with protected routes.',    accent: 'neon',   span: 2 },
  { icon: Database,  title: 'India Tariff Engine',  desc: 'State-wise water and electricity tariff calculator for accurate monthly bill forecasting.',              accent: 'orange', span: 1 },
  { icon: Leaf,      title: 'Carbon + Leaderboard', desc: 'Track CO2 equivalent from electricity, earn gamification badges, compete on public leaderboard.',       accent: 'purple', span: 1 },
];

/* ── Stats ───────────────────────────────────────────────── */
const STATS = [
  { val: 10000, suf: '+',  lab: 'Active Users',    col: '#00E87A', glow: 'rgba(0,232,122,0.3)'   },
  { val: 44000, suf: '+',  lab: 'Data Readings',   col: '#FF9500', glow: 'rgba(255,149,0,0.3)'   },
  { val: 28,    pre: '\u20b9', suf: 'L', lab: 'Cost Savings', col: '#00E87A', glow: 'rgba(0,232,122,0.3)' },
  { val: 99.9,  suf: '%',  lab: 'Platform Uptime', col: '#FF9500', glow: 'rgba(255,149,0,0.3)',  dec: 1 },
];

const AC = {
  neon:   { bg: 'rgba(0,232,122,0.08)',   text: '#00E87A', line: 'rgba(0,232,122,0.25)'   },
  orange: { bg: 'rgba(255,149,0,0.08)',   text: '#FF9500', line: 'rgba(255,149,0,0.25)'   },
  purple: { bg: 'rgba(192,132,252,0.08)', text: '#C084FC', line: 'rgba(192,132,252,0.25)' },
};

const TC = { neon: '#00E87A', ok: '#4ade80', warn: '#FF9500', dim: '#3f3f46', '': 'transparent' };

/* ── Terminal hook ───────────────────────────────────────── */
function useTerminal() {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= TERMINAL_LINES.length) return;
    const id = setTimeout(() => setN(v => v + 1), n === 0 ? 800 : 370);
    return () => clearTimeout(id);
  }, [n]);
  return n;
}

/* ── 3-D Tilt card ───────────────────────────────────────── */
function TiltCard({ children, className, accentBg }) {
  const ref = useRef(null);
  const [s, set] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, on: false });
  const onMove = useCallback((e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top)  / r.height;
    set({ rx: (ny - 0.5) * -7, ry: (nx - 0.5) * 7, gx: nx * 100, gy: ny * 100, on: true });
  }, []);
  const onLeave = useCallback(() => set({ rx: 0, ry: 0, gx: 50, gy: 50, on: false }), []);
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative overflow-hidden group cursor-default ${className || ''}`}
      style={{
        transform: `perspective(900px) rotateX(${s.rx}deg) rotateY(${s.ry}deg) scale(${s.on ? 1.013 : 1})`,
        transition: 'transform 0.13s ease',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{ background: `radial-gradient(circle at ${s.gx}% ${s.gy}%, ${accentBg || 'rgba(0,232,122,0.07)'} 0%, transparent 60%)` }}
      />
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { language, toggleLanguage } = useLanguage();
  const heroRef = useRef(null);
  const [spot, setSpot] = useState({ x: 30, y: 50 });
  const [wordIdx, setWordIdx] = useState(0);
  const termN = useTerminal();

  useEffect(() => {
    const iv = setInterval(() => setWordIdx(i => (i + 1) % HERO_WORDS.length), 2600);
    return () => clearInterval(iv);
  }, []);

  const onMouseMove = useCallback((e) => {
    const r = heroRef.current?.getBoundingClientRect();
    if (!r) return;
    setSpot({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top)  / r.height) * 100,
    });
  }, []);

  const cw = HERO_WORDS[wordIdx];
  const ease = [0.22, 1, 0.36, 1];

  return (
    <div className="min-h-screen bg-base text-hi overflow-x-hidden">

      {/* Noise texture */}
      <div
        className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '120px',
        }}
      />

      {/* ── NAV ── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55 }}
        className="fixed top-0 w-full z-50 bg-base/88 backdrop-blur-2xl border-b border-white/[0.045]"
      >
        <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#00E87A', boxShadow: '0 0 18px rgba(0,232,122,0.35)' }}>
              <Droplets className="w-4 h-4 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-black text-[17px] tracking-[-0.03em]">HydroGrid</span>
          </div>
          <div className="hidden md:flex items-center gap-7">
            {[['Features','#features'],['Stats','#stats'],['Process','#process']].map(([l,h]) => (
              <a key={l} href={h} className="text-[13px] text-zinc-500 hover:text-white transition-colors duration-150">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleLanguage}
              className="h-8 px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-600 border border-white/[0.07] rounded-lg hover:text-white hover:border-white/20 transition-all flex items-center gap-1.5">
              <Languages className="w-3 h-3" />{language}
            </button>
            <Link to="/login" className="text-[13px] text-zinc-500 hover:text-white transition-colors">Sign in</Link>
            <Link to="/signup"
              className="h-9 px-5 text-[13px] font-black text-black rounded-xl transition-all hover:-translate-y-0.5 flex items-center gap-1.5"
              style={{ background: '#00E87A', boxShadow: '0 4px 18px rgba(0,232,122,0.25)' }}>
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        onMouseMove={onMouseMove}
        className="relative min-h-screen flex items-center pt-[60px]"
        style={{ background: `radial-gradient(ellipse 750px 550px at ${spot.x}% ${spot.y}%, rgba(0,232,122,0.055) 0%, transparent 60%), #07070C` }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.013) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14 xl:gap-20 items-center">

            {/* Left */}
            <div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}
                className="flex items-center gap-2 mb-8">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-mono font-semibold"
                  style={{ background: 'rgba(0,232,122,0.07)', borderColor: 'rgba(0,232,122,0.2)', color: '#00E87A' }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#00E87A' }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#00E87A' }} />
                  </span>
                  Production Ready &middot; AI Powered &middot; Real-time IoT
                </div>
              </motion.div>

              <div className="mb-8">
                <div className="overflow-hidden">
                  <motion.div initial={{ y: 70 }} animate={{ y: 0 }} transition={{ delay: 0.22, duration: 0.7, ease }}
                    className="text-[clamp(3rem,6vw,5rem)] font-black tracking-[-0.04em] leading-[0.92] text-white/90">
                    MONITOR YOUR
                  </motion.div>
                </div>
                <div className="overflow-hidden" style={{ height: 'calc(clamp(3rem,6vw,5rem) * 1.05)' }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={wordIdx}
                      initial={{ y: '110%', opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: '-110%', opacity: 0 }}
                      transition={{ duration: 0.44, ease }}
                      className="text-[clamp(3rem,6vw,5rem)] font-black tracking-[-0.04em] leading-[0.92]"
                      style={{ color: cw.color, textShadow: `0 0 45px ${cw.glow}` }}
                    >{cw.word}</motion.div>
                  </AnimatePresence>
                </div>
                <div className="overflow-hidden">
                  <motion.div initial={{ y: 70 }} animate={{ y: 0 }} transition={{ delay: 0.62, duration: 0.7, ease }}
                    className="text-[clamp(3rem,6vw,5rem)] font-black tracking-[-0.04em] leading-[0.92] text-white/90">
                    WITH PRECISION
                  </motion.div>
                </div>
              </div>

              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.82 }}
                className="text-[15px] text-zinc-400 max-w-[400px] leading-relaxed mb-9">
                Full-stack SaaS platform with AI anomaly detection, state-wise tariff estimation,
                live IoT feeds, carbon tracking, and Groq LLM insights.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}
                className="flex flex-wrap gap-3 mb-9">
                <Link to="/signup"
                  className="group flex items-center gap-2 px-7 py-3.5 text-[14px] font-black text-black rounded-xl transition-all hover:-translate-y-1"
                  style={{ background: '#00E87A', boxShadow: '0 6px 28px rgba(0,232,122,0.28)' }}>
                  <Droplets className="w-4 h-4" />
                  Start Monitoring Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login"
                  className="flex items-center gap-2 px-7 py-3.5 text-[14px] font-semibold text-zinc-400 rounded-xl border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/[0.03] transition-all">
                  <Activity className="w-4 h-4" style={{ color: '#FF9500' }} />
                  View Dashboard
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
                className="flex flex-wrap gap-5 pt-6 border-t border-white/[0.06]">
                {[
                  { Icon: Droplets,     val: '8,450 L', note: 'tracked today',  color: '#00E87A' },
                  { Icon: Zap,          val: '620 kWh', note: 'monitored',       color: '#FF9500' },
                  { Icon: TrendingDown, val: '\u20b95,382', note: 'saved/month', color: '#4ade80' },
                ].map(({ Icon, val, note, color }) => (
                  <div key={note} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                    <span className="text-[13px] font-bold" style={{ color }}>{val}</span>
                    <span className="text-[12px] text-zinc-600">{note}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Terminal */}
            <motion.div
              initial={{ opacity: 0, x: 28, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-12 rounded-full blur-3xl pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(0,232,122,0.09) 0%, transparent 70%)' }} />
                <div className="relative rounded-2xl overflow-hidden border"
                  style={{ background: '#0A0F0A', borderColor: 'rgba(0,232,122,0.12)', boxShadow: '0 30px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,232,122,0.05)' }}>
                  <div className="flex items-center gap-2 px-4 py-3 border-b"
                    style={{ background: '#070C07', borderColor: 'rgba(0,232,122,0.08)' }}>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#00E87A', opacity: 0.75 }} />
                    <span className="ml-2 text-[11px] font-mono" style={{ color: '#3f3f46' }}>hydrogrid &mdash; live terminal</span>
                  </div>
                  <div className="p-5 font-mono text-[12px] leading-[1.7] min-h-[340px]"
                    style={{ background: '#080D08' }}>
                    {TERMINAL_LINES.slice(0, termN).map((line, i) => (
                      <div key={i} style={{ color: TC[line.c] || TC.dim, minHeight: '1.6rem' }}>
                        {line.t || '\u00A0'}
                      </div>
                    ))}
                    {termN < TERMINAL_LINES.length && (
                      <span className="terminal-cursor" style={{ color: '#00E87A' }}>&#9607;</span>
                    )}
                  </div>
                </div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 3.8 }}
                  className="absolute -right-5 top-10 px-3 py-2 rounded-xl border text-[11px] font-mono font-bold"
                  style={{ background: 'rgba(0,232,122,0.08)', borderColor: 'rgba(0,232,122,0.2)', color: '#00E87A' }}>
                  \u2713 AI insights ready
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 4.5 }}
                  className="absolute -left-5 bottom-14 px-3 py-2 rounded-xl border text-[11px] font-mono font-bold"
                  style={{ background: 'rgba(255,149,0,0.08)', borderColor: 'rgba(255,149,0,0.2)', color: '#FF9500' }}>
                  \u26a1 620 kWh spike detected
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: '#27272a' }}>scroll</span>
          <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, rgba(0,232,122,0.3), transparent)' }} />
        </motion.div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="border-y py-3 overflow-hidden" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-sub)" }}>
        <div className="marquee-track">
          {[...FEATURES.map(f => f.title), 'JWT Auth', 'PDF Reports', 'Leaderboard', 'WebSocket', 'MongoDB', 'India Tariff', 'IoT Simulator',
            ...FEATURES.map(f => f.title), 'JWT Auth', 'PDF Reports', 'Leaderboard', 'WebSocket', 'MongoDB', 'India Tariff', 'IoT Simulator'].map((tag, i) => (
            <div key={i} className="flex items-center gap-4 px-6 whitespace-nowrap">
              <div className="w-1 h-1 rounded-full" style={{ background: i % 2 === 0 ? 'rgba(0,232,122,0.4)' : 'rgba(255,149,0,0.4)' }} />
              <span className="text-[11px] font-mono uppercase tracking-[0.2em]" style={{ color: '#3f3f46' }}>{tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES BENTO ── */}
      <section id="features" className="py-28 px-6" style={{ background: "var(--bg-base)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.4em] mb-3" style={{ color: '#00E87A' }}>02 &mdash; Capabilities</p>
              <h2 className="text-5xl md:text-6xl font-black tracking-[-0.04em] leading-none">
                Built for<br /><span style={{ color: '#00E87A', textShadow: '0 0 40px rgba(0,232,122,0.25)' }}>the real world.</span>
              </h2>
            </div>
            <p className="text-[14px] text-zinc-500 max-w-xs leading-relaxed md:text-right">
              Production-ready features engineered for complete visibility over your resource ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.05)', boxShadow: '0 0 0 1px rgba(255,255,255,0.05)' }}>
            {FEATURES.map((f, i) => {
              const a = AC[f.accent];
              const isWide = f.span === 2;
              return (
                <TiltCard
                  key={i}
                  accentBg={a.bg}
                  className={`bg-card hover:brightness-110 transition-all duration-200 p-7 ${isWide ? 'md:col-span-2' : 'md:col-span-1'}`}
                >
                  <span className="absolute top-3 right-4 text-7xl font-black font-mono leading-none select-none pointer-events-none"
                    style={{ color: 'rgba(255,255,255,0.022)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className={`flex ${isWide ? 'flex-row items-start gap-5' : 'flex-col'}`}>
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mb-0"
                      style={{ background: a.bg, boxShadow: `0 0 18px ${a.line}` }}>
                      <f.icon className="w-4.5 h-4.5" style={{ color: a.text, width: 18, height: 18 }} />
                    </div>
                    <div className={isWide ? '' : 'mt-4'}>
                      <h3 className="text-[15px] font-bold text-white mb-1.5 tracking-tight">{f.title}</h3>
                      <p className="text-[13px] text-zinc-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                  <div className="mt-5 h-px" style={{ background: `linear-gradient(to right, ${a.text}35, transparent)` }} />
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" className="py-28 px-6 border-y" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-sub)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] mb-3" style={{ color: '#FF9500' }}>03 &mdash; Impact</p>
          <h2 className="text-5xl md:text-6xl font-black tracking-[-0.04em] leading-none mb-14">
            Numbers that<br /><span style={{ color: '#FF9500', textShadow: '0 0 40px rgba(255,149,0,0.25)' }}>speak.</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-0 lg:divide-x divide-white/[0.05]">
            {STATS.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.09, duration: 0.5 }}
                className="lg:px-10 first:pl-0 last:pr-0">
                <div className="text-[clamp(2.8rem,4vw,3.8rem)] font-black font-mono tracking-[-0.04em] leading-none mb-2"
                  style={{ color: s.col, textShadow: `0 0 32px ${s.glow}` }}>
                  {s.pre}
                  <CountUp end={s.val} duration={2.5} decimals={s.dec || 0} separator="," enableScrollSpy scrollSpyOnce />
                  {s.suf}
                </div>
                <p className="text-[13px] text-zinc-500">{s.lab}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section id="process" className="py-28 px-6" style={{ background: "var(--bg-base)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] mb-3" style={{ color: '#00E87A' }}>04 &mdash; Process</p>
          <h2 className="text-5xl md:text-6xl font-black tracking-[-0.04em] leading-none mb-14">
            Up and running<br /><span style={{ color: '#00E87A' }}>in 3 steps.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-[52px] h-px"
              style={{
                left: 'calc(16.67% + 28px)', right: 'calc(16.67% + 28px)',
                background: 'repeating-linear-gradient(90deg, rgba(0,232,122,0.2) 0px, rgba(0,232,122,0.2) 8px, transparent 8px, transparent 18px)'
              }} />
            {[
              { n: '01', title: 'Create Account',    desc: 'Sign up in 30 seconds. Choose your state for accurate tariff calculations.', icon: Database, col: '#00E87A' },
              { n: '02', title: 'Connect & Simulate', desc: 'Link IoT meters or use the built-in simulator to populate real data instantly.', icon: Activity, col: '#FF9500' },
              { n: '03', title: 'Optimise & Save',   desc: 'AI delivers personalized recommendations to cut consumption by up to 30%.', icon: Brain, col: '#C084FC' },
            ].map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.55 }}
                className="group rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-sub)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${step.col}30`; e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${step.col}20`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <span className="absolute -top-3 -right-1 text-[7rem] font-black font-mono leading-none select-none opacity-[0.04]"
                  style={{ color: step.col }}>{step.n}</span>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-6 relative z-10"
                  style={{ background: `${step.col}12`, border: `1px solid ${step.col}25` }}>
                  <step.icon className="w-5 h-5" style={{ color: step.col }} />
                </div>
                <h3 className="text-[15px] font-bold text-white mb-2">{step.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6 border-t" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-sub)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl overflow-hidden border p-12 md:p-20"
            style={{ background: 'linear-gradient(135deg, rgba(0,232,122,0.05) 0%, var(--bg-card) 45%, rgba(255,149,0,0.04) 100%)', borderColor: 'rgba(0,232,122,0.14)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(rgba(0,232,122,0.011) 1px,transparent 1px),linear-gradient(90deg,rgba(0,232,122,0.011) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(0,232,122,0.1) 0%, transparent 70%)', transform: 'translate(35%, -35%)' }} />
            <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-3xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,149,0,0.08) 0%, transparent 70%)', transform: 'translate(-35%, 35%)' }} />
            <div className="relative text-center">
              <p className="text-[10px] font-mono uppercase tracking-[0.4em] mb-5" style={{ color: '#00E87A' }}>Free &middot; Open &middot; No credit card</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-[-0.04em] leading-tight mb-4">
                Your grid.<br /><span style={{ color: '#00E87A', textShadow: '0 0 40px rgba(0,232,122,0.35)' }}>Your rules.</span>
              </h2>
              <p className="text-[14px] text-zinc-500 mb-10 max-w-sm mx-auto leading-relaxed">
                Join thousands already saving money and reducing environmental impact with HydroGrid.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/signup"
                  className="group flex items-center gap-2 px-9 py-4 text-[14px] font-black text-black rounded-xl justify-center transition-all hover:-translate-y-1"
                  style={{ background: '#00E87A', boxShadow: '0 8px 30px rgba(0,232,122,0.28)' }}>
                  <Droplets className="w-4 h-4" />
                  Create Free Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login"
                  className="flex items-center gap-2 px-9 py-4 text-[14px] font-semibold text-zinc-400 rounded-xl border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/[0.03] transition-all justify-center">
                  Sign in to Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-14 px-6" style={{ background: "var(--bg-base)", borderColor: "var(--border-sub)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#00E87A' }}>
                  <Droplets className="w-4 h-4 text-black" strokeWidth={2.5} />
                </div>
                <span className="font-black text-[17px] tracking-[-0.03em]">HydroGrid</span>
              </div>
              <p className="text-[13px] text-zinc-600 max-w-xs leading-relaxed">
                Smart water &amp; electricity intelligence. Built in India for a sustainable future.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-zinc-700 mb-5">Crafted by</p>
              <div className="space-y-3">
                {[
                  { name: 'Anant Yash',     role: 'Project Lead & Full-Stack', col: '#00E87A' },
                  { name: 'Adarsh Verma',   role: 'Backend Developer',         col: '#FF9500' },
                  { name: 'Ashish Shankar', role: 'Frontend Developer',        col: '#C084FC' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg border flex items-center justify-center text-[11px] font-black font-mono"
                      style={{ background: `${m.col}12`, borderColor: `${m.col}25`, color: m.col }}>{m.name[0]}</div>
                    <span className="text-[13px] font-semibold text-white">{m.name}</span>
                    <span className="text-zinc-700 text-xs">&mdash;</span>
                    <span className="text-[12px] text-zinc-600">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderColor: "var(--border-sub)" }}>
            <p className="text-[11px] font-mono text-zinc-700">&copy; {new Date().getFullYear()} HYDROGRID &middot; ALL RIGHTS RESERVED</p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Contact'].map(l => (
                <a key={l} href="#" className="text-[11px] font-mono uppercase tracking-wider text-zinc-700 hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

