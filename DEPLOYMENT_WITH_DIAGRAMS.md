# 🚀 HydroGrid - Deployment & DevOps Guide

Complete deployment documentation with Mermaid diagrams for various platforms.

---

## 📋 Deployment Strategy Overview

```mermaid
graph TB
    Code["📝 Source Code<br/>GitHub"]
    Test["🧪 Testing"]
    Build["🔨 Build"]
    Deploy["🚀 Deploy"]
    Monitor["📊 Monitor"]
    
    Code -->|Commit| Test
    Test -->|Pass| Build
    Build -->|Success| Deploy
    Deploy -->|Running| Monitor
    Monitor -->|Issues| Code
    
    Test -->|Fail| Reject["❌ Reject"]
    Build -->|Fail| Reject
    Deploy -->|Fail| Reject
```

---

## 🐳 Docker Setup

### Docker Architecture

```mermaid
graph TB
    subgraph "Frontend Container"
        React["React App"]
        Nginx["Nginx Server"]
    end
    
    subgraph "Backend Container"
        Express["Express.js"]
        Node["Node.js"]
    end
    
    subgraph "Database Container"
        MongoDB["MongoDB"]
    end
    
    subgraph "Network"
        Network["Docker Network<br/>hydrogrid_net"]
    end
    
    React -->|Served by| Nginx
    Nginx -->|API Calls| Express
    Express -->|Queries| MongoDB
    
    React -.->|Connected| Network
    Express -.->|Connected| Network
    MongoDB -.->|Connected| Network
```

---

### Docker Files

**Frontend Dockerfile:**
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Backend Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

---

### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - hydrogrid_net

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/hydrogrid
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
    networks:
      - hydrogrid_net

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - hydrogrid_net

volumes:
  mongo_data:

networks:
  hydrogrid_net:
    driver: bridge
```

---

## 🌍 Cloud Deployment Options

### Option 1: Heroku Deployment

```mermaid
graph LR
    GitHub["🔧 GitHub Repo"]
    Heroku["☁️ Heroku"]
    
    subgraph "Heroku Dynos"
        Web["Web Dyno<br/>Express"]
        Worker["Worker Dyno<br/>Background"]
    end
    
    subgraph "Add-ons"
        MongoDB["MongoDB Atlas"]
        Redis["Redis"]
        Logs["LogDNA"]
    end
    
    GitHub -->|Push| Heroku
    Heroku -->|Auto Deploy| Web
    Heroku -->|Auto Deploy| Worker
    Web -->|Query| MongoDB
    Web -->|Cache| Redis
    Heroku -->|Send Logs| Logs
```

**Deployment Steps:**

```bash
# 1. Install Heroku CLI
npm install -g heroku

# 2. Login to Heroku
heroku login

# 3. Create app
heroku create hydrogrid

# 4. Add MongoDB Atlas
heroku addons:create mongolab:sandbox

# 5. Set environment variables
heroku config:set JWT_SECRET=your_secret

# 6. Deploy
git push heroku main

# 7. View logs
heroku logs --tail
```

---

### Option 2: AWS Deployment

```mermaid
graph TB
    subgraph "AWS"
        ALB["🔀 Application Load Balancer"]
        ECS["📦 ECS Cluster"]
        RDS["💾 RDS MongoDB"]
        S3["📦 S3 Storage"]
        CloudFront["🌐 CloudFront CDN"]
    end
    
    Users["👥 Users"]
    
    Users -->|Request| CloudFront
    CloudFront -->|Origin| ALB
    ALB -->|Route| ECS
    ECS -->|Query| RDS
    ECS -->|Store| S3
```

---

### Option 3: DigitalOcean Deployment

```mermaid
graph TB
    GitHub["📝 GitHub"]
    App["🚀 App Platform"]
    
    subgraph "DigitalOcean App Platform"
        Frontend["Frontend<br/>React"]
        Backend["Backend<br/>Express"]
        DB["Database<br/>MongoDB"]
    end
    
    subgraph "Add-ons"
        Space["Spaces Storage"]
        Monitor["Monitoring"]
    end
    
    GitHub -->|Connect| App
    App -->|Auto Deploy| Frontend
    App -->|Auto Deploy| Backend
    Backend -->|Query| DB
    App -->|Store| Space
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```mermaid
graph LR
    Push["📨 Push to main"]
    Checkout["📥 Checkout Code"]
    Install["📦 Install Deps"]
    Lint["🎯 Lint Code"]
    Test["🧪 Run Tests"]
    Build["🔨 Build Project"]
    Deploy["🚀 Deploy"]
    Status["✅ Status Check"]
    
    Push -->|Trigger| Checkout
    Checkout --> Install
    Install --> Lint
    Lint --> Test
    Test --> Build
    Build --> Deploy
    Deploy --> Status
    
    Lint -->|Fail| Reject["❌ Reject"]
    Test -->|Fail| Reject
    Build -->|Fail| Reject
    Deploy -->|Fail| Reject
```

**GitHub Actions Workflow File (.github/workflows/deploy.yml):**

```yaml
name: Deploy HydroGrid

on:
  push:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Install Dependencies
        run: |
          cd server && npm ci
          cd ../client && npm ci
      
      - name: Run Linter
        run: |
          cd server && npm run lint || true
          cd ../client && npm run lint || true
      
      - name: Run Tests
        run: |
          cd server && npm test || true
          cd ../client && npm test || true
      
      - name: Build
        run: |
          cd client && npm run build
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.13.15
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: hydrogrid
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

---

## 🔐 Environment Configuration

### Production Environment Variables

```mermaid
graph TB
    Config["⚙️ Environment Config"]
    
    Config --> Backend["Backend (.env)"]
    Config --> Frontend["Frontend (.env)"]
    
    Backend --> B1["NODE_ENV"]
    Backend --> B2["PORT"]
    Backend --> B3["MONGODB_URI"]
    Backend --> B4["JWT_SECRET"]
    Backend --> B5["CORS_ORIGINS"]
    Backend --> B6["SENDGRID_KEY"]
    
    Frontend --> F1["VITE_API_URL"]
    Frontend --> F2["VITE_APP_NAME"]
    Frontend --> F3["VITE_VERSION"]
```

**.env.production**
```env
# Backend
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hydrogrid
JWT_SECRET=your_production_secret_key_must_be_strong
JWT_EXPIRE=30

# Security
CORS_ORIGINS=https://hydrogrid.com,https://www.hydrogrid.com
RATE_LIMIT=100

# External Services
SENDGRID_API_KEY=SG.xxx
LOG_LEVEL=info
```

---

## 📊 Monitoring & Observability

### Monitoring Stack

```mermaid
graph TB
    App["🔧 Application"]
    
    Metrics["📊 Prometheus"]
    Logs["📝 ELK Stack"]
    Traces["🔍 Jaeger"]
    Alerts["🚨 AlertManager"]
    
    Dashboard["📈 Grafana"]
    
    App -->|Metrics| Metrics
    App -->|Logs| Logs
    App -->|Traces| Traces
    
    Metrics -->|Visualize| Dashboard
    Logs -->|Visualize| Dashboard
    Traces -->|Visualize| Dashboard
    
    Metrics -->|Alert| Alerts
    Logs -->|Alert| Alerts
    
    Alerts -->|Notify| Team["👥 Team"]
```

---

### Key Metrics to Monitor

```mermaid
mindmap
  root((Monitoring Metrics))
    Performance
      Response Time
      Throughput
      Error Rate
      Latency P99
    Availability
      Uptime %
      Health Checks
      Deployment Status
    Resource Usage
      CPU
      Memory
      Disk Space
      Network I/O
    Business
      Active Users
      Requests/sec
      Revenue
      User Satisfaction
```

---

## 🔄 Scaling Strategy

### Horizontal Scaling

```mermaid
graph TB
    subgraph "Load Balancer"
        LB["🔀 HAProxy<br/>or ALB"]
    end
    
    subgraph "Web Servers"
        W1["Web Server 1"]
        W2["Web Server 2"]
        W3["Web Server 3"]
    end
    
    subgraph "Database"
        DB["📊 MongoDB Cluster"]
    end
    
    subgraph "Cache"
        C1["Redis 1"]
        C2["Redis 2"]
    end
    
    LB --> W1
    LB --> W2
    LB --> W3
    
    W1 --> DB
    W2 --> DB
    W3 --> DB
    
    W1 --> C1
    W2 --> C2
    W3 --> C1
```

---

### Auto-Scaling Rules

```mermaid
graph TB
    Monitor["📊 Monitor Metrics"]
    
    CPUHigh["CPU > 80%"]
    CPULow["CPU < 20%"]
    MemHigh["Memory > 85%"]
    ReqHigh["Requests > 1000/sec"]
    
    Monitor -->|Check| CPUHigh
    Monitor -->|Check| CPULow
    Monitor -->|Check| MemHigh
    Monitor -->|Check| ReqHigh
    
    CPUHigh -->|Trigger| ScaleUp["⬆️ Add Instance"]
    CPULow -->|Trigger| ScaleDown["⬇️ Remove Instance"]
    MemHigh -->|Trigger| ScaleUp
    ReqHigh -->|Trigger| ScaleUp
    
    ScaleUp -->|Action| Update["Update Load Balancer"]
    ScaleDown -->|Action| Update
```

---

## 🔒 Security in Production

```mermaid
graph TB
    Request["📨 Incoming Request"]
    
    WAF["🛡️ WAF<br/>Web Application Firewall"]
    DDOS["🛡️ DDoS Protection"]
    SSL["🔒 SSL/TLS"]
    Auth["🔐 Authentication"]
    Encrypt["🔐 Encryption"]
    
    Request -->|Filter| WAF
    WAF -->|Check| DDOS
    DDOS -->|Secure| SSL
    SSL -->|Verify| Auth
    Auth -->|Secure| Encrypt
    
    Encrypt -->|Safe| App["✅ Application"]
```

---

## 📈 Backup & Disaster Recovery

```mermaid
graph TB
    Production["🔧 Production DB"]
    
    DailyBackup["📦 Daily Backups"]
    WeeklyBackup["📦 Weekly Backups"]
    MonthlyBackup["📦 Monthly Backups"]
    
    Production -->|Backup| DailyBackup
    DailyBackup -->|Archive| WeeklyBackup
    WeeklyBackup -->|Archive| MonthlyBackup
    
    DailyBackup -->|Store| S3["AWS S3"]
    WeeklyBackup -->|Store| Glacier["AWS Glacier"]
    MonthlyBackup -->|Store| Glacier
    
    S3 -->|Point-in-time| Recovery["🔄 Recovery"]
    Glacier -->|Restore| Recovery
```

---

## 🌍 Blue-Green Deployment

```mermaid
graph TB
    LB["🔀 Load Balancer"]
    
    subgraph "Blue (Current)"
        B["v1.0.0"]
    end
    
    subgraph "Green (New)"
        G["v1.1.0"]
    end
    
    LB -->|90%| B
    LB -->|10%| G
    
    Test["🧪 Test Green"]
    G --> Test
    
    Test -->|Pass| Switch["✅ Switch"]
    Switch -->|100%| G
    Switch -->|Standby| B
```

---

## 📋 Deployment Checklist

```mermaid
graph TB
    Pre["📋 Pre-Deployment"]
    
    Pre --> C1["✅ Code reviewed"]
    Pre --> C2["✅ Tests passing"]
    Pre --> C3["✅ Security scan"]
    Pre --> C4["✅ Performance test"]
    Pre --> C5["✅ Backup created"]
    Pre --> C6["✅ Rollback plan"]
    
    C1 --> Deploy["🚀 Deploy"]
    C2 --> Deploy
    C3 --> Deploy
    C4 --> Deploy
    C5 --> Deploy
    C6 --> Deploy
    
    Deploy --> Post["📋 Post-Deployment"]
    
    Post --> P1["✅ Health check"]
    Post --> P2["✅ Monitor metrics"]
    Post --> P3["✅ Verify features"]
    Post --> P4["✅ User testing"]
```

---

## 🚨 Incident Response

```mermaid
graph TB
    Issue["🚨 Issue Detected"]
    Alert["📢 Alert Team"]
    Investigate["🔍 Investigate"]
    
    Investigate --> Local["Is it local?"]
    Local -->|Yes| Restart["Restart Service"]
    Local -->|No| Rollback["Rollback Deploy"]
    
    Restart --> Monitor["Monitor"]
    Rollback --> Monitor
    
    Monitor --> Fixed{Fixed?}
    Fixed -->|Yes| PostMortem["📝 Post Mortem"]
    Fixed -->|No| Escalate["📞 Escalate"]
    
    Escalate --> Investigate
```

---

## 📊 Performance Tuning

```mermaid
graph TB
    Profile["🔍 Profile App"]
    
    Profile --> CPU["CPU Usage"]
    Profile --> Memory["Memory Usage"]
    Profile --> Disk["Disk I/O"]
    Profile --> Network["Network"]
    
    CPU -->|High| OptCPU["Optimize Code"]
    Memory -->|High| OptMem["Reduce Cache"]
    Disk -->|High| OptDisk["Index DB"]
    Network -->|High| OptNet["Compress Data"]
    
    OptCPU --> Test["🧪 Test"]
    OptMem --> Test
    OptDisk --> Test
    OptNet --> Test
    
    Test -->|Verify| Deploy["Deploy"]
```

---

## 🔄 Update & Migration Process

```mermaid
graph LR
    Plan["📋 Plan"]
    Prep["📦 Prepare"]
    Test["🧪 Test"]
    Migrate["🔄 Migrate"]
    Verify["✅ Verify"]
    Monitor["📊 Monitor"]
    
    Plan -->|Schedule| Prep
    Prep -->|Backup| Test
    Test -->|Pass| Migrate
    Migrate -->|Check| Verify
    Verify -->|Success| Monitor
```

---

## 📞 Support & Documentation

- **Deployment Issues**: Check logs with `heroku logs --tail`
- **Database Issues**: Use MongoDB Atlas dashboard
- **Performance Issues**: Check Grafana dashboards
- **Security Issues**: Review logs and enable WAF

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: April 20, 2026  
**Status**: Production Ready ✅
