# 🔌 HydroGrid - API Documentation

Complete REST API documentation with Mermaid diagrams for all endpoints.

---

## 📡 API Overview

```mermaid
graph TB
    API["🔌 HydroGrid REST API<br/>http://localhost:5001/api"]
    
    API --> Auth["🔐 Authentication<br/>/auth"]
    API --> Usage["📈 Usage Data<br/>/usage"]
    API --> Alerts["🔔 Alerts<br/>/alerts"]
    API --> Reports["📄 Reports<br/>/reports"]
    API --> Admin["👑 Admin<br/>/admin"]
    
    Auth --> A1["/register"]
    Auth --> A2["/login"]
    Auth --> A3["/profile"]
    Auth --> A4["/profile (PUT)"]
    
    Usage --> U1["/dashboard"]
    Usage --> U2["/ (GET all)"]
    Usage --> U3["/leaderboard"]
    Usage --> U4["/carbon"]
    Usage --> U5["/insights"]
    
    Alerts --> AL1["/ (GET)"]
    Alerts --> AL2["/:id/read"]
    Alerts --> AL3["/:id (DELETE)"]
    
    Reports --> R1["/ (GET)"]
    Reports --> R2["/export"]
    
    Admin --> AD1["/stats"]
    Admin --> AD2["/users"]
    Admin --> AD3["/overview"]
    Admin --> AD4["/dashboard"]
```

---

## 🔐 Authentication Endpoints

### 1. User Registration

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "region": "North"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "region": "North"
  }
}
```

---

### 2. User Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "region": "North"
  }
}
```

---

### 3. Get User Profile

```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "region": "North",
    "createdAt": "2024-01-15T10:30:00Z",
    "usageRecords": 1543,
    "totalCost": 2345.67
  }
}
```

---

### 4. Update User Profile

```http
PUT /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "name": "John Doe Updated",
  "region": "South"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe Updated",
    "email": "john@example.com",
    "role": "user",
    "region": "South"
  }
}
```

---

## 📈 Usage Data Endpoints

### 1. Get Dashboard Data

```http
GET /api/usage/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalUsage": 15432.5,
      "totalCost": 2345.67,
      "carbonFootprint": 123.45,
      "averageDaily": 512.5
    },
    "trend": [
      {
        "date": "2024-01-01",
        "volume": 450.2,
        "cost": 67.5,
        "carbon": 9.2
      }
    ],
    "topUsageHours": [
      { "hour": 18, "volume": 145.3 },
      { "hour": 19, "volume": 139.8 }
    ],
    "costBreakdown": {
      "residential": 1500,
      "commercial": 845.67
    }
  }
}
```

---

### 2. Get All Usage Records

```http
GET /api/usage?limit=10&skip=0&sort=-timestamp
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "volume": 25.5,
      "cost": 3.83,
      "carbon": 0.5,
      "timestamp": "2024-01-20T18:30:00Z",
      "source": "meter"
    }
  ],
  "pagination": {
    "total": 15432,
    "limit": 10,
    "skip": 0,
    "pages": 1544
  }
}
```

---

### 3. Get Leaderboard

```http
GET /api/usage/leaderboard?region=North&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "userId": "507f1f77bcf86cd799439012",
      "name": "Efficient User",
      "region": "North",
      "totalUsage": 5432.1,
      "avgDaily": 180.4,
      "score": 95
    }
  ]
}
```

---

### 4. Get Carbon Footprint

```http
GET /api/usage/carbon?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalCarbon": 123.45,
    "carbonPerDay": 4.12,
    "carbonPerUnit": 0.008,
    "trend": [
      { "date": "2024-01-01", "carbon": 3.5 }
    ],
    "comparison": {
      "yourUsage": 123.45,
      "cityAverage": 156.78,
      "percentageOfAverage": 78.7
    }
  }
}
```

---

### 5. Get AI Insights

```http
GET /api/usage/insights
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "predictions": {
      "nextMonthUsage": 1450.5,
      "trend": "decreasing",
      "confidence": 0.92
    },
    "anomalies": [
      {
        "date": "2024-01-15",
        "usage": 850.3,
        "expected": 450.2,
        "deviation": 89,
        "reason": "Possible leak detected"
      }
    ],
    "recommendations": [
      "Reduce peak hour usage by 15%",
      "Fix potential leak on Line 3"
    ]
  }
}
```

---

## 🔔 Alert Endpoints

### 1. Get All Alerts

```http
GET /api/alerts?read=false&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "type": "threshold",
      "title": "Usage exceeds threshold",
      "message": "Your usage today exceeded 500 units",
      "read": false,
      "priority": "high",
      "createdAt": "2024-01-20T18:30:00Z"
    }
  ]
}
```

---

### 2. Mark Alert as Read

```http
PUT /api/alerts/507f1f77bcf86cd799439011/read
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "read": true,
    "readAt": "2024-01-20T19:00:00Z"
  }
}
```

---

### 3. Delete Alert

```http
DELETE /api/alerts/507f1f77bcf86cd799439011
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alert deleted successfully"
}
```

---

## 📄 Report Endpoints

### 1. Get All Reports

```http
GET /api/reports?limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "title": "January Usage Report",
      "format": "pdf",
      "startDate": "2024-01-01",
      "endDate": "2024-01-31",
      "size": 245000,
      "createdAt": "2024-02-01T10:00:00Z",
      "url": "/reports/507f1f77bcf86cd799439011.pdf"
    }
  ]
}
```

---

### 2. Export Report

```http
POST /api/reports/export
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "format": "pdf",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "includeCharts": true,
  "includeAlerts": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reportId": "507f1f77bcf86cd799439011",
    "format": "pdf",
    "fileName": "Usage_Report_Jan2024.pdf",
    "size": 245000,
    "downloadUrl": "/download/reports/507f1f77bcf86cd799439011"
  }
}
```

---

## 👑 Admin Endpoints

### 1. Get System Statistics

```http
GET /api/admin/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Requires**: Admin Role

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1542,
    "activeToday": 423,
    "totalRecords": 2543891,
    "recordsThisWeek": 45321,
    "activeAlerts": 87,
    "avgUsagePerUser": 1648.5,
    "totalCostProcessed": 3845672.50
  }
}
```

---

### 2. Get All Users

```http
GET /api/admin/users?page=1&limit=50&role=user
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Requires**: Admin Role

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "region": "North",
      "totalRecords": 1543,
      "lastLogin": "2024-01-20T18:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z",
      "status": "active"
    }
  ],
  "pagination": {
    "total": 1542,
    "page": 1,
    "pages": 31
  }
}
```

---

### 3. Get Admin Overview

```http
GET /api/admin/overview
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Requires**: Admin Role

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "dailyStats": [
      {
        "date": "2024-01-20",
        "newUsers": 15,
        "newRecords": 45321,
        "totalCost": 345678.90
      }
    ],
    "topUsers": [
      {
        "name": "High Consumer",
        "usage": 8543.2,
        "records": 8500
      }
    ],
    "recentActivity": [
      {
        "user": "John Doe",
        "action": "Generated Report",
        "timestamp": "2024-01-20T18:30:00Z"
      }
    ]
  }
}
```

---

### 4. Get Admin Dashboard

```http
GET /api/admin/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Requires**: Admin Role

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalUsers": 1542,
      "activeToday": 423,
      "systemHealth": "excellent",
      "serverUptime": "99.98%"
    },
    "metrics": {
      "avgResponseTime": 145,
      "errorRate": 0.02,
      "requestsPerSecond": 342.5
    },
    "topRegions": [
      { "region": "North", "users": 345, "usage": 567890 }
    ]
  }
}
```

---

## 🔄 Request/Response Flow Diagram

```mermaid
sequenceDiagram
    participant Client as 🖥️ Client
    participant Server as ⚙️ Server
    participant Auth as 🔐 Auth
    participant DB as 💾 Database
    participant Cache as ⚡ Cache
    
    Client->>Server: 1. HTTP Request + Token
    Server->>Auth: 2. Verify Token
    Auth->>Auth: 3. Validate JWT
    Auth-->>Server: 4. User Info
    Server->>Cache: 5. Check Cache
    
    alt Cache Hit
        Cache-->>Server: 6a. Return Data
    else Cache Miss
        Server->>DB: 6b. Query Database
        DB-->>Server: 7. Return Data
        Server->>Cache: 8. Store in Cache
    end
    
    Server->>Server: 9. Format Response
    Server-->>Client: 10. JSON Response
```

---

## 📊 Error Response Format

```mermaid
graph TB
    Request["📨 Request"]
    Validate["✓ Validation"]
    Error{Error?}
    Success["✅ Success"]
    ErrorHandle["❌ Error Handler"]
    
    Request -->|Execute| Validate
    Validate -->|Check| Error
    Error -->|No| Success
    Error -->|Yes| ErrorHandle
    
    Success -->|200 OK| Response1["Success Response"]
    ErrorHandle -->|400-500| Response2["Error Response"]
    
    Response2 -->|Format| ErrorJSON["
    {
      success: false,
      error: {
        code: 'ERR_CODE',
        message: 'User friendly message',
        details: 'Technical details'
      }
    }"]
```

---

## 🔑 Authentication Header

All protected endpoints require:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Status Codes

```mermaid
graph TB
    Code["HTTP Status Codes"]
    
    Code --> S2["2xx Success"]
    Code --> S4["4xx Client Error"]
    Code --> S5["5xx Server Error"]
    
    S2 --> C200["200 OK - Request successful"]
    S2 --> C201["201 Created - Resource created"]
    S2 --> C204["204 No Content"]
    
    S4 --> C400["400 Bad Request"]
    S4 --> C401["401 Unauthorized"]
    S4 --> C403["403 Forbidden"]
    S4 --> C404["404 Not Found"]
    S4 --> C422["422 Validation Error"]
    
    S5 --> C500["500 Server Error"]
    S5 --> C503["503 Service Unavailable"]
```

---

## 🧪 Rate Limiting

```mermaid
graph LR
    Request["📨 Incoming Request"]
    Check["Check Rate Limit"]
    Count["Current: 45/100"]
    Allow{Within Limit?}
    Process["✅ Process"]
    Reject["❌ 429 Too Many Requests"]
    
    Request -->|Header: X-RateLimit-*| Check
    Check -->|Query| Count
    Count -->|Compare| Allow
    Allow -->|Yes| Process
    Allow -->|No| Reject
```

**Default Limits:**
- 100 requests per 15 minutes per IP
- Admin endpoints: 50 requests per 15 minutes

---

## 📚 API Base URL

**Development:**
```
http://localhost:5001/api
```

**Production:**
```
https://api.hydrogrid.com/api
```

---

## 🔗 Related Documentation

- [README with Diagrams](./README_WITH_DIAGRAMS.md)
- [System Architecture](./ARCHITECTURE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Security Guide](./SECURITY.md)

---

**API Version**: 1.0.0  
**Last Updated**: April 20, 2026  
**Status**: Production Ready ✅
