/**
 * WorldMapPage.jsx – HydroGrid Global Consumption Intelligence Map
 * Interactive world choropleth map showing water & electricity data by country
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ComposableMap, Geographies, Geography, ZoomableGroup,
} from 'react-simple-maps';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  Globe2, Droplets, Zap, TrendingUp, TrendingDown, Minus,
  Wind, Search, X, Info, Download, RefreshCw, AlertTriangle,
  Activity, BarChart2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// ─── World TopoJSON URL ────────────────────────────────────────────────────────
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ─── Country Data (ISO-3166-1 numeric codes → stats) ─────────────────────────
// water: litres/person/day | electricity: kWh/person/day | renewable: % | trend: up/down/stable
const COUNTRY_DATA = {
  // Americas
  '840': { name: 'United States',    water: 360, electricity: 12.4, renewable: 21, pop: 331,  trend: 'stable', stress: 3.2, region: 'Americas' },
  '124': { name: 'Canada',           water: 310, electricity: 14.6, renewable: 67, pop: 38,   trend: 'down',   stress: 2.1, region: 'Americas' },
  '484': { name: 'Mexico',           water: 185, electricity: 5.1,  renewable: 25, pop: 130,  trend: 'up',     stress: 3.5, region: 'Americas' },
  '076': { name: 'Brazil',           water: 220, electricity: 6.8,  renewable: 83, pop: 213,  trend: 'stable', stress: 2.8, region: 'Americas' },
  '032': { name: 'Argentina',        water: 245, electricity: 7.2,  renewable: 35, pop: 45,   trend: 'up',     stress: 2.5, region: 'Americas' },
  '152': { name: 'Chile',            water: 195, electricity: 6.5,  renewable: 48, pop: 19,   trend: 'down',   stress: 2.2, region: 'Americas' },
  '170': { name: 'Colombia',         water: 175, electricity: 4.2,  renewable: 72, pop: 51,   trend: 'stable', stress: 2.3, region: 'Americas' },
  '604': { name: 'Peru',             water: 168, electricity: 3.8,  renewable: 58, pop: 33,   trend: 'stable', stress: 2.1, region: 'Americas' },
  // Europe
  '276': { name: 'Germany',          water: 122, electricity: 7.8,  renewable: 46, pop: 83,   trend: 'down',   stress: 1.8, region: 'Europe' },
  '250': { name: 'France',           water: 148, electricity: 9.1,  renewable: 22, pop: 67,   trend: 'down',   stress: 1.6, region: 'Europe' },
  '826': { name: 'United Kingdom',   water: 135, electricity: 6.4,  renewable: 42, pop: 68,   trend: 'down',   stress: 1.7, region: 'Europe' },
  '380': { name: 'Italy',            water: 165, electricity: 5.2,  renewable: 37, pop: 60,   trend: 'down',   stress: 2.0, region: 'Europe' },
  '724': { name: 'Spain',            water: 178, electricity: 6.1,  renewable: 43, pop: 47,   trend: 'down',   stress: 2.4, region: 'Europe' },
  '528': { name: 'Netherlands',      water: 128, electricity: 7.6,  renewable: 32, pop: 17,   trend: 'down',   stress: 1.9, region: 'Europe' },
  '752': { name: 'Sweden',           water: 115, electricity: 12.8, renewable: 98, pop: 10,   trend: 'down',   stress: 0.8, region: 'Europe' },
  '578': { name: 'Norway',           water: 108, electricity: 18.2, renewable: 98, pop: 5,    trend: 'stable', stress: 0.6, region: 'Europe' },
  '246': { name: 'Finland',          water: 118, electricity: 13.5, renewable: 89, pop: 5.5,  trend: 'stable', stress: 0.7, region: 'Europe' },
  '620': { name: 'Portugal',         water: 158, electricity: 5.8,  renewable: 62, pop: 10,   trend: 'down',   stress: 2.1, region: 'Europe' },
  '616': { name: 'Poland',           water: 138, electricity: 6.9,  renewable: 18, pop: 38,   trend: 'up',     stress: 2.0, region: 'Europe' },
  '348': { name: 'Hungary',          water: 145, electricity: 4.8,  renewable: 22, pop: 10,   trend: 'stable', stress: 2.2, region: 'Europe' },
  '203': { name: 'Czech Republic',   water: 132, electricity: 6.8,  renewable: 17, pop: 11,   trend: 'stable', stress: 1.9, region: 'Europe' },
  '804': { name: 'Ukraine',          water: 152, electricity: 3.8,  renewable: 13, pop: 44,   trend: 'down',   stress: 2.3, region: 'Europe' },
  // Asia
  '356': { name: 'India',            water: 142, electricity: 4.1,  renewable: 22, pop: 1393, trend: 'up',     stress: 3.8, region: 'Asia' },
  '156': { name: 'China',            water: 168, electricity: 8.2,  renewable: 28, pop: 1412, trend: 'up',     stress: 3.5, region: 'Asia' },
  '392': { name: 'Japan',            water: 225, electricity: 7.8,  renewable: 22, pop: 126,  trend: 'down',   stress: 2.2, region: 'Asia' },
  '410': { name: 'South Korea',      water: 195, electricity: 11.2, renewable: 6,  pop: 52,   trend: 'stable', stress: 2.8, region: 'Asia' },
  '682': { name: 'Saudi Arabia',     water: 268, electricity: 14.5, renewable: 3,  pop: 35,   trend: 'up',     stress: 4.8, region: 'Asia' },
  '784': { name: 'UAE',              water: 315, electricity: 18.6, renewable: 4,  pop: 10,   trend: 'up',     stress: 4.9, region: 'Asia' },
  '050': { name: 'Bangladesh',       water: 128, electricity: 2.4,  renewable: 4,  pop: 169,  trend: 'up',     stress: 3.6, region: 'Asia' },
  '586': { name: 'Pakistan',         water: 158, electricity: 2.8,  renewable: 8,  pop: 225,  trend: 'up',     stress: 4.1, region: 'Asia' },
  '458': { name: 'Malaysia',         water: 198, electricity: 9.6,  renewable: 21, pop: 33,   trend: 'up',     stress: 2.9, region: 'Asia' },
  '764': { name: 'Thailand',         water: 182, electricity: 7.4,  renewable: 15, pop: 70,   trend: 'stable', stress: 2.7, region: 'Asia' },
  '360': { name: 'Indonesia',        water: 148, electricity: 3.5,  renewable: 14, pop: 274,  trend: 'up',     stress: 2.4, region: 'Asia' },
  '704': { name: 'Vietnam',          water: 138, electricity: 4.8,  renewable: 28, pop: 98,   trend: 'up',     stress: 2.5, region: 'Asia' },
  '608': { name: 'Philippines',      water: 132, electricity: 3.2,  renewable: 25, pop: 111,  trend: 'up',     stress: 2.3, region: 'Asia' },
  '792': { name: 'Turkey',           water: 175, electricity: 5.8,  renewable: 34, pop: 85,   trend: 'up',     stress: 3.2, region: 'Asia' },
  '643': { name: 'Russia',           water: 195, electricity: 8.4,  renewable: 22, pop: 145,  trend: 'stable', stress: 1.8, region: 'Asia' },
  // Africa
  '710': { name: 'South Africa',     water: 188, electricity: 6.8,  renewable: 12, pop: 60,   trend: 'up',     stress: 3.9, region: 'Africa' },
  '566': { name: 'Nigeria',          water: 108, electricity: 0.9,  renewable: 20, pop: 211,  trend: 'up',     stress: 3.5, region: 'Africa' },
  '818': { name: 'Egypt',            water: 178, electricity: 4.2,  renewable: 9,  pop: 104,  trend: 'up',     stress: 4.5, region: 'Africa' },
  '504': { name: 'Morocco',          water: 135, electricity: 3.1,  renewable: 35, pop: 37,   trend: 'stable', stress: 3.2, region: 'Africa' },
  '012': { name: 'Algeria',          water: 145, electricity: 4.5,  renewable: 3,  pop: 44,   trend: 'up',     stress: 3.8, region: 'Africa' },
  '404': { name: 'Kenya',            water: 88,  electricity: 1.1,  renewable: 74, pop: 54,   trend: 'stable', stress: 2.8, region: 'Africa' },
  '231': { name: 'Ethiopia',         water: 62,  electricity: 0.4,  renewable: 95, pop: 118,  trend: 'stable', stress: 2.1, region: 'Africa' },
  '800': { name: 'Uganda',           water: 55,  electricity: 0.3,  renewable: 92, pop: 47,   trend: 'stable', stress: 1.9, region: 'Africa' },
  '834': { name: 'Tanzania',         water: 58,  electricity: 0.3,  renewable: 88, pop: 63,   trend: 'stable', stress: 2.0, region: 'Africa' },
  '288': { name: 'Ghana',            water: 72,  electricity: 1.2,  renewable: 52, pop: 33,   trend: 'stable', stress: 2.4, region: 'Africa' },
  // Oceania
  '036': { name: 'Australia',        water: 285, electricity: 11.8, renewable: 28, pop: 26,   trend: 'down',   stress: 2.8, region: 'Oceania' },
  '554': { name: 'New Zealand',      water: 198, electricity: 9.2,  renewable: 82, pop: 5,    trend: 'down',   stress: 1.4, region: 'Oceania' },
};

const METRICS = [
  { key: 'water',       label: 'Water Use',   unit: 'L/day',     icon: Droplets, color: '#3b82f6' },
  { key: 'electricity', label: 'Electricity', unit: 'kWh/day',   icon: Zap,      color: '#f59e0b' },
  { key: 'renewable',   label: 'Renewable',   unit: '% share',   icon: Wind,     color: '#10b981' },
  { key: 'stress',      label: 'Stress Index',unit: 'index',     icon: Activity, color: '#ef4444' },
];

const REGIONS = ['All', 'Americas', 'Europe', 'Asia', 'Africa', 'Oceania'];

// ─── Color helpers ────────────────────────────────────────────────────────────
function getColor(d, metric) {
  if (!d) return '#334155';
  if (metric === 'water') {
    if (d.water > 250) return '#ef4444';
    if (d.water > 160) return '#f97316';
    if (d.water > 100) return '#eab308';
    return '#22c55e';
  }
  if (metric === 'electricity') {
    if (d.electricity > 12) return '#ef4444';
    if (d.electricity > 7)  return '#f97316';
    if (d.electricity > 3)  return '#eab308';
    return '#22c55e';
  }
  if (metric === 'renewable') {
    if (d.renewable > 70) return '#22c55e';
    if (d.renewable > 35) return '#eab308';
    if (d.renewable > 15) return '#f97316';
    return '#ef4444';
  }
  if (metric === 'stress') {
    if (d.stress > 4)   return '#ef4444';
    if (d.stress > 2.5) return '#f97316';
    if (d.stress > 1.5) return '#eab308';
    return '#22c55e';
  }
  return '#334155';
}

function getLabel(d, metric) {
  if (!d) return '—';
  const m = METRICS.find(m => m.key === metric);
  const val = d[metric];
  return `${typeof val === 'number' ? val.toFixed(metric === 'stress' ? 1 : 0) : val} ${m.unit}`;
}

function trendIcon(trend) {
  if (trend === 'up')   return <TrendingUp   className="w-3.5 h-3.5 text-red-400" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-green-400" />;
  return <Minus className="w-3.5 h-3.5 text-zinc-400" />;
}

// ─── Legend ───────────────────────────────────────────────────────────────────
const LEGENDS = {
  water:       [{ c: '#22c55e', l: '< 100' }, { c: '#eab308', l: '100–160' }, { c: '#f97316', l: '160–250' }, { c: '#ef4444', l: '> 250' }],
  electricity: [{ c: '#22c55e', l: '< 3'   }, { c: '#eab308', l: '3–7'    }, { c: '#f97316', l: '7–12'   }, { c: '#ef4444', l: '> 12'  }],
  renewable:   [{ c: '#ef4444', l: '< 15%' }, { c: '#f97316', l: '15–35%' }, { c: '#eab308', l: '35–70%' }, { c: '#22c55e', l: '> 70%' }],
  stress:      [{ c: '#22c55e', l: '< 1.5' }, { c: '#eab308', l: '1.5–2.5'}, { c: '#f97316', l: '2.5–4'  }, { c: '#ef4444', l: '> 4'   }],
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function WorldMapPage() {
  const { isDark } = useTheme();
  const [metric, setMetric]           = useState('water');
  const [region, setRegion]           = useState('All');
  const [hovered, setHovered]         = useState(null);   // { name, data, x, y }
  const [selected, setSelected]       = useState(null);   // country data
  const [search, setSearch]           = useState('');
  const [zoom, setZoom]               = useState(1);
  const [center, setCenter]           = useState([0, 20]);

  const activeMetric = METRICS.find(m => m.key === metric);

  // Filtered country list for sidebar
  const filteredCountries = useMemo(() => {
    return Object.entries(COUNTRY_DATA)
      .filter(([, d]) => {
        const matchRegion = region === 'All' || d.region === region;
        const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
        return matchRegion && matchSearch;
      })
      .sort((a, b) => (b[1][metric] ?? 0) - (a[1][metric] ?? 0));
  }, [region, search, metric]);

  // Top-5 bar chart data
  const chartData = useMemo(() => {
    return filteredCountries
      .slice(0, 8)
      .map(([, d]) => ({ name: d.name.split(' ')[0], value: d[metric] }));
  }, [filteredCountries, metric]);

  // Summary stats
  const stats = useMemo(() => {
    const values = Object.values(COUNTRY_DATA).map(d => d[metric]).filter(Boolean);
    const avg    = values.reduce((a, b) => a + b, 0) / values.length;
    const max    = Math.max(...values);
    const min    = Math.min(...values);
    return { avg: avg.toFixed(1), max: max.toFixed(1), min: min.toFixed(1), count: values.length };
  }, [metric]);

  const handleMouseEnter = useCallback((geo, evt) => {
    const id   = geo.id;
    const data = COUNTRY_DATA[String(id).padStart(3, '0')];
    const rect = evt.currentTarget?.closest('svg')?.getBoundingClientRect();
    setHovered({
      name: data?.name ?? geo.properties?.name ?? 'Unknown',
      data,
      x: evt.clientX - (rect?.left ?? 0),
      y: evt.clientY - (rect?.top  ?? 0),
    });
  }, []);

  const handleMouseLeave = useCallback(() => setHovered(null), []);

  const handleClick = useCallback((geo) => {
    const id   = geo.id;
    const data = COUNTRY_DATA[String(id).padStart(3, '0')];
    if (data) setSelected(data);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-screen bg-[#0a0a0f]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Globe2 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Global Intelligence Map</h1>
            <p className="text-sm text-zinc-500">Water &amp; electricity consumption across {Object.keys(COUNTRY_DATA).length} countries</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setZoom(1); setCenter([0, 20]); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white text-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white text-sm transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </motion.div>

      {/* ── KPI Row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Avg ' + activeMetric.label, value: stats.avg + ' ' + activeMetric.unit, icon: activeMetric.icon, color: activeMetric.color },
          { label: 'Highest',  value: stats.max + ' ' + activeMetric.unit, icon: TrendingUp,   color: '#ef4444' },
          { label: 'Lowest',   value: stats.min + ' ' + activeMetric.unit, icon: TrendingDown, color: '#22c55e' },
          { label: 'Countries', value: stats.count, icon: Globe2, color: '#8b5cf6' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-xs text-zinc-500">{label}</span>
            </div>
            <p className="text-xl font-bold text-white">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Metric Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              metric === m.key
                ? 'text-white border-transparent'
                : 'bg-white/[0.03] border-white/[0.07] text-zinc-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            style={metric === m.key ? { backgroundColor: m.color + '22', borderColor: m.color + '44', color: m.color } : {}}
          >
            <m.icon className="w-4 h-4" />
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Main content: map + sidebar ─────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-4">

        {/* Map ─────────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden relative"
          style={{ minHeight: 420 }}
        >
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 130, center: [0, 20] }}
            style={{ width: '100%', height: '100%', minHeight: 420 }}
          >
            <ZoomableGroup
              zoom={zoom}
              center={center}
              minZoom={0.8}
              maxZoom={8}
              onMoveEnd={({ zoom: z, coordinates }) => {
                setZoom(z);
                setCenter(coordinates);
              }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const id   = String(geo.id).padStart(3, '0');
                    const data = COUNTRY_DATA[id];
                    const fill = getColor(data, metric);
                    const isSelected = selected?.name === data?.name;
                    return (
                      <Geography
                        key={`${geo.rsmKey}-${metric}`}
                        geography={geo}
                        fill={fill}
                        stroke="#0f172a"
                        strokeWidth={0.4}
                        style={{
                          default:  { fill, outline: 'none', opacity: data ? 1 : 0.25 },
                          hover:    { fill: '#60a5fa', outline: 'none', cursor: 'pointer' },
                          pressed:  { fill: '#3b82f6', outline: 'none' },
                        }}
                        className={isSelected ? 'ring-2 ring-blue-400' : ''}
                        onMouseEnter={e => handleMouseEnter(geo, e)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(geo)}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {/* Tooltip */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute pointer-events-none bg-[#1a1a2e]/95 border border-white/10 rounded-xl px-3 py-2 shadow-2xl z-10 text-sm"
                style={{ left: hovered.x + 14, top: hovered.y - 10, maxWidth: 200 }}
              >
                <p className="font-semibold text-white">{hovered.name}</p>
                {hovered.data ? (
                  <>
                    <p className="text-zinc-400">{getLabel(hovered.data, metric)}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-zinc-500 text-xs">
                      {trendIcon(hovered.data.trend)}
                      <span>{hovered.data.trend} trend</span>
                    </div>
                  </>
                ) : (
                  <p className="text-zinc-500 text-xs">No data available</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 bg-[#0d0d14]/90 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-3">
            <span className="text-xs text-zinc-500 font-medium">
              {activeMetric.label} ({activeMetric.unit})
            </span>
            {LEGENDS[metric].map(({ c, l }) => (
              <div key={l} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: c }} />
                <span className="text-xs text-zinc-400">{l}</span>
              </div>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            <button onClick={() => setZoom(z => Math.min(z * 1.5, 8))} className="w-8 h-8 flex items-center justify-center bg-[#1a1a2e]/90 border border-white/10 rounded-lg text-zinc-300 hover:text-white text-lg font-bold">+</button>
            <button onClick={() => setZoom(z => Math.max(z / 1.5, 0.8))} className="w-8 h-8 flex items-center justify-center bg-[#1a1a2e]/90 border border-white/10 rounded-lg text-zinc-300 hover:text-white text-lg font-bold">−</button>
          </div>
        </motion.div>

        {/* Sidebar ─────────────────────────────────────────────────────────── */}
        <div className="xl:w-80 flex flex-col gap-4">

          {/* Search + Region filter */}
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search country…"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {REGIONS.map(r => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    region === r
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : 'bg-white/[0.03] border-white/[0.07] text-zinc-500 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Country list */}
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-4 flex-1">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BarChart2 className="w-3.5 h-3.5" />
              Rankings — {activeMetric.label}
            </h3>
            <div className="space-y-1 overflow-y-auto max-h-64 pr-1">
              {filteredCountries.map(([id, d], i) => {
                const pct = metric === 'renewable' ? d.renewable : 0;
                const max = filteredCountries[0]?.[1]?.[metric] ?? 1;
                const barW = Math.round((d[metric] / max) * 100);
                return (
                  <button
                    key={id}
                    onClick={() => setSelected(d)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors text-left ${selected?.name === d.name ? 'bg-white/[0.06]' : ''}`}
                  >
                    <span className="text-zinc-600 text-xs w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs text-zinc-300 truncate">{d.name}</span>
                        <span className="text-xs text-white font-mono shrink-0">{d[metric]?.toFixed(metric === 'stress' ? 1 : 0)}</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/[0.06] mt-0.5">
                        <div className="h-1 rounded-full" style={{ width: barW + '%', background: getColor(d, metric) }} />
                      </div>
                    </div>
                    {trendIcon(d.trend)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bar chart top 8 */}
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Top Countries</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <RechartsTip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={activeMetric.color} opacity={1 - i * 0.09} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Country Detail Panel ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">{selected.name}</h2>
                <p className="text-sm text-zinc-500">{selected.region} · {selected.pop} M population</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {METRICS.map(m => (
                <div key={m.key} className="bg-white/[0.04] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <m.icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                    <span className="text-xs text-zinc-500">{m.label}</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {selected[m.key]?.toFixed(m.key === 'stress' ? 1 : 0)}
                    <span className="text-sm font-normal text-zinc-500 ml-1">{m.unit}</span>
                  </p>
                  <div
                    className="mt-1.5 h-1.5 rounded-full"
                    style={{ background: getColor(selected, m.key), opacity: 0.7, width: '100%' }}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 text-sm">
                {trendIcon(selected.trend)}
                <span className="text-zinc-400">
                  Consumption trend: <span className="text-white font-medium capitalize">{selected.trend}</span>
                </span>
              </div>
              {selected.stress > 3.5 && (
                <div className="flex items-center gap-1.5 text-sm text-orange-400">
                  <AlertTriangle className="w-4 h-4" />
                  High water stress region
                </div>
              )}
              {selected.renewable >= 70 && (
                <div className="flex items-center gap-1.5 text-sm text-green-400">
                  <Wind className="w-4 h-4" />
                  High renewable adoption
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
