# 🏗️ HydroGrid - Architecture & Design Documentation

---

## 1. System Architecture Overview

```mermaid
graph TB
    Client["🖥️ CLIENT LAYER"]
    API["🌐 API GATEWAY"]
    Server["⚙️ SERVER LAYER"]
    Auth["🔐 AUTH SERVICE"]
    Cache["⚡ CACHE LAYER"]
    DB["💾 DATA LAYER"]
    Queue["📦 QUEUE SERVICE"]
    
    Client -->|HTTP/REST| API
    API -->|Route| Server
    Server -->|Verify| Auth
    Server -->|Check| Cache
    Cache -->|Miss| DB
    Server -->|Async| Queue
    Queue -->|Process| DB
    
    style Client fill:#e1f5ff
    style API fill:#fff3e0
    style Server fill:#f3e5f5
    style Auth fill:#e8f5e9
    style Cache fill:#fce4ec
    style DB fill:#ede7f6
```

---

## 2. Frontend Architecture

```mermaid
graph LR
    subgraph "🖥️ React Application"
        Router["React Router"]
        Context["State Management"]
        API["API Client"]
        Components["Components"]
    end
    
    subgraph "📦 External Services"
        Backend["Express Backend"]
        Storage["LocalStorage"]
    end
    
    Router -->|Route| Components
    Context -->|State| Components
    Components -->|Call| API
    API -->|HTTP| Backend
    Components -->|Save| Storage
    Storage -->|Load| Context
```

---

## 3. Backend Architecture

```mermaid
graph TB
    subgraph "🔧 Request Pipeline"
        Request["📨 Request"]
        CORS["CORS Middleware"]
        Parser["Body Parser"]
        Auth["Auth Middleware"]
        Validate["Validation"]
        Controller["Controller"]
    end
    
    subgraph "🗄️ Data Layer"
        Models["Mongoose Models"]
        Queries["Query Builders"]
        Aggregation["Aggregation Pipeline"]
    end
    
    subgraph "💾 Database"
        MongoDB["MongoDB"]
    end
    
    Request -->|Check| CORS
    CORS -->|Parse| Parser
    Parser -->|Verify| Auth
    Auth -->|Sanitize| Validate
    Validate -->|Execute| Controller
    Controller -->|Create| Models
    Models -->|Build| Queries
    Queries -->|Aggregate| Aggregation
    Aggregation -->|Query| MongoDB
```

---

## 4. Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant DB as Database
    
    U->>C: 1️⃣ Login Form
    C->>S: 2️⃣ POST /auth/login
    S->>DB: 3️⃣ Find User
    
    alt User Found
        DB-->>S: 4️⃣ Return User
        S->>S: 5️⃣ Compare Password
        alt Password Match
            S->>S: 6️⃣ Generate JWT
            S-->>C: 7️⃣ Return Token
            C->>C: 8️⃣ Store Token
            C->>C: 9️⃣ Redirect Dashboard
            C-->>U: 🔟 Logged In ✅
        else Password Mismatch
            S-->>C: Invalid Credentials ❌
            C-->>U: Error Message
        end
    else User Not Found
        S-->>C: User Not Found ❌
        C-->>U: Error Message
    end
```

---

## 5. Admin Dashboard Data Flow

```mermaid
graph LR
    Admin["👑 Admin User"]
    AdminPage["Admin Page"]
    APIEndpoints["API Endpoints"]
    Aggregation["Aggregation Pipeline"]
    Stats["📊 Statistics"]
    Users["👥 Users List"]
    System["💻 System Info"]
    
    Admin -->|Visit| AdminPage
    AdminPage -->|Fetch Stats| APIEndpoints
    APIEndpoints -->|Query| Aggregation
    APIEndpoints -->|Query| Aggregation
    APIEndpoints -->|Query| Aggregation
    Aggregation -->|Calculate| Stats
    Aggregation -->|Retrieve| Users
    Aggregation -->|Check| System
    Stats -->|Display| AdminPage
    Users -->|Display| AdminPage
    System -->|Display| AdminPage
    AdminPage -->|Show| Admin
```

---

## 6. Database Schema Relationships

```mermaid
erDiagram
    USER ||--o{ USAGE : generates
    USER ||--o{ ALERT : receives
    USER ||--o{ REPORT : creates
    USAGE ||--o{ ALERT : triggers
    
    USER {
        string _id PK
        string email UK
        string password
        string name
        string role "admin|user"
        string region
        datetime createdAt
        datetime updatedAt
    }
    
    USAGE {
        string _id PK
        string userId FK
        number volume
        number cost
        number carbon
        datetime timestamp
        string source "meter|api|manual"
    }
    
    ALERT {
        string _id PK
        string userId FK
        string type "threshold|anomaly|maintenance"
        string title
        boolean read
        datetime createdAt
    }
    
    REPORT {
        string _id PK
        string userId FK
        string format "pdf|csv"
        datetime startDate
        datetime endDate
        datetime createdAt
    }
```

---

## 7. API Layer Architecture

```mermaid
graph TB
    subgraph "🔗 API Routes"
        Auth["Authentication"]
        Usage["Usage Data"]
        Alerts["Alerts"]
        Reports["Reports"]
        Admin["Admin"]
    end
    
    subgraph "🎯 Controllers"
        AC["AuthController"]
        UC["UsageController"]
        ALC["AlertController"]
        RC["ReportController"]
        ADMC["AdminController"]
    end
    
    subgraph "🏷️ Services"
        AS["AuthService"]
        US["UsageService"]
        ALS["AlertService"]
        RS["ReportService"]
        ADMS["AdminService"]
    end
    
    Auth --> AC
    Usage --> UC
    Alerts --> ALC
    Reports --> RC
    Admin --> ADMC
    
    AC --> AS
    UC --> US
    ALC --> ALS
    RC --> RS
    ADMC --> ADMS
```

---

## 8. Component Hierarchy

```mermaid
graph TB
    App["App.jsx"]
    
    App -->|Protected| Dashboard["Dashboard Layout"]
    App -->|Protected| Admin["AdminPage"]
    App -->|Protected| Pages["User Pages"]
    App -->|Public| Auth["Auth Pages"]
    
    Dashboard --> Navbar["Navbar"]
    Dashboard --> Sidebar["Sidebar"]
    Dashboard --> MainContent["Main Content"]
    
    Navbar --> UserMenu["User Menu"]
    Navbar --> ThemeToggle["Theme Toggle"]
    
    Sidebar --> NavItems["Nav Items"]
    Sidebar --> AdminSection["Admin Section"]
    
    MainContent --> Cards["StatCards"]
    MainContent --> Charts["Charts"]
    MainContent --> Tables["Tables"]
    
    Pages --> DashboardPage["Dashboard"]
    Pages --> InsightsPage["Insights"]
    Pages --> ReportsPage["Reports"]
    Pages --> AlertsPage["Alerts"]
    Pages --> LeaderboardPage["Leaderboard"]
    Pages --> ProfilePage["Profile"]
```

---

## 9. State Management Flow

```mermaid
graph LR
    User["👤 User Action"]
    Event["🎯 Event Triggered"]
    Reducer["📊 Reducer"]
    State["🔄 State Updated"]
    Render["🎨 Component Re-render"]
    UI["📱 UI Updated"]
    
    User -->|Click/Input| Event
    Event -->|Dispatch| Reducer
    Reducer -->|Calculate| State
    State -->|Subscribe| Render
    Render -->|Props| UI
    UI -->|Display| User
```

---

## 10. Error Handling Pipeline

```mermaid
graph TB
    Request["📨 Request"]
    Processing["⚙️ Processing"]
    Error["❌ Error Occurs"]
    Catch["🛡️ Catch"]
    Log["📝 Log Error"]
    Format["🎨 Format Response"]
    Response["📤 Response"]
    
    Request -->|Execute| Processing
    Processing -->|Exception| Error
    Error -->|Try-Catch| Catch
    Catch -->|Write| Log
    Catch -->|Prepare| Format
    Format -->|Status| Response
    Response -->|Send| Client["Client"]
    
    style Error fill:#ffcdd2
    style Catch fill:#c8e6c9
```

---

## 11. Real-Time Data Flow

```mermaid
graph LR
    Sensor["🌊 IoT Sensor"]
    API["📤 POST /api/usage"]
    Queue["📦 Message Queue"]
    Process["⚙️ Process"]
    Aggregate["📊 Aggregate"]
    Cache["⚡ Cache"]
    Dashboard["📈 Dashboard"]
    
    Sensor -->|Send Data| API
    API -->|Queue| Queue
    Queue -->|Consume| Process
    Process -->|Calculate| Aggregate
    Aggregate -->|Store| Cache
    Cache -->|WebSocket| Dashboard
    Dashboard -->|Realtime Update| Client["Client UI"]
```

---

## 12. Security Layers

```mermaid
graph TB
    Request["🌐 Incoming Request"]
    
    L1["Layer 1: CORS Check<br/>Only allowed origins"]
    L2["Layer 2: Rate Limiting<br/>Prevent DDoS"]
    L3["Layer 3: Input Validation<br/>Sanitize data"]
    L4["Layer 4: JWT Verification<br/>Valid token?"]
    L5["Layer 5: Role Check<br/>User/Admin?"]
    L6["Layer 6: Resource Check<br/>Own data?"]
    
    Request -->|Pass| L1
    L1 -->|Pass| L2
    L2 -->|Pass| L3
    L3 -->|Pass| L4
    L4 -->|Pass| L5
    L5 -->|Pass| L6
    L6 -->|Approved| Handler["✅ Handler"]
    
    L1 -->|Fail| Reject["❌ Reject"]
    L2 -->|Fail| Reject
    L3 -->|Fail| Reject
    L4 -->|Fail| Reject
    L5 -->|Fail| Reject
    L6 -->|Fail| Reject
    
    style Handler fill:#90EE90
    style Reject fill:#FFB6C6
```

---

## 13. Deployment Pipeline

```mermaid
graph LR
    Code["📝 Source Code<br/>GitHub"]
    Build["🔨 Build<br/>npm build"]
    Test["🧪 Tests<br/>npm test"]
    Docker["📦 Docker Image<br/>docker build"]
    Registry["🐳 Registry<br/>Docker Hub"]
    Deploy["🚀 Deploy<br/>Production"]
    Monitor["📊 Monitor<br/>Logs & Metrics"]
    
    Code -->|Commit| Build
    Build -->|Success| Test
    Test -->|Pass| Docker
    Docker -->|Push| Registry
    Registry -->|Pull| Deploy
    Deploy -->|Running| Monitor
    Monitor -->|Issue| Code
```

---

## 14. Performance Optimization Flow

```mermaid
graph TB
    User["👤 User Request"]
    
    Cache["⚡ Check Cache"]
    DB["💾 Query DB"]
    Aggregate["📊 Aggregate"]
    Transform["🔄 Transform"]
    Compress["📦 Compress"]
    Client["📱 Send Client"]
    
    User -->|Request| Cache
    Cache -->|Miss| DB
    Cache -->|Hit| Client
    DB -->|Data| Aggregate
    Aggregate -->|Result| Transform
    Transform -->|JSON| Compress
    Compress -->|gzip| Client
    Client -->|Render| Browser["🌐 Browser"]
```

---

## 15. Testing Strategy

```mermaid
graph TB
    Code["📝 Code"]
    
    Unit["🧪 Unit Tests<br/>Components, Functions"]
    Integration["🔗 Integration Tests<br/>API, Database"]
    E2E["🎯 E2E Tests<br/>User Workflows"]
    Performance["⚡ Performance Tests<br/>Load, Speed"]
    
    Code -->|Test| Unit
    Code -->|Test| Integration
    Code -->|Test| E2E
    Code -->|Test| Performance
    
    Unit -->|Pass| Quality["✅ Quality Gate"]
    Integration -->|Pass| Quality
    E2E -->|Pass| Quality
    Performance -->|Pass| Quality
    
    Quality -->|Success| Deploy["🚀 Deploy"]
    Quality -->|Failed| Code
```

---

## 16. User Journey Map

```mermaid
journey
    title User Journey in HydroGrid
    section Landing
      Discover HydroGrid: 5: User
      Read Features: 4: User
    section Authentication
      Click Sign Up: 4: User
      Fill Form: 3: User
      Verify Email: 4: User
    section Dashboard
      View Statistics: 5: User
      Check Usage Trends: 5: User
      See Alerts: 4: User
    section Actions
      Generate Report: 5: User
      Download PDF: 5: User
      Check Leaderboard: 4: User
    section Profile
      Update Settings: 3: User
      Change Theme: 4: User
      Logout: 5: User
```

---

## 17. Development Workflow

```mermaid
graph LR
    Branch["🌳 Create Branch"]
    Dev["💻 Development"]
    Test["🧪 Local Testing"]
    Commit["📝 Commit"]
    Push["⬆️ Push"]
    PR["📥 Pull Request"]
    Review["👀 Code Review"]
    Merge["✅ Merge"]
    Deploy["🚀 Deploy"]
    
    Branch -->|feature/xyz| Dev
    Dev -->|Complete| Test
    Test -->|Pass| Commit
    Commit -->|Message| Push
    Push -->|GitHub| PR
    PR -->|Create| Review
    Review -->|Approve| Merge
    Merge -->|main| Deploy
```

---

## 18. Monitoring & Logging

```mermaid
graph TB
    App["🔧 Application"]
    
    Logs["📝 Logs"]
    Metrics["📊 Metrics"]
    Errors["❌ Errors"]
    Performance["⚡ Performance"]
    
    App -->|Write| Logs
    App -->|Collect| Metrics
    App -->|Catch| Errors
    App -->|Track| Performance
    
    Logs -->|Aggregate| LogService["Log Service"]
    Metrics -->|Aggregate| Monitor["Monitoring"]
    Errors -->|Alert| Alert["Alert System"]
    Performance -->|Dashboard| Perf["Performance Dashboard"]
    
    LogService -->|Store| DB["Database"]
    Monitor -->|Visualize| Dashboard["📈 Dashboard"]
    Alert -->|Notify| Team["👥 Team"]
    Perf -->|Report| Analytics["📊 Analytics"]
```

---

## Key Design Principles

```mermaid
mindmap
  root((HydroGrid Design))
    Scalability
      Horizontal scaling
      Database optimization
      Caching strategy
    Security
      JWT authentication
      Role-based access
      Input validation
      Encryption
    Performance
      API optimization
      Frontend caching
      Database indexes
      CDN ready
    Maintainability
      Clean code
      Modular structure
      Documentation
      Testing
    User Experience
      Responsive design
      Intuitive UI
      Dark mode
      Fast loading
```

---

## Infrastructure Overview

```mermaid
graph TB
    subgraph Client["Client Tier"]
        React["React App"]
        Browser["Web Browser"]
    end
    
    subgraph Network["Network"]
        CDN["CDN<br/>Assets"]
        LB["Load Balancer<br/>Traffic"]
    end
    
    subgraph Server["Server Tier"]
        Node1["Node 1"]
        Node2["Node 2"]
        Node3["Node 3"]
    end
    
    subgraph Data["Data Tier"]
        Primary["MongoDB Primary"]
        Replica1["Replica 1"]
        Replica2["Replica 2"]
    end
    
    subgraph Support["Support Services"]
        Cache["Redis Cache"]
        Queue["Message Queue"]
        Mail["Email Service"]
    end
    
    Browser -->|Fetch| CDN
    Browser -->|API| LB
    LB -->|Route| Node1
    LB -->|Route| Node2
    LB -->|Route| Node3
    
    Node1 -->|Query| Primary
    Node2 -->|Query| Cache
    Node3 -->|Queue| Queue
    
    Primary -->|Replicate| Replica1
    Primary -->|Replicate| Replica2
```

---

**Architecture Version**: 1.0.0  
**Last Updated**: April 20, 2026  
**Status**: Production Ready ✅
