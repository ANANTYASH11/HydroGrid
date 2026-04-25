# HydroGrid: Smart Water & Electricity Intelligence Platform

A production-level, full-stack SaaS web application for tracking, analyzing, and optimizing water and electricity consumption using AI-powered insights, predictive analytics, and real-time monitoring. 

![Tech Stack](https://img.shields.io/badge/React-18-61dafb?logo=react) ![Node](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb) ![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS_3-06B6D4?logo=tailwindcss)

---

## 🎯 Features 

### Core
- **🔐 JWT Authentication** — Secure login/signup with role-based access (User/Admin)
- **📊 Smart Dashboard** — Real-time charts, animated counters, usage comparisons
- **🤖 AI Insights** — Linear regression predictions, anomaly detection, smart suggestions
- **🚨 Alert System** — Threshold-based, color-coded (green/yellow/red) notifications
- **🧾 Reports** — CSV/PDF export, cost estimation, daily breakdowns

### Advanced
- **🏆 Leaderboard** — Ranked efficiency scores across users
- **🌱 Carbon Footprint** — CO₂ estimation from electricity usage
- **🎮 Gamification** — Badges for sustainable behavior  
- **🌙 Dark/Light Mode** — Beautiful theme toggle with persistence
- **📱 Fully Responsive** — Mobile-first design

---

## 🛠️ Tech Stack

| Layer        | Technology                                    |
|-------------|----------------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS 3               |
| Charts      | Recharts (Line, Bar, Pie/Donut)              |
| Animations  | Framer Motion                                |
| Icons       | Lucide React                                 |
| Backend     | Node.js, Express.js                          |
| Database    | MongoDB (Mongoose ODM)                       |
| Auth        | JWT (JSON Web Tokens), bcryptjs              |
| PDF Export  | PDFKit                                       |

---

## � Quick Start

### Prerequisites
- **Node.js** 16+
- **npm** 8+
- **MongoDB** (local or cloud)

### Installation & Setup

#### 1️⃣ Clone & Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

#### 2️⃣ Configure Environment

**Server** (`server/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/hydrogrid
JWT_SECRET=your_super_secret_jwt_key_change_in_production
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000
```

#### 3️⃣ Start MongoDB
```bash
# On Windows (if installed)
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in server/.env with connection string
```

#### 4️⃣ Run Development Servers

**Terminal 1 - Backend**:
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd client
npm run dev
```

**Open browser**: `http://localhost:5173`

#### 5️⃣ Seed Demo Data (Optional)
```bash
cd server
npm run seed
```

---

## 📁 Project Structure

```
├── client/                      # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # DashboardLayout, Sidebar, Navbar
│   │   │   ├── charts/          # Recharts components (Line, Bar, Pie)
│   │   │   └── cards/           # StatCard (animated metrics)
│   │   ├── pages/               # All page components
│   │   │   ├── Dashboard.jsx    # Main analytics view
│   │   │   ├── InsightsPage.jsx # AI predictions & anomalies
│   │   │   ├── ReportsPage.jsx  # CSV/PDF export
│   │   │   ├── AlertsPage.jsx   # Notification management
│   │   │   ├── ProfilePage.jsx  # User settings & badges
│   │   │   ├── LeaderboardPage.jsx  # Efficiency rankings
│   │   │   ├── LoginPage.jsx    # Auth screen
│   │   │   ├── SignupPage.jsx   # Registration
│   │   │   └── LandingPage.jsx  # Public homepage
│   │   ├── context/             # Global state
│   │   │   ├── AuthContext.jsx  # Auth state & methods
│   │   │   └── ThemeContext.jsx # Dark/Light mode
│   │   ├── services/
│   │   │   └── api.js           # Axios client with interceptors
│   │   ├── utils/
│   │   │   ├── analytics.js     # ML (regression, anomalies)
│   │   │   └── config.js        # App config
│   │   ├── App.jsx              # Router & providers
│   │   └── index.css            # Tailwind & global styles
│
├── server/                      # Node.js Backend (Express)
│   ├── models/                  # MongoDB Schemas
│   │   ├── User.js              # User accounts & settings
│   │   ├── Usage.js             # Consumption readings
│   │   └── Alert.js             # Threshold alerts
│   ├── controllers/             # Business logic
│   │   ├── authController.js    # Register, Login, Profile
│   │   ├── usageController.js   # CRUD + Analytics + IoT
│   │   ├── alertController.js   # Alert management
│   │   └── reportController.js  # CSV/PDF generation
│   ├── routes/                  # API endpoints
│   │   ├── auth.js              # /api/auth/*
│   │   ├── usage.js             # /api/usage/*
│   │   ├── alerts.js            # /api/alerts/*
│   │   └── reports.js           # /api/reports/*
│   ├── middleware/              # Express middleware
│   │   ├── auth.js              # JWT verification
│   │   └── errorHandler.js      # Global error handling
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── utils/
│   │   └── seedData.js          # Demo data generator
│   ├── server.js                # Entry point
│   └── package.json
```
│   │   ├── pages/               # All route pages
│   │   ├── context/             # AuthContext, ThemeContext
│   │   ├── services/            # API service (Axios)
│   │   └── utils/               # Analytics ML functions
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                      # Node.js Backend
│   ├── config/                  # MongoDB connection
│   ├── controllers/             # Route handlers (MVC)
│   ├── middleware/              # Auth, error handling
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # Express routes
│   ├── utils/                   # Seed data generator
│   └── server.js                # Entry point
│
└── README.md
```

---

## 🚀 Setup Guide

### Prerequisites
- **Node.js** v18+ 
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)

### Step 1: Clone & Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Configure Environment

```bash
# In server/ directory, create .env file:
cp .env.example .env

# Edit .env with your MongoDB connection string:
MONGODB_URI=mongodb://localhost:27017/hydrogrid
JWT_SECRET=your_secret_key_here
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Step 3: Seed Sample Data

```bash
cd server
npm run seed
```

This creates:
- 5 demo users with badges
- 6 months of realistic water + electricity data
- Sample alerts

### Step 4: Run the Application

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

### Step 5: Open in Browser

Navigate to: **http://localhost:5173**

**Demo Credentials:**
| Role  | Email                | Password     |
|-------|---------------------|-------------|
| Admin | anant@hydrogrid.com | password123 |
| User  | demo@hydrogrid.com  | demo123     |

> **Note:** The platform is configured for Indian locale (₹ INR, IST timezone).

---

## 🧠 AI/ML Features (Explained)

### Linear Regression (Prediction)
- **Algorithm**: Least squares method
- **Purpose**: Predicts next 7 days of consumption based on 30-day history
- **Implementation**: `client/src/utils/analytics.js` → `linearRegression()`, `predictFuture()`
- **How it works**: Fits a line `y = mx + b` to historical data points and extrapolates

### Anomaly Detection
- **Algorithm**: Z-Score analysis
- **Purpose**: Detects unusual spikes in usage (e.g., leaks, faults)
- **Threshold**: Z-score > 2 (outside 95% of normal distribution)
- **Implementation**: `detectAnomalies()` function

### Smart Suggestions
- **Algorithm**: Rule-based expert system
- **Purpose**: Actionable recommendations to reduce costs
- **Examples**: Peak hour optimization, AC settings, leak detection

### Carbon Footprint
- **Formula**: `CO₂ (kg) = kWh × 0.42` (global average emission factor)
- **Trees needed**: `CO₂ / 22` (1 tree absorbs ~22 kg CO₂/year)

---

## 🔗 API Endpoints

| Method | Endpoint                     | Description              | Auth |
|--------|------------------------------|--------------------------|------|
| POST   | `/api/auth/register`         | Register user            | ✗    |
| POST   | `/api/auth/login`            | Login                    | ✗    |
| GET    | `/api/auth/profile`          | Get profile              | ✓    |
| PUT    | `/api/auth/profile`          | Update profile           | ✓    |
| POST   | `/api/usage`                 | Add reading              | ✓    |
| GET    | `/api/usage`                 | Get usage data           | ✓    |
| GET    | `/api/usage/dashboard`       | Dashboard stats          | ✓    |
| POST   | `/api/usage/simulate`        | Simulate IoT data        | ✓    |
| GET    | `/api/usage/leaderboard`     | Efficiency rankings      | ✓    |
| GET    | `/api/usage/carbon`          | Carbon footprint         | ✓    |
| GET    | `/api/alerts`                | Get alerts               | ✓    |
| PUT    | `/api/alerts/:id/read`       | Mark alert read          | ✓    |
| PUT    | `/api/alerts/read-all`       | Mark all read            | ✓    |
| GET    | `/api/reports`               | Generate report          | ✓    |
| GET    | `/api/reports/download/csv`  | Download CSV             | ✓    |
| GET    | `/api/reports/download/pdf`  | Download PDF             | ✓    |

---

## 🇮🇳 Indian Locale Configuration

| Setting      | Value                         |
|-------------|-------------------------------|
| Currency    | ₹ INR (Indian Rupee)           |
| Timezone    | IST (Asia/Kolkata, UTC+05:30) |
| Locale      | en-IN                         |
| Water Rate  | ₹0.05 per liter                |
| Elec. Rate  | ₹8.00 per kWh                  |
| Date Format | DD/MM/YYYY                    |

---

## 👥 Team

| Name             | Role                              |
|-----------------|-----------------------------------|
| **Anant Yash**   | Project Lead & Full Stack Developer |
| **Adarsh Verma** | Backend Developer & Database Architect |
| **Ashish Shankar** | Frontend Developer & UI/UX Designer |

---

## 📜 License

MIT — Built with ♥ in India for a sustainable future.

**Team:** Anant Yash · Adarsh Verma · Ashish Shankar
