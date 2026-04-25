/**
 * IndiaMapPage.jsx — HydroGrid India Smart Analytics Map
 * -------------------------------------------------------
 * Full-featured India heatmap with:
 * - Green→Yellow→Orange→Red gradient heatmap
 * - Hover tooltips with state details + trend indicator
 * - Click to open detailed side panel
 * - Water / Electricity / Combined toggle
 * - Zoom + pan controls
 * - AI Insights box
 * - Time filter (daily, monthly, yearly)
 * - Alert system for critical states
 * - Rankings → auto-highlight on map
 * - Dark charcoal background, glow effects
 * - Legend with clear color meanings
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ComposableMap, Geographies, Geography, ZoomableGroup,
} from "react-simple-maps";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTip,
  ResponsiveContainer, Cell, LineChart, Line,
} from "recharts";
import {
  Search, TrendingUp, TrendingDown, Minus,
  Droplets, Zap, Activity, RotateCcw, MapPin,
  AlertCircle, Filter, Brain, X, ChevronRight,
  Clock, Calendar, CalendarDays, Bell, Leaf,
} from "lucide-react";
import { usageAPI } from "../services/api";

const GEO_URL = "/india_new.json";

const DISPUTED_ALIAS = {
  "Azad Kashmir":     "Jammu and Kashmir",
  "Gilgit-Baltistan": "Jammu and Kashmir",
  "Aksai Chin":       "Jammu and Kashmir",
};
const NAME_ALIAS = {
  "Odisha":      "Orissa",
  "Uttarakhand": "Uttaranchal",
  "Telengana":   "Telangana",
};
function resolveName(raw) {
  const a = NAME_ALIAS[raw] || raw;
  return DISPUTED_ALIAS[a] || a;
}

// STATE_DATA has been removed in favor of live DB map data.

function getVal(s, metric) {
  if (!s) return 0;
  if (metric === "water")       return s.water || 0;
  if (metric === "electricity") return s.electricity || 0;
  const w = s.water || 0;
  const e = s.electricity || 0;
  return Math.round((Math.min(100,(w/250)*100) + Math.min(100,(e/10)*100)) / 2);
}

const THRESHOLDS = {
  water:       [100, 140, 175],
  electricity: [3,   5,   7  ],
  combined:    [40,  60,  75 ],
};

// Actual min/max from STATE_DATA — used to spread full gradient across real data range
const DATA_RANGE = {
  water:       { min: 72,  max: 218 },
  electricity: { min: 1.6, max: 9.4 },
  combined:    { min: 20,  max: 92  },
};

// Returns a fully opaque rgb color: green (low) → yellow → orange → red (high)
// Normalized to actual data range so every color band is visible on the map
// Returns discrete color based on usage tier
function heatColor(value, metric, mult = 1) {
  const tier = zoneTier(value, metric, mult);
  return tierColor(tier);
}

function zoneTier(value, metric, mult = 1) {
  const m = metric === 'combined' ? 1 : mult;
  const [a, b, c] = THRESHOLDS[metric].map(v => v * m);
  if (value <= a) return "Low";
  if (value <= b) return "Moderate";
  if (value <= c) return "High";
  return "Critical";
}

const TIER_COLORS = {
  Low:      "#22c55e", 
  Moderate: "#eab308", 
  High:     "#f97316", 
  Critical: "#ef4444"
};

function tierColor(tier) {
  return TIER_COLORS[tier] || "#71717a";
}

const METRIC_CFG = {
  water:       { label: "Water",       unitBase: "L",   Icon: Droplets },
  electricity: { label: "Electricity", unitBase: "kWh", Icon: Zap      },
  combined:    { label: "Combined",    unitBase: "index",   Icon: Activity  },
};

const REGIONS = ["All","North","South","East","West","Central","NE","UT"];

const TIME_LABELS = {
  daily:   ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
  monthly: ["Jan","Feb","Mar","Apr","May","Jun","Jul"],
  yearly:  ["2021","2022","2023","2024","2025"],
};

const AI_INSIGHTS = {
  water: [
    "Punjab leads at 218 L/day — 36% above national average. Drip irrigation mandate recommended.",
    "Northeast states average 88 L/day — excellent conservation. Model for North India.",
    "4 states in Critical zone. Immediate infrastructure investment needed.",
    "Tamil Nadu trend rising despite 48% renewable mix — urban expansion driving demand.",
  ],
  electricity: [
    "Punjab tops at 9.4 kWh/day. Peak solar hours underutilised — 14% renewable potential.",
    "Himachal Pradesh: 78% renewable mix — model green energy state.",
    "Delhi-Haryana corridor shows synchronized peak demand — grid stress risk.",
    "5 Critical states consuming >7 kWh/day. Smart metering rollout recommended.",
  ],
  combined: [
    "North India consumes 3x more resources than Northeast states.",
    "Renewable energy inversely correlated with consumption — avg 22% reduction.",
    "18 states have active alerts — multi-resource conservation plan urgent.",
    "Maharashtra + Delhi = 28% national consumption at 13% of population.",
  ],
};

export default function IndiaMapPage() {
  const [metric,       setMetric]       = useState("water");
  const [region,       setRegion]       = useState("All");
  const [search,       setSearch]       = useState("");
  const [hovered,      setHovered]      = useState(null);
  const [selected,     setSelected]     = useState(null);
  const [tip,          setTip]          = useState({ x: 0, y: 0 });
  const [zoom,         setZoom]         = useState(1);
  const [center,       setCenter]       = useState([82, 22]);
  const timeFilter = "monthly";
  const [panelOpen,    setPanelOpen]    = useState(false);
  const [aiIdx,        setAiIdx]        = useState(0);
  const [mapStateData, setMapStateData] = useState(null);

  useEffect(() => {
    async function loadMapData() {
      try {
        const res = await usageAPI.getMapData();
        setMapStateData(res.data.data);
      } catch (err) {
        console.error("Failed to load map data from DB:", err);
        setMapStateData({});
      }
    }
    loadMapData();
  }, []);

  const STATE_DATA = mapStateData || {};


  const cfg = METRIC_CFG[metric];
  const multiplier = timeFilter === "monthly" ? 30 : timeFilter === "yearly" ? 365 : 1;
  const unitSuffix = metric === "combined" ? "" : (timeFilter === "monthly" ? "/mo" : timeFilter === "yearly" ? "/yr" : "/day");
  const displayUnit = cfg.unitBase + unitSuffix;

  const ranked = useMemo(() => {
    return Object.entries(STATE_DATA)
      .filter(([name, s]) => {
        const byRegion = region === "All" || s.region === region;
        const bySearch = !search.trim() || name.toLowerCase().includes(search.toLowerCase());
        return byRegion && bySearch;
      })
      .map(([name, s]) => {
        let val  = getVal(s, metric);
        if (metric !== 'combined') val *= multiplier;
        val = Number((parseFloat(val) || 0).toFixed(metric === 'electricity' ? 1 : 0));
        const tier = zoneTier(val, metric, multiplier);
        return { name, val, tier, accent: tierColor(tier), ...s };
      })
      .sort((a, b) => b.val - a.val);
  }, [metric, region, search, multiplier, STATE_DATA]);

  const chartData = useMemo(() =>
    ranked.slice(0, 8).map(s => ({
      name:     s.name.length > 8 ? s.name.split(" ")[0] : s.name,
      fullName: s.name,
      val:      s.val,
      color:    s.accent,
    })),
  [ranked]);

  const stats = useMemo(() => {
    const all  = Object.values(STATE_DATA);
    if (!all.length) return { avg: "0.0", crit: 0, totalAlerts: 0, renewable: "0" };

    const vals = all.map(s => {
      let v = getVal(s, metric);
      return metric === 'combined' ? v : v * multiplier;
    });
    
    // Guard against any specific NaN values in vals
    const safeVals = vals.filter(v => !isNaN(v));
    const avg  = safeVals.length ? (safeVals.reduce((a, b) => a + b, 0) / safeVals.length) : 0;
    
    const crit = all.filter(s => {
      let v = getVal(s, metric);
      v = metric === 'combined' ? v : v * multiplier;
      return zoneTier(v, metric, multiplier) === "Critical";
    }).length;
    const totalAlerts = all.reduce((a, s) => a + (s.alerts || 0), 0);
    
    const renewableSum = all.reduce((a, s) => a + (s.renewable || 0), 0);
    const renewable = all.length ? (renewableSum / all.length) : 0;
    
    return { 
      avg: (parseFloat(avg) || 0).toFixed(1), 
      crit, 
      totalAlerts, 
      renewable: (parseFloat(renewable) || 0).toFixed(0) 
    };
  }, [metric, multiplier, STATE_DATA]);

  const selectedData = selected ? STATE_DATA[selected] : null;

  const selectedTrendData = useMemo(() => {
    if (!selectedData) return [];
    const labels = TIME_LABELS[timeFilter];
    const baseVal = getVal(selectedData, metric);
    const scaledBase = metric === 'combined' ? baseVal : baseVal * multiplier;
    
    if (labels.length === 0) return [];

    const points = [];
    let cur = scaledBase * (selectedData.trend === 'up' ? 0.85 : selectedData.trend === 'down' ? 1.15 : 0.95);
    const inc = (scaledBase - cur) / (labels.length - 1);
    
    for (let i = 0; i < labels.length - 1; i++) {
        points.push({ label: labels[i], val: Math.round(cur) });
        cur += inc + (Math.random() - 0.5) * (scaledBase * 0.05); // slight noise
    }
    points.push({ label: labels[labels.length - 1], val: Math.round(scaledBase) });
    return points;
  }, [selectedData, metric, timeFilter, multiplier]);

  const handleGeoClick = useCallback((key) => {
    setSelected(prev => {
      if (prev === key) { setPanelOpen(false); return null; }
      setPanelOpen(true);
      return key;
    });
  }, []);

  const handleRankingClick = useCallback((name) => {
    setSelected(name);
    setPanelOpen(true);
  }, []);

  const maxVal = ranked[0]?.val || 1;
  const insightList = AI_INSIGHTS[metric];

  const TrendIcon = ({ trend, sz }) => {
    sz = sz || "w-3 h-3";
    if (trend === "up")   return <TrendingUp   className={sz + " flex-shrink-0"} style={{ color: "#ef4444" }} />;
    if (trend === "down") return <TrendingDown className={sz + " flex-shrink-0"} style={{ color: "#22c55e" }} />;
    return <Minus className={sz + " flex-shrink-0"} style={{ color: "#6b7280" }} />;
  };

  return (
    <div
      className="flex flex-col overflow-hidden text-hi"
      style={{ background: "var(--bg-base)", height: "calc(100vh - 0px)", minHeight: 0 }}
      onMouseMove={e => setTip({ x: e.clientX, y: e.clientY })}
    >
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-4 px-5 py-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border-sub)", background: "var(--bg-card)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)", boxShadow: "0 0 16px rgba(74,222,128,0.1)" }}>
            <MapPin className="w-4 h-4" style={{ color: "#4ade80" }} />
          </div>
          <div>
            <h1 className="font-black text-white text-base leading-none tracking-tight">India Smart Map</h1>
            <p className="text-[11px] mt-0.5 text-mid">
              {Object.keys(STATE_DATA).length} states & UTs · real-time consumption heatmap
            </p>
          </div>
        </div>

        {/* Metric toggle */}
        <div className="flex items-center gap-0.5 p-1 rounded-xl"
          style={{ background: "#161618", border: "1px solid rgba(255,255,255,0.07)" }}>
          {Object.entries(METRIC_CFG).map(([id, c]) => (
            <button key={id} onClick={() => { setMetric(id); setSelected(null); setPanelOpen(false); setAiIdx(0); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all"
              style={metric === id ? {
                background: "rgba(74,222,128,0.12)", color: "#4ade80",
                border: "1px solid rgba(74,222,128,0.28)", boxShadow: "0 0 14px rgba(74,222,128,0.12)",
              } : { color: "#52525b", border: "1px solid transparent" }}>
              <c.Icon className="w-3.5 h-3.5" />
              {c.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          {[
            { label: "Avg",      value: stats.avg,           unit: displayUnit, color: "#e4e4e7" },
            { label: "Critical", value: stats.crit,          unit: "states", color: "#ef4444" },
            { label: "Alerts",   value: stats.totalAlerts,   unit: "active", color: "#fb923c" },
            { label: "Renew.",   value: stats.renewable+"%", unit: "avg",    color: "#4ade80" },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="text-right hidden xl:block">
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "#52525b" }}>{label}</p>
              <p className="text-base font-black leading-none mt-0.5" style={{ color }}>
                {value}<span className="text-[10px] font-normal ml-1" style={{ color: "#52525b" }}>{unit}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>

        {/* MAP COLUMN */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ minWidth: 0 }}>

          {/* Region filters */}
          <div className="flex items-center gap-2 px-5 py-2 overflow-x-auto flex-shrink-0"
            style={{ borderBottom: "1px solid var(--border-sub)", background: "var(--bg-card)" }}>
            <Filter className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#3f3f46" }} />
            {REGIONS.map(r => (
              <button key={r} onClick={() => setRegion(r)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={region === r ? {
                  background: "rgba(74,222,128,0.1)", color: "#4ade80",
                  border: "1px solid rgba(74,222,128,0.25)", boxShadow: "0 0 10px rgba(74,222,128,0.08)",
                } : {
                  background: "rgba(255,255,255,0.02)", color: "#52525b",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}>
                {r === "NE" ? "Northeast" : r}
              </button>
            ))}
          </div>

          {/* AI Insights strip */}
          <div className="flex items-center gap-3 px-5 py-2.5 flex-shrink-0"
            style={{ background: "rgba(139,92,246,0.04)", borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Brain className="w-4 h-4" style={{ color: "#a78bfa" }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#7c3aed" }}>AI Insight</span>
            </div>
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.p key={metric + "-" + aiIdx}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="text-[12px] truncate" style={{ color: "#c4b5fd" }}>
                  {insightList[aiIdx % insightList.length]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              {insightList.map((_, i) => (
                <button key={i} onClick={() => setAiIdx(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: i === aiIdx % insightList.length ? "#a78bfa" : "rgba(167,139,250,0.2)" }} />
              ))}
            </div>
          </div>

          {/* Map canvas */}
          <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0, background: "var(--bg-elevated)" }}>
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center: [82, 22], scale: 1080 }}
              style={{ width: "100%", height: "100%", background: "transparent" }}
            >
              <ZoomableGroup zoom={zoom} center={center}
                onMoveEnd={({ coordinates, zoom: z }) => { setCenter(coordinates); setZoom(z); }}>
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo, idx) => {
                      const raw  = geo.properties.st_nm || geo.properties.NAME_1 || geo.properties.name || "";
                      const key  = resolveName(raw);
                      const data = STATE_DATA[key];
                      let val  = data ? getVal(data, metric) : 0;
                      if (data && metric !== 'combined') val *= multiplier;
                      const isHov  = hovered === key;
                      const isSel  = selected === key;
                      const isHlit = isHov || isSel;
                      const isDisp = !!DISPUTED_ALIAS[NAME_ALIAS[raw] || raw];

                      // Solid opaque colors
                      const baseColor  = data ? heatColor(val, metric, multiplier) : "var(--bg-base)";
                      const hoverColor = data ? heatColor(val, metric, multiplier) : "var(--bg-card)";
                      const glowC  = data ? heatColor(val, metric, multiplier) : "var(--text-lo)";
                      const strokeC = isSel ? "var(--text-hi)" : isHov ? "var(--text-mid)" : isDisp ? "var(--border-med)" : "var(--bg-elevated)";
                      const strokeW = isSel ? 2 : isHov ? 1.5 : 0.8;
                      const brightness = isHlit ? 1.25 : 1;
                      const currentTier = data ? zoneTier(val, metric, multiplier) : "Low";

                      return (
                        <Geography
                          key={key + "--" + metric + "--" + idx}
                          geography={geo}
                          fill={isHlit ? hoverColor : baseColor}
                          stroke={strokeC}
                          strokeWidth={strokeW}
                          strokeDasharray={isDisp ? "3 2" : undefined}
                          style={{
                            default: {
                              outline: "none", cursor: "pointer",
                              opacity: isDisp ? 0.55 : 1,
                              filter: isHlit
                                ? ("brightness(" + brightness + ") drop-shadow(0 0 10px " + glowC + "cc)")
                                : (data && currentTier === "Critical"
                                  ? ("drop-shadow(0 0 6px " + glowC + "88)")
                                  : "none"),
                            },
                            hover: { outline: "none", cursor: "pointer" },
                            pressed: { outline: "none", opacity: 0.85 },
                          }}
                          onMouseEnter={() => setHovered(key)}
                          onMouseLeave={() => setHovered(null)}
                          onClick={() => handleGeoClick(key)}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>

            {/* Zoom controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-1.5">
              {[{ lbl: "+", fn: () => setZoom(z => Math.min(z + 0.5, 8)) }, { lbl: "−", fn: () => setZoom(z => Math.max(z - 0.5, 0.8)) }].map(({ lbl, fn }) => (
                <button key={lbl} onClick={fn}
                  className="w-9 h-9 rounded-lg text-lg font-black flex items-center justify-center transition-all hover:text-white"
                  style={{ background: "rgba(12,12,14,0.94)", border: "1px solid rgba(255,255,255,0.1)", color: "#71717a", backdropFilter: "blur(8px)" }}>
                  {lbl}
                </button>
              ))}
              <button onClick={() => { setZoom(1); setCenter([82, 22]); }}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:text-white"
                style={{ background: "rgba(12,12,14,0.94)", border: "1px solid rgba(255,255,255,0.1)", color: "#71717a", backdropFilter: "blur(8px)" }}>
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Legend Overlay */}
            <div className="absolute bottom-5 left-5 p-4"
              style={{ background: "rgba(12,12,14,0.96)", border: "1px solid var(--border-med)", borderRadius: "1.25rem", backdropFilter: "blur(20px)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
              <p className="text-[11px] font-black uppercase tracking-widest mb-3 text-hi">
                {cfg.label} Usage Levels
              </p>
              {[
                { tier: "Low",      desc: metric === "water" ? `≤ ${(THRESHOLDS[metric][0] * multiplier).toLocaleString()} L` : metric === "electricity" ? `≤ ${(THRESHOLDS[metric][0] * multiplier).toLocaleString()} kWh` : "Low Risk" },
                { tier: "Moderate", desc: metric === "water" ? `${(THRESHOLDS[metric][0] * multiplier).toLocaleString()}–${(THRESHOLDS[metric][1] * multiplier).toLocaleString()} L` : metric === "electricity" ? `${(THRESHOLDS[metric][0] * multiplier).toLocaleString()}–${(THRESHOLDS[metric][1] * multiplier).toLocaleString()} kWh` : "Moderate Risk" },
                { tier: "High",     desc: metric === "water" ? `${(THRESHOLDS[metric][1] * multiplier).toLocaleString()}–${(THRESHOLDS[metric][2] * multiplier).toLocaleString()} L` : metric === "electricity" ? `${(THRESHOLDS[metric][1] * multiplier).toLocaleString()}–${(THRESHOLDS[metric][2] * multiplier).toLocaleString()} kWh` : "High Risk" },
                { tier: "Critical", desc: metric === "water" ? `> ${(THRESHOLDS[metric][2] * multiplier).toLocaleString()} L` : metric === "electricity" ? `> ${(THRESHOLDS[metric][2] * multiplier).toLocaleString()} kWh` : "Critical Risk" },
              ].map(({ tier, desc }) => (
                <div key={tier} className="flex items-center gap-3 mb-2 last:mb-0">
                  <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: TIER_COLORS[tier], boxShadow: `0 0 12px ${TIER_COLORS[tier]}66` }} />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-tight" style={{ color: TIER_COLORS[tier] }}>{tier}</span>
                    <span className="text-[12px] font-medium text-hi whitespace-nowrap">{desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected state badge */}
            <AnimatePresence>
              {selected && STATE_DATA[selected] && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute top-4 left-4 flex items-center gap-2.5 px-4 py-2.5 rounded-xl cursor-pointer"
                  style={{
                    background: "rgba(8,8,10,0.94)",
                    border: "1px solid " + tierColor(zoneTier(getVal(STATE_DATA[selected],metric) * (metric==='combined'?1:multiplier),metric, multiplier)) + "55",
                    backdropFilter: "blur(16px)",
                    boxShadow: "0 0 20px " + tierColor(zoneTier(getVal(STATE_DATA[selected],metric) * (metric==='combined'?1:multiplier),metric, multiplier)) + "22",
                  }}
                  onClick={() => setPanelOpen(true)}>
                  <div className="w-2 h-2 rounded-full" style={{
                    background: tierColor(zoneTier(getVal(STATE_DATA[selected],metric) * (metric==='combined'?1:multiplier),metric, multiplier)),
                    boxShadow: "0 0 8px " + tierColor(zoneTier(getVal(STATE_DATA[selected],metric) * (metric==='combined'?1:multiplier),metric, multiplier)),
                  }} />
                  <div>
                    <p className="text-xs font-bold text-white leading-none">{selected}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: tierColor(zoneTier((STATE_DATA[selected]?.water || 0) * (metric==='combined'?1:multiplier),metric, multiplier)) }}>
                      {(parseFloat((STATE_DATA[selected]?.water || 0) * (metric==='combined'?1:multiplier)) || 0).toFixed(metric==='electricity'?1:0)} {displayUnit} · {zoneTier((STATE_DATA[selected]?.water || 0) * (metric==='combined'?1:multiplier),metric, multiplier)}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" style={{ color: "#52525b" }} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-4 right-4 text-[10px]" style={{ color: "#3f3f46" }}>
              Scroll to zoom · Drag to pan · Click to select
            </div>
          </div>
        </div>

        {/* RANKINGS PANEL */}
        <div className="flex flex-col flex-shrink-0 overflow-hidden"
          style={{ borderLeft: "1px solid var(--border-sub)", background: "var(--bg-card)", minHeight: 0, width: 260 }}>

          <div className="px-3 pt-3 pb-2 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "#3f3f46" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search state..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl outline-none"
                style={{ background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.07)", color: "#e4e4e7" }} />
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-2 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2">
              <cfg.Icon className="w-3.5 h-3.5" style={{ color: "#4ade80" }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#52525b" }}>
                {cfg.label} Rankings
              </span>
            </div>
            <span className="text-[10px]" style={{ color: "#3f3f46" }}>{ranked.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            {ranked.map((s, i) => {
              const barW  = ((s.val / maxVal) * 100).toFixed(1);
              const active = selected === s.name || hovered === s.name;
              return (
                <motion.button key={s.name}
                  initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.015, 0.25) }}
                  onClick={() => handleRankingClick(s.name)}
                  className="w-full text-left px-3 py-2.5 transition-all"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                    background: active ? s.accent + "08" : "transparent",
                    borderLeft: active ? "2px solid " + s.accent : "2px solid transparent",
                  }}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold w-5 text-right flex-shrink-0"
                        style={{ color: i < 3 ? ["#fbbf24","#94a3b8","#cd7c2f"][i] : "#3f3f46" }}>
                        {i + 1}
                      </span>
                      <span className="text-xs text-white font-medium truncate">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs font-bold" style={{ color: s.accent }}>{s.val}</span>
                      <TrendIcon trend={s.trend} />
                    </div>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", marginLeft: 28 }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: barW + "%" }}
                      transition={{ duration: 0.5, delay: i * 0.012, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg," + s.accent + "88," + s.accent + ")", boxShadow: "0 0 4px " + s.accent + "44" }}
                    />
                  </div>
                  {active && s.alerts > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      className="mt-1.5 flex items-center gap-1.5 ml-7 text-[10px]" style={{ color: "#f87171" }}>
                      <AlertCircle className="w-2.5 h-2.5" />
                      {s.alerts} alerts
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {chartData.length > 0 && (
            <div className="flex-shrink-0 p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#52525b" }}>Top 8</p>
                <p className="text-[10px]" style={{ color: "#3f3f46" }}>{displayUnit}</p>
              </div>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: "#52525b", fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#52525b", fontSize: 8 }} axisLine={false} tickLine={false} />
                  <RechartsTip
                    contentStyle={{ background: "#141416", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#e4e4e7", fontSize: "11px" }}
                    labelFormatter={(_, p) => p?.[0]?.payload?.fullName}
                    formatter={v => [v, cfg.label]}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="val" radius={[3,3,0,0]} maxBarSize={28}>
                    {chartData.map((d, i) => (
                      <Cell key={i} fill={d.color} style={{ filter: "drop-shadow(0 -2px 4px " + d.color + "66)" }} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* DETAIL SIDE PANEL */}
        <AnimatePresence>
          {panelOpen && selected && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex-shrink-0 overflow-hidden"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.07)", background: "#0e0e10" }}
            >
              <div className="flex flex-col h-full overflow-y-auto" style={{ minWidth: 300 }}>
                <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                  style={{ borderBottom: "1px solid var(--border-sub)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{
                      background: tierColor(zoneTier(getVal(STATE_DATA[selected],metric) * (metric==='combined'?1:multiplier),metric, multiplier)),
                      boxShadow: "0 0 8px " + tierColor(zoneTier(getVal(STATE_DATA[selected],metric) * (metric==='combined'?1:multiplier),metric, multiplier)),
                    }} />
                    <h3 className="font-bold text-white text-sm">{selected}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold ml-1"
                      style={{
                        background: tierColor(zoneTier(getVal(STATE_DATA[selected],metric) * (metric==='combined'?1:multiplier),metric, multiplier)) + "18",
                        color: tierColor(zoneTier(getVal(STATE_DATA[selected],metric) * (metric==='combined'?1:multiplier),metric, multiplier)),
                        border: "1px solid " + tierColor(zoneTier(getVal(STATE_DATA[selected],metric) * (metric==='combined'?1:multiplier),metric, multiplier)) + "30",
                      }}>
                      {zoneTier(getVal(STATE_DATA[selected],metric) * (metric==='combined'?1:multiplier),metric, multiplier)}
                    </span>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <button onClick={() => { setPanelOpen(false); setSelected(null); }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                      style={{ color: "#71717a" }}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              {!STATE_DATA[selected] ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-base/20">
                  <div className="w-16 h-16 rounded-full bg-base/50 flex items-center justify-center mb-4 border border-sub">
                    <MapPin className="w-8 h-8 text-lo" />
                  </div>
                  <h4 className="text-hi font-bold mb-1">No Data Available</h4>
                  <p className="text-mid text-xs leading-relaxed max-w-[200px]">
                    We haven't received any telemetry from <b>{selected}</b> yet. 
                    Live sensors will be active here once connected.
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-4 flex-1 overflow-y-auto invisible-scrollbar">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Water",       value: ((STATE_DATA[selected]?.water || 0) * multiplier) + "",          unit: "L" + unitSuffix,   color: "#38bdf8", Icon: Droplets },
                      { label: "Electricity", value: Number(((STATE_DATA[selected]?.electricity || 0) * multiplier).toFixed(1)) + "",    unit: "kWh" + unitSuffix, color: "#fbbf24", Icon: Zap      },
                      { label: "Renewable",   value: (STATE_DATA[selected]?.renewable || 0) + "%",     unit: "mix",     color: "#4ade80", Icon: Leaf     },
                      { label: "Alerts",      value: (STATE_DATA[selected]?.alerts || 0) + "",         unit: "active",  color: (STATE_DATA[selected]?.alerts || 0) > 10 ? "#ef4444" : "#fb923c", Icon: Bell },
                    ].map(({ label, value, unit, color, Icon }) => (
                      <div key={label} className="rounded-xl p-3"
                        style={{ background: "var(--bg-elevated)", border: "1px solid " + color + "18" }}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Icon className="w-3 h-3" style={{ color }} />
                          <span className="text-[10px]" style={{ color: "#71717a" }}>{label}</span>
                        </div>
                        <p className="text-base font-black" style={{ color }}>
                          {value}<span className="text-[10px] font-normal ml-1" style={{ color: "#52525b" }}>{unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between rounded-xl px-3 py-2.5"
                    style={{
                      background: tierColor(zoneTier(getVal(STATE_DATA[selected],metric) * (metric==='combined'?1:multiplier),metric, multiplier)) + "10",
                      border: "1px solid " + tierColor(zoneTier(getVal(STATE_DATA[selected],metric) * (metric==='combined'?1:multiplier),metric, multiplier)) + "22",
                    }}>
                    <div>
                      <p className="text-[10px]" style={{ color: "#71717a" }}>Trend</p>
                      <p className="font-bold text-sm mt-0.5 capitalize"
                        style={{ color: STATE_DATA[selected].trend === "up" ? "#ef4444" : STATE_DATA[selected].trend === "down" ? "#22c55e" : "#71717a" }}>
                        {STATE_DATA[selected].trend}
                      </p>
                    </div>
                    <TrendIcon trend={STATE_DATA[selected].trend} sz="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <p className="text-[11px] font-bold text-dark-400">Trend Chart</p>
                       <p className="text-[10px] capitalize text-dark-500">{timeFilter}</p>
                     </div>
                    <ResponsiveContainer width="100%" height={100}>
                      <LineChart data={selectedTrendData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                        <XAxis dataKey="label" tick={{ fill: "var(--text-lo)", fontSize: 8 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "var(--text-lo)", fontSize: 8 }} axisLine={false} tickLine={false} domain={["auto","auto"]} />
                        <RechartsTip
                          contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-sub)", borderRadius: "8px", color: "var(--text-hi)", fontSize: "11px" }}
                          formatter={v => [(parseFloat(v) || 0).toFixed(1), cfg.label]}
                          cursor={{ stroke: "var(--border-sub)" }}
                        />
                        <Line type="monotone" dataKey="val"
                          stroke={tierColor(zoneTier(getVal(STATE_DATA[selected],metric) * (metric==='combined'?1:multiplier),metric, multiplier))}
                          strokeWidth={2} dot={false}
                          style={{ filter: "drop-shadow(0 0 4px " + tierColor(zoneTier(getVal(STATE_DATA[selected],metric) * (metric==='combined'?1:multiplier),metric, multiplier)) + "88)" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="rounded-xl p-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-sub)" }}>
                    {[
                      { label: "Region",     value: STATE_DATA[selected].region },
                      { label: "Population", value: STATE_DATA[selected].pop + "M" },
                      { label: "Value",      value: Number((getVal(STATE_DATA[selected],metric) * (metric==='combined'?1:multiplier)).toFixed(metric==='electricity'?1:0)) + " " + displayUnit },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-1">
                        <span className="text-[11px] text-dark-400">{label}</span>
                        <span className="text-[11px] font-semibold text-white">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl p-3" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
                      <span className="text-[11px] font-bold" style={{ color: "#a78bfa" }}>AI Recommendation</span>
                    </div>
                    {STATE_DATA[selected] && (
                      <p className="text-[11px] leading-relaxed" style={{ color: "#c4b5fd" }}>
                        {STATE_DATA[selected].trend === "up"
                          ? selected + " shows rising consumption. Smart metering and tiered pricing can reduce demand by 15%."
                          : STATE_DATA[selected].trend === "down"
                          ? selected + " is on a downward trend — conservation policies are working well."
                          : selected + " is stable. Demand-side management can prevent future spikes."}
                      </p>
                    )}
                  </div>

                  {/* Existing data-rich content */}
                  <div className="px-6 py-6 space-y-8">
                    {/* Summary Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.05]">
                        <p className="text-[10px] uppercase font-bold text-dark-500 mb-1">Monthly Avg</p>
                        <p className="text-xl font-black text-white">
                          {(STATE_DATA[selected].water * 30).toLocaleString()} <span className="text-xs font-normal text-dark-400">L</span>
                        </p>
                      </div>
                      <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.05]">
                        <p className="text-[10px] uppercase font-bold text-dark-500 mb-1">Elec. Usage</p>
                        <p className="text-xl font-black text-white">
                          {(STATE_DATA[selected].electricity * 30).toLocaleString()} <span className="text-xs font-normal text-dark-400">kWh</span>
                        </p>
                      </div>
                    </div>

                    {/* Trend Chart */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-dark-400">Consumption Trend</h4>
                        <span className="text-[10px] text-dark-500 px-2 py-0.5 rounded-md bg-dark-800 uppercase leading-none">Last 7 Days</span>
                      </div>
                      <div className="h-[140px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={selectedTrendData}>
                            <defs>
                              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={tierColor(zoneTier(getVal(STATE_DATA[selected],metric)*multiplier, metric, multiplier))} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={tierColor(zoneTier(getVal(STATE_DATA[selected],metric)*multiplier, metric, multiplier))} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Line 
                              type="monotone" 
                              dataKey="val" 
                              stroke={tierColor(zoneTier(getVal(STATE_DATA[selected],metric)*multiplier, metric, multiplier))} 
                              strokeWidth={3} 
                              dot={{ r: 4, fill: tierColor(zoneTier(getVal(STATE_DATA[selected],metric)*multiplier, metric, multiplier)), strokeWidth: 2, stroke: "#0e0e11" }}
                              activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <RechartsTip content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-[#1a1a1e] border border-white/10 p-2 rounded-lg shadow-2xl">
                                    <p className="text-[10px] font-bold text-white mb-1">{payload[0].payload.label}</p>
                                    <p className="text-xs font-black" style={{ color: tierColor(zoneTier(getVal(STATE_DATA[selected],metric)*multiplier, metric, multiplier)) }}>
                                      {payload[0].value.toLocaleString()} {displayUnit}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Recent Alerts */}
                    {STATE_DATA[selected].alerts > 0 && (
                      <div className="rounded-xl p-3" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5" style={{ color: "#f87171" }} />
                          <span className="text-[11px] font-bold" style={{ color: "#f87171" }}>
                            {STATE_DATA[selected].alerts} Active Alerts
                          </span>
                        </div>
                        <p className="text-[11px] mt-1.5" style={{ color: "#fca5a5" }}>
                          Threshold breaches detected. Immediate action recommended.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hovered && STATE_DATA[hovered] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              style={{
                position: "fixed",
                left: tip.x + 18,
                top: Math.min(tip.y - 12, window.innerHeight - 210),
                zIndex: 9999,
                pointerEvents: "none",
                background: "var(--bg-navbar)",
                border: "1px solid " + tierColor(zoneTier(getVal(STATE_DATA[hovered],metric) * (metric==='combined'?1:multiplier),metric, multiplier)) + "55",
                borderRadius: "16px",
                padding: "14px 18px",
                minWidth: "220px",
                backdropFilter: "blur(24px)",
                boxShadow: "0 24px 56px rgba(0,0,0,0.4), 0 0 20px " + tierColor(zoneTier(getVal(STATE_DATA[hovered],metric) * (metric==='combined'?1:multiplier),metric, multiplier)) + "18",
              }}>
              <div className="absolute top-0 left-4 right-4 h-px rounded-full"
                style={{ background: "linear-gradient(90deg,transparent," + tierColor(zoneTier(getVal(STATE_DATA[hovered],metric) * (metric==='combined'?1:multiplier),metric, multiplier)) + "99,transparent)" }} />

              <div className="flex items-center justify-between mb-3">
                <p className="font-black text-white text-sm">{hovered}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{
                    background: tierColor(zoneTier(getVal(STATE_DATA[hovered],metric) * (metric==='combined'?1:multiplier),metric, multiplier)) + "18",
                    color: tierColor(zoneTier(getVal(STATE_DATA[hovered],metric) * (metric==='combined'?1:multiplier),metric, multiplier)),
                    border: "1px solid " + tierColor(zoneTier(getVal(STATE_DATA[hovered],metric) * (metric==='combined'?1:multiplier),metric, multiplier)) + "30",
                  }}>
                  {zoneTier(getVal(STATE_DATA[hovered],metric) * (metric==='combined'?1:multiplier),metric, multiplier)}
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { Icon: Droplets, label: "Water",       value: (STATE_DATA[hovered].water * multiplier) + " L" + unitSuffix,        color: "#38bdf8" },
                  { Icon: Zap,      label: "Electricity",  value: Number((STATE_DATA[hovered].electricity * multiplier).toFixed(1)) + " kWh" + unitSuffix, color: "#fbbf24" },
                  { Icon: Leaf,     label: "Renewable",    value: STATE_DATA[hovered].renewable + "%",          color: "#4ade80" },
                ].map(({ Icon, label, value, color }) => (
                  <div key={label} className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3 h-3" style={{ color }} />
                      <span className="text-xs text-dark-400">{label}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between"
                style={{ borderTop: "1px solid var(--border-sub)" }}>
                <span className="text-[10px] text-dark-500">Trend</span>
                <div className="flex items-center gap-1.5">
                  {STATE_DATA[hovered].trend === "up"     && <><TrendingUp   className="w-3 h-3" style={{ color: "#ef4444" }} /><span className="text-[10px] font-bold" style={{ color: "#ef4444" }}>Rising</span></>}
                  {STATE_DATA[hovered].trend === "down"   && <><TrendingDown className="w-3 h-3" style={{ color: "#22c55e" }} /><span className="text-[10px] font-bold" style={{ color: "#22c55e" }}>Declining</span></>}
                  {STATE_DATA[hovered].trend === "stable" && <><Minus className="w-3 h-3 text-dark-400" /><span className="text-[10px] font-bold text-dark-400">Stable</span></>}
                </div>
              </div>

              {STATE_DATA[hovered].alerts > 5 && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px]" style={{ color: "#f87171" }}>
                  <AlertCircle className="w-3 h-3" />
                  {STATE_DATA[hovered].alerts} alerts · click for details
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
