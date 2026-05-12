/**
 * Viva Preparation PDF Generator for HydroGrid Project
 * Run: node generate_viva_pdf.js
 * Output: HydroGrid_Viva_Guide.pdf
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, 'HydroGrid_Viva_Guide.pdf');

const doc = new PDFDocument({
  margin: 50,
  size: 'A4',
  info: {
    Title: 'HydroGrid - Viva Preparation Guide',
    Author: 'HydroGrid',
    Subject: 'Full Stack Developer Project Viva',
  },
});

const stream = fs.createWriteStream(OUTPUT_FILE);
doc.pipe(stream);

// ── Color palette ──────────────────────────────────────────
const C = {
  primary:   '#1E40AF', // deep blue
  accent:    '#0EA5E9', // sky blue
  heading:   '#1E293B', // slate-900
  subhead:   '#334155', // slate-700
  body:      '#1E293B',
  muted:     '#64748B', // slate-500
  tableHead: '#1E40AF',
  tableRow1: '#F0F9FF',
  tableRow2: '#FFFFFF',
  green:     '#16A34A',
  red:       '#DC2626',
  border:    '#CBD5E1',
  codeBg:    '#F1F5F9',
};

// ── Helpers ────────────────────────────────────────────────

function coverPage() {
  // Background bar
  doc.rect(0, 0, doc.page.width, 220).fill(C.primary);

  doc.fillColor('#FFFFFF')
    .font('Helvetica-Bold')
    .fontSize(32)
    .text('HydroGrid', 50, 60, { align: 'center' });

  doc.fontSize(16)
    .font('Helvetica')
    .text('Smart Water & Electricity Intelligence Platform', 50, 105, { align: 'center' });

  doc.fontSize(20)
    .font('Helvetica-Bold')
    .text('VIVA PREPARATION GUIDE', 50, 145, { align: 'center' });

  doc.fillColor(C.accent)
    .fontSize(12)
    .font('Helvetica')
    .text('Full Stack Developer Project  •  April 2026', 50, 185, { align: 'center' });

  doc.fillColor(C.body).moveDown(6);
}

function sectionTitle(text, addPageBreak = false) {
  if (addPageBreak) doc.addPage();
  else doc.moveDown(1);

  const y = doc.y;
  doc.rect(50, y, doc.page.width - 100, 26).fill(C.primary);
  doc.fillColor('#FFFFFF')
    .font('Helvetica-Bold')
    .fontSize(13)
    .text(text, 58, y + 7);
  doc.fillColor(C.body).moveDown(0.8);
}

function subTitle(text) {
  doc.moveDown(0.5);
  doc.fillColor(C.accent)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text(text);
  doc.fillColor(C.body)
    .font('Helvetica')
    .fontSize(10)
    .moveDown(0.3);
}

function para(text) {
  doc.fillColor(C.body)
    .font('Helvetica')
    .fontSize(10)
    .text(text, { align: 'justify', lineGap: 2 })
    .moveDown(0.4);
}

function bullet(items) {
  items.forEach(item => {
    doc.fillColor(C.accent).font('Helvetica-Bold').fontSize(10).text('•  ', { continued: true });
    doc.fillColor(C.body).font('Helvetica').fontSize(10).text(item, { lineGap: 2 });
  });
  doc.moveDown(0.4);
}

function codeBlock(lines) {
  const startY = doc.y;
  const textHeight = lines.length * 13 + 14;
  doc.rect(50, startY, doc.page.width - 100, textHeight).fill(C.codeBg).stroke(C.border);
  doc.fillColor(C.primary).font('Courier').fontSize(9);
  lines.forEach((line, i) => {
    doc.text(line, 62, startY + 7 + i * 13);
  });
  doc.font('Helvetica').fillColor(C.body).moveDown(0.8);
  doc.y = startY + textHeight + 10;
}

function qaBlock(question, answer) {
  doc.moveDown(0.4);
  // Question
  doc.rect(50, doc.y, doc.page.width - 100, 18).fill('#EFF6FF');
  doc.fillColor(C.primary).font('Helvetica-Bold').fontSize(10)
    .text(`Q: ${question}`, 58, doc.y + 4);
  doc.moveDown(0.2);
  // Answer
  doc.fillColor(C.body).font('Helvetica').fontSize(10)
    .text(`A: ${answer}`, 58, doc.y, { width: doc.page.width - 116, align: 'justify', lineGap: 2 });
  doc.moveDown(0.6);
}

function simpleTable(headers, rows) {
  const colCount = headers.length;
  const colWidth = (doc.page.width - 100) / colCount;
  const startX = 50;
  let y = doc.y;

  // Header row
  doc.rect(startX, y, doc.page.width - 100, 18).fill(C.tableHead);
  headers.forEach((h, i) => {
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9)
      .text(h, startX + i * colWidth + 4, y + 5, { width: colWidth - 8, lineBreak: false });
  });
  y += 18;

  // Data rows
  rows.forEach((row, ri) => {
    const rowHeight = 16;
    doc.rect(startX, y, doc.page.width - 100, rowHeight)
      .fill(ri % 2 === 0 ? C.tableRow1 : C.tableRow2);
    row.forEach((cell, ci) => {
      doc.fillColor(C.body).font('Helvetica').fontSize(8.5)
        .text(String(cell), startX + ci * colWidth + 4, y + 4, { width: colWidth - 8, lineBreak: false });
    });
    y += rowHeight;
  });

  doc.y = y + 8;
  doc.moveDown(0.5);
}

// ═══════════════════════════════════════════════════════════
//  BUILD DOCUMENT
// ═══════════════════════════════════════════════════════════

coverPage();

// ── 1. Project Overview ──────────────────────────────────
sectionTitle('1. PROJECT OVERVIEW');
para('HydroGrid is a production-level, full-stack SaaS web application for tracking, analyzing, and optimizing water and electricity consumption using AI-powered insights, predictive analytics, and real-time monitoring. It targets Indian households and utilities with state-wise tariff calculations.');
bullet([
  'JWT Authentication with role-based access (User / Admin)',
  'Real-time dashboard with animated charts (Line, Bar, Pie/Donut)',
  'AI-powered anomaly detection (Z-score) and 30-day forecasting (Exponential Smoothing)',
  'Threshold-based color-coded alert system (green / yellow / red)',
  'State-wise India tariff calculator for electricity & water bills',
  'WebSocket live metrics feed (10-second push)',
  'Leaderboard, gamification badges, carbon footprint estimation',
  'CSV / PDF report export, Admin panel, India GeoJSON map',
]);

// ── 2. Tech Stack ────────────────────────────────────────
sectionTitle('2. TECH STACK', true);
simpleTable(
  ['Layer', 'Technology', 'Purpose'],
  [
    ['Frontend', 'React 18 + Vite', 'Fast HMR, component-based UI'],
    ['Styling', 'Tailwind CSS 3', 'Utility-first, no CSS bloat'],
    ['Charts', 'Recharts', 'React-native chart library'],
    ['Animations', 'Framer Motion', 'Smooth, declarative animations'],
    ['Icons', 'Lucide React', 'Lightweight SVG icons'],
    ['Backend', 'Node.js + Express.js', 'Non-blocking I/O, REST API'],
    ['Database', 'PostgreSQL (Supabase)', 'Relational, hosted cloud DB'],
    ['Auth', 'JWT + bcryptjs', 'Stateless, scalable authentication'],
    ['AI / LLM', 'Groq API (LLaMA 3-8B)', 'Fast inference for AI chat'],
    ['Real-time', 'WebSocket (ws library)', 'Live metrics push feed'],
    ['PDF Export', 'PDFKit', 'Server-side PDF generation'],
    ['Deploy', 'Docker + docker-compose', 'Containerized deployment'],
  ]
);

// ── 3. Architecture ──────────────────────────────────────
sectionTitle('3. SYSTEM ARCHITECTURE', true);
codeBlock([
  'Browser (React 18 + Vite)',
  '     │  HTTP/REST + WebSocket',
  '     ▼',
  'Express.js Server (Node.js, port 5000)',
  '  ├── Middleware : CORS, express.json, JWT protect',
  '  ├── Routes     : /api/auth  /api/usage  /api/alerts',
  '  │               /api/reports  /api/admin  /api/ai  /api/ml',
  '  ├── Controllers → Business Logic',
  '  ├── Utils      : aiEngine.js  groqAI.js  emailService.js',
  '  └── WebSocket  : /ws/live  (pushes every 10 s)',
  '     │',
  '     ▼',
  'PostgreSQL on Supabase (pg Pool, SSL)',
  '  ├── users table',
  '  ├── usage_data table',
  '  └── alerts table',
]);
para('The frontend is a React SPA served by Vite (dev) or Nginx (production). All data flows through a RESTful Express API protected by JWT middleware. WebSocket connections deliver live IoT simulations without polling.');

// ── 4. Authentication Flow ──────────────────────────────
sectionTitle('4. AUTHENTICATION FLOW', true);
subTitle('Registration');
bullet([
  'Client sends { name, email, password } to POST /api/auth/register',
  'Server checks duplicate email via SQL: SELECT id FROM users WHERE email=$1',
  'Password hashed: bcrypt.genSalt(10) then bcrypt.hash(password, salt)',
  'User inserted into DB, JWT generated (expires in 30 days), returned to client',
  'Welcome email sent asynchronously via emailService',
]);
subTitle('Login');
bullet([
  'Client sends { email, password } to POST /api/auth/login',
  'Server fetches user by email, runs bcrypt.compare(password, hash)',
  'On success: generates JWT signed with JWT_SECRET, returns token + user data',
]);
subTitle('Protected Routes');
bullet([
  'Frontend Axios interceptor adds Authorization: Bearer <token> to every request',
  'protect middleware: extracts token → jwt.verify() → fetches user from DB → req.user',
  'adminOnly middleware: checks req.user.role === "admin", returns 403 if not',
  'Response interceptor: catches 401 → clears localStorage → redirects to /login',
]);
qaBlock('Why JWT over sessions?', 'JWT is stateless — no server-side session store needed, scales horizontally. The token itself carries the user identity (id) signed with a secret key.');
qaBlock('Security concern with localStorage?', 'Vulnerable to XSS. Mitigation: React auto-escapes JSX output. Better alternative in production is httpOnly cookies to prevent JS access.');

// ── 5. Database ───────────────────────────────────────────
sectionTitle('5. DATABASE DESIGN', true);
subTitle('users table');
codeBlock([
  'id (PK), name, email (UNIQUE), password (bcrypt hash),',
  'role (user|admin), state, settings (JSONB), avatar,',
  'badges (JSONB), created_at',
]);
subTitle('usage_data table');
codeBlock([
  'id (PK), user_id (FK → users), type (water|electricity),',
  'value (NUMERIC), unit, timestamp, state/location',
]);
subTitle('alerts table');
codeBlock([
  'id (PK), user_id (FK → users), type, severity (green|yellow|red),',
  'message (TEXT), read (BOOLEAN), timestamp',
]);
qaBlock('Why PostgreSQL instead of MongoDB?', 'Relational data suits this app — users have structured relationships with usage records and alerts. Supabase provides instant hosted PostgreSQL, perfect for rapid deployment.');
qaBlock('What is Supabase?', 'An open-source Firebase alternative built on PostgreSQL. Provides hosted DB, auth, storage, and real-time features. We use it with the pg driver (raw parameterized SQL queries).');
qaBlock('What is a connection pool?', 'A pool manages multiple persistent DB connections. Instead of opening/closing a connection per query (expensive), the pool reuses connections efficiently. Configured with SSL for Supabase.');

// ── 6. API Endpoints ─────────────────────────────────────
sectionTitle('6. API ENDPOINTS', true);
simpleTable(
  ['Method', 'Route', 'Auth', 'Purpose'],
  [
    ['POST', '/api/auth/register', 'No', 'Create account'],
    ['POST', '/api/auth/login', 'No', 'Login, get JWT'],
    ['POST', '/api/auth/google', 'No', 'Google OAuth'],
    ['GET', '/api/auth/profile', 'JWT', 'Get user profile'],
    ['PUT', '/api/auth/profile', 'JWT', 'Update profile'],
    ['POST', '/api/usage', 'JWT', 'Add usage record'],
    ['GET', '/api/usage', 'JWT', 'Get usage history'],
    ['GET', '/api/usage/dashboard', 'JWT', 'Dashboard stats'],
    ['GET', '/api/usage/leaderboard', 'JWT', 'Efficiency rankings'],
    ['GET', '/api/usage/carbon', 'JWT', 'CO2 footprint'],
    ['GET', '/api/usage/tariff-estimate', 'JWT', 'Bill cost estimate'],
    ['GET', '/api/usage/map', 'JWT', 'State map data'],
    ['GET', '/api/alerts', 'JWT', 'Get alerts'],
    ['PUT', '/api/alerts/:id/read', 'JWT', 'Mark alert read'],
    ['DELETE', '/api/alerts/:id', 'JWT', 'Delete alert'],
    ['GET', '/api/admin/stats', 'Admin', 'Platform stats'],
    ['GET', '/api/admin/users', 'Admin', 'All users list'],
    ['GET', '/api/ai/detect-anomalies', 'JWT', 'Anomaly detection'],
    ['GET', '/api/ai/predict-next-30-days', 'JWT', '30-day forecast'],
    ['GET', '/api/ai/recommendations', 'JWT', 'Smart suggestions'],
    ['GET', '/api/ai/query', 'JWT', 'Groq LLM chat'],
    ['GET', '/api/health', 'No', 'Health check'],
    ['WS', '/ws/live', 'No', 'Real-time metrics'],
  ]
);

// ── 7. AI & ML ────────────────────────────────────────────
sectionTitle('7. AI & ML FEATURES', true);

subTitle('a) Anomaly Detection — Z-Score Method');
para('Flags abnormal spikes or drops in water/electricity usage. A Z-score measures how many standard deviations a value is from the mean.');
codeBlock([
  'z = (value − mean) / stdDev',
  '',
  'If |z| > 2.5  →  flagged as ANOMALY',
  '  value > mean  →  labeled SPIKE',
  '  value < mean  →  labeled DROP',
  '',
  'A Z-score > 2.5 covers ~98.8% of the normal distribution,',
  'meaning only truly unusual values are flagged.',
]);

subTitle('b) 30-Day Forecasting — Exponential Smoothing');
para('Generates future predictions with confidence intervals. Gives more weight to recent data, adapts to trends smoothly.');
codeBlock([
  'Formula:  S_t = α × x_t + (1 − α) × S_(t-1)',
  '',
  'α = 0.3  (smoothing factor)',
  '  → 30% weight on new observation',
  '  → 70% weight on previous smoothed value',
  '',
  'Seasonal adjustment: 7-day (day-of-week) cycle applied',
  'Confidence interval: ±10% of predicted level',
  'Output fields: predicted, lower, upper, confidence: 0.85',
]);

subTitle('c) Groq AI — LLaMA 3-8B Language Model');
bullet([
  'Model: llama3-8b-8192 via Groq API (fastest inference available)',
  'Temperature: 0.2 — near-deterministic, structured output',
  'System prompt forces JSON-only responses (no markdown)',
  'Used for natural language insights and recommendations',
  'Graceful fallback: if GROQ_API_KEY missing, feature disabled cleanly',
]);

subTitle('d) Smart Recommendations Engine');
bullet([
  'Rule-based engine comparing usage against averages and thresholds',
  'Analyzes historical patterns to generate actionable suggestions',
  'Example: "Reduce AC usage during peak hours to save ₹450/month"',
]);

qaBlock('What is exponential smoothing?', 'A time-series method giving more weight to recent data. α controls reactivity: high α = reacts quickly, low α = smoother. Used for 30-day demand forecasting.');
qaBlock('What is a Z-score?', 'Z = (x − μ) / σ. Measures standard deviations from the mean. |Z| > 2.5 means statistically unusual — occurs less than 1.2% of the time in a normal distribution.');

// ── 8. WebSocket ─────────────────────────────────────────
sectionTitle('8. REAL-TIME WEBSOCKET', true);
codeBlock([
  '// Server: broadcast live metrics every 10 seconds',
  'const wss = new WebSocketServer({ server, path: "/ws/live" });',
  '',
  'setInterval(() => {',
  '  const payload = {',
  '    type: "live_metrics",',
  '    waterLpm:      18 + Math.random() * 6,   // litres/min',
  '    electricityKw:  1.2 + Math.random() * 2.5, // kilowatts',
  '    alerts: Math.random() > 0.9 ? 1 : 0,',
  '    timestamp: new Date().toISOString()',
  '  };',
  '  wss.clients.forEach(client => client.send(JSON.stringify(payload)));',
  '}, 10000);',
]);
qaBlock('WebSocket vs HTTP?', 'HTTP is request-response — client must ask each time. WebSocket is full-duplex — server can push data anytime after a single handshake. Used here for live IoT metric streaming.');

// ── 9. Frontend Architecture ─────────────────────────────
sectionTitle('9. FRONTEND ARCHITECTURE', true);
subTitle('React 18 + Vite Setup');
bullet([
  'React 18 functional components with hooks (useState, useEffect, useContext, useCallback)',
  'React Router v6 — client-side SPA routing, no page reloads',
  'Vite — ES module dev server with instant HMR, Rollup for production builds',
]);
subTitle('3 Context Providers (wrap entire app)');
simpleTable(
  ['Context', 'State Provided', 'Persisted'],
  [
    ['AuthContext', 'user, token, login(), register(), logout()', 'localStorage'],
    ['ThemeContext', 'isDark, toggleTheme()', 'localStorage'],
    ['LanguageContext', 'language, setLanguage()', 'localStorage'],
  ]
);
subTitle('Protected Routing');
para('DashboardLayout wraps all authenticated pages. On render it checks AuthContext for a valid token. If absent, redirects to /login using React Router\'s <Navigate> component.');
subTitle('Axios API Layer (services/api.js)');
bullet([
  'Request interceptor: auto-attaches Bearer <token> to every outgoing request',
  'Response interceptor: catches 401 → clears localStorage → redirects to /login',
  'Timeout: 10 seconds per request',
  'Base URL: configurable via VITE_API_BASE_URL environment variable',
]);

qaBlock('What is Vite?', 'A modern build tool using native ES modules for dev (instant HMR) and Rollup for production. 10-100x faster cold starts compared to webpack-based Create React App.');
qaBlock('What is useContext?', 'A React hook that consumes a Context value without prop drilling. Any component calls useContext(AuthContext) to get auth state from anywhere in the tree.');
qaBlock('useEffect vs useCallback?', 'useEffect runs side effects after render (data fetching, subscriptions). useCallback memoizes a function reference to prevent unnecessary re-renders when passed as prop.');

// ── 10. Security (OWASP) ──────────────────────────────────
sectionTitle('10. SECURITY MEASURES (OWASP)', true);
simpleTable(
  ['Threat', 'Mitigation Applied'],
  [
    ['SQL Injection', 'Parameterized queries ($1, $2 placeholders) — no string concatenation'],
    ['Password Theft', 'bcrypt with salt (cost factor 10) — hashes are irreversible'],
    ['CSRF', 'JWT in Authorization header (not cookies) — cannot be sent cross-site'],
    ['CORS', 'Whitelist of allowed origins, rejects unknown domains'],
    ['Unauthorized Access', 'JWT protect middleware on all private routes'],
    ['Privilege Escalation', 'adminOnly middleware checks role === "admin" at server level'],
    ['Secret Leakage', 'JWT_SECRET and DB credentials in .env, never committed to git'],
    ['XSS', 'React auto-escapes JSX output, all responses are Content-Type JSON'],
    ['Request Flooding', '10MB body limit on express.json, timeout on Axios (10s)'],
    ['Info Leakage', 'Stack traces only sent in NODE_ENV=development'],
  ]
);

// ── 11. Tariff Calculation ───────────────────────────────
sectionTitle('11. INDIA TARIFF CALCULATION', true);
para('HydroGrid implements India-specific slab-based tariff for both electricity and water across multiple states. Each state has different rate slabs; cost is calculated progressively.');
codeBlock([
  '// Maharashtra Electricity Slabs',
  'upto 100 units  → ₹4.41 / unit',
  'upto 300 units  → ₹8.82 / unit',
  'upto 500 units  → ₹11.72 / unit',
  'above 500 units → ₹12.92 / unit',
  '',
  '// Delhi Water: FREE upto 20,000 litres (domestic)',
  '20,000 – 30,000 L → ₹0.03 / litre',
  'above 30,000 L   → ₹0.05 / litre',
]);
para('States supported: Maharashtra, Delhi, Karnataka, Uttar Pradesh, Gujarat + default nationwide rates.');

// ── 12. Deployment ───────────────────────────────────────
sectionTitle('12. DEPLOYMENT', true);
subTitle('Docker / docker-compose');
bullet([
  '3 services: hydrogrid-api (Node), hydrogrid-web (Nginx + React build), mongodb',
  'Health checks on API service: GET /api/health every 30 seconds',
  'Services restart unless-stopped for auto-recovery',
  'Environment variables injected at runtime (not baked into image)',
]);
subTitle('Cloud Options');
simpleTable(
  ['Platform', 'File', 'Service'],
  [
    ['Render.com', 'render.yaml', 'Backend API + static frontend'],
    ['Vercel', 'client/vercel.json', 'Frontend SPA deployment'],
    ['Docker Hub', 'server/Dockerfile + client/Dockerfile', 'Containerized full-stack'],
  ]
);

// ── 13. Common Q&A ───────────────────────────────────────
sectionTitle('13. COMMON VIVA QUESTIONS & ANSWERS', true);

const qna = [
  ['What is CORS?', 'Cross-Origin Resource Sharing. Browser blocks requests from localhost:5173 to localhost:5000 by default. The server explicitly allows it using the cors middleware with a whitelist of origins.'],
  ['What is REST?', 'Representational State Transfer — uses HTTP verbs (GET/POST/PUT/DELETE), stateless requests, and resource-based URLs. Our API follows REST conventions throughout.'],
  ['Difference between SQL and NoSQL?', 'SQL is structured, relational, ACID-compliant (PostgreSQL). NoSQL is schema-less, document or key-value based (MongoDB). We use PostgreSQL for relational integrity.'],
  ['What is middleware in Express?', 'A function (req, res, next) => {} that runs between request and response. Examples: protect (JWT check), errorHandler, cors (headers), express.json (body parsing).'],
  ['What does bcrypt.genSalt(10) do?', 'Generates a cryptographic salt with cost factor 10 (2^10 = 1024 hashing rounds). Makes brute-force attacks computationally expensive. Salt is embedded in the hash string itself.'],
  ['What is Tailwind CSS?', 'Utility-first CSS framework — styles composed inline with classes like flex, p-4, text-blue-500. Zero unused CSS in production via tree-shaking (PurgeCSS).'],
  ['Difference between PUT and PATCH?', 'PUT replaces the entire resource. PATCH partially updates it. We use PUT /api/auth/profile for profile updates.'],
  ['How does role-based access work?', "User's role stored in DB ('user' or 'admin'). JWT decoded → user fetched → req.user.role checked in adminOnly middleware. Returns 403 if role doesn't match."],
  ['What is the difference between == and ===?', '== allows type coercion ("1" == 1 is true). === checks both value and type ("1" === 1 is false). Always use === in JavaScript.'],
  ['What are React hooks?', 'Functions that let you use React state and lifecycle features in functional components. Key hooks used: useState, useEffect, useContext, useCallback.'],
  ['What is prop drilling and how did you avoid it?', 'Passing props through many component layers unnecessarily. Avoided using React Context API (AuthContext, ThemeContext, LanguageContext) for global state.'],
  ['What is a JWT token?', 'JSON Web Token — base64-encoded header.payload.signature. Server signs payload with JWT_SECRET. Clients send it in Authorization header. Stateless — no DB lookup needed to validate signature.'],
  ['What happens when a JWT expires?', 'jwt.verify() throws TokenExpiredError. The errorHandler returns 401. Frontend response interceptor catches it, clears localStorage, and redirects to /login.'],
  ['What is an Axios interceptor?', 'A function that intercepts every request or response. Request interceptor adds auth token. Response interceptor handles 401 errors globally without repeating code in every component.'],
];

qna.forEach(([q, a]) => qaBlock(q, a));

// ── 14. Project Uniqueness ───────────────────────────────
sectionTitle('14. WHAT MAKES YOUR PROJECT UNIQUE', true);
bullet([
  'India-specific state-wise tariff slabs — real, accurate utility bills',
  'No heavy ML libraries — custom Z-score & exponential smoothing in pure JavaScript',
  'Dual AI system — local statistical engine + Groq LLaMA 3 for natural language',
  'WebSocket live metrics feed simulating real IoT sensor data',
  'Full gamification — badges, leaderboard, carbon footprint scoring',
  'Production-ready — Docker, Nginx, health checks, error handling, CORS, env management',
  'India GeoJSON state map for geographic consumption visualization',
  'Google OAuth alongside traditional JWT authentication',
]);

// ── 15. Improvements ────────────────────────────────────
sectionTitle('15. POSSIBLE IMPROVEMENTS (If Asked)', true);
bullet([
  'Use httpOnly cookies for JWT instead of localStorage (prevents XSS token theft)',
  'Add rate limiting on auth endpoints using express-rate-limit',
  'Redis caching for leaderboard and dashboard aggregation queries',
  'WebSocket authentication — currently unauthenticated connections are accepted',
  'React Query for server state management (caching, background refetch)',
  'Unit and integration tests — Jest + React Testing Library',
  'HTTPS enforcement in production with SSL certificates via Let\'s Encrypt',
]);

// ── Footer on last page ──────────────────────────────────
doc.moveDown(2);
doc.rect(50, doc.y, doc.page.width - 100, 1).fill(C.border);
doc.moveDown(0.4);
doc.fillColor(C.muted).font('Helvetica').fontSize(9)
  .text('HydroGrid Viva Preparation Guide  •  Generated April 2026  •  All the best!', { align: 'center' });

// ── Finalize ─────────────────────────────────────────────
doc.end();

stream.on('finish', () => {
  console.log(`\n✅  PDF generated successfully!`);
  console.log(`📄  File: ${OUTPUT_FILE}\n`);
});

stream.on('error', (err) => {
  console.error('❌ Error writing PDF:', err.message);
});
