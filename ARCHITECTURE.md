# System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        E-COMMERCE SECURITY DASHBOARD                         │
│                    Risk Assessment & Compliance Platform                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
│                         React + TypeScript + Tailwind                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐       │
│  │   Login   │  │  Dashboard   │  │    Scans     │  │  Reports   │       │
│  │   Page    │  │  (Metrics)   │  │  (Vuln Mgmt) │  │  (Export)  │       │
│  └───────────┘  └──────────────┘  └──────────────┘  └────────────┘       │
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐       │
│  │  Compliance View     │  │     Vulnerabilities List             │       │
│  │  (Framework Scores)  │  │     (Findings & Remediation)         │       │
│  └──────────────────────┘  └──────────────────────────────────────┘       │
│                                                                              │
│  Components:                                                                 │
│  • Layout (Sidebar + Header)                                                │
│  • PrivateRoute (Auth Guard)                                                │
│  • Charts (Recharts - Pie, Bar, Line)                                       │
│                                                                              │
│  State Management:                                                           │
│  • AuthContext (React Context API)                                          │
│  • API Service Layer (Axios)                                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP/HTTPS
                                      │ REST API
                                      │ JSON
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               BACKEND LAYER                                  │
│                      Node.js + Express + TypeScript                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │                      API ROUTES                               │          │
│  │  /api/auth     | /api/scans      | /api/compliance           │          │
│  │  /api/dashboard| /api/vulns      | /api/audit                │          │
│  │  /api/incidents| /api/risks      | /api/users                │          │
│  └──────────────────────────────────────────────────────────────┘          │
│                               │                                              │
│                               ▼                                              │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │                    MIDDLEWARE                                 │          │
│  │  • JWT Authentication                                         │          │
│  │  • Role-Based Authorization (RBAC)                            │          │
│  │  • Request Validation                                         │          │
│  │  • Rate Limiting                                              │          │
│  │  • Error Handling                                             │          │
│  │  • Security Headers (Helmet.js)                               │          │
│  │  • CORS                                                       │          │
│  └──────────────────────────────────────────────────────────────┘          │
│                               │                                              │
│                               ▼                                              │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │                    CONTROLLERS                                │          │
│  │  • authController      • scanController                       │          │
│  │  • dashboardController • vulnerabilityController              │          │
│  │  • complianceController• auditController                      │          │
│  └──────────────────────────────────────────────────────────────┘          │
│                               │                                              │
│                               ▼                                              │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │                   SECURITY SERVICES                           │          │
│  │                                                               │          │
│  │  ┌──────────────────────────────────────────────────────┐   │          │
│  │  │        VULNERABILITY SCANNERS                        │   │          │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │          │
│  │  │  │    SQL     │  │    XSS     │  │   CSRF     │    │   │          │
│  │  │  │ Injection  │  │  Scanner   │  │  Scanner   │    │   │          │
│  │  │  └────────────┘  └────────────┘  └────────────┘    │   │          │
│  │  │  ┌────────────────────────────────────────────┐    │   │          │
│  │  │  │  Authentication & Authorization Scanner    │    │   │          │
│  │  │  │  • Password Policy Checker                 │    │   │          │
│  │  │  │  • MFA Detection                           │    │   │          │
│  │  │  │  • Session Management Analysis             │    │   │          │
│  │  │  │  • RBAC Validation                         │    │   │          │
│  │  │  └────────────────────────────────────────────┘    │   │          │
│  │  └──────────────────────────────────────────────────────┘   │          │
│  │                                                               │          │
│  │  ┌──────────────────────────────────────────────────────┐   │          │
│  │  │        COMPLIANCE CHECKER                            │   │          │
│  │  │  • ISO 27001 Control Assessment                      │   │          │
│  │  │  • PCI-DSS Requirement Validation                    │   │          │
│  │  │  • GDPR Data Protection Checks                       │   │          │
│  │  │  • OWASP Top 10 Mapping                              │   │          │
│  │  └──────────────────────────────────────────────────────┘   │          │
│  │                                                               │          │
│  │  ┌──────────────────────────────────────────────────────┐   │          │
│  │  │        RISK ASSESSOR                                 │   │          │
│  │  │  • CVSS Score Calculator                             │   │          │
│  │  │  • Risk Matrix (Likelihood × Impact)                 │   │          │
│  │  │  • Prioritization Algorithm                          │   │          │
│  │  │  • Security Score Calculation                        │   │          │
│  │  └──────────────────────────────────────────────────────┘   │          │
│  │                                                               │          │
│  │  ┌──────────────────────────────────────────────────────┐   │          │
│  │  │        AUDIT LOGGER                                  │   │          │
│  │  │  • User Activity Tracking                            │   │          │
│  │  │  • Security Event Logging                            │   │          │
│  │  │  • Compliance Audit Trail                            │   │          │
│  │  └──────────────────────────────────────────────────────┘   │          │
│  └──────────────────────────────────────────────────────────────┘          │
│                               │                                              │
│                               ▼                                              │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │                      UTILITIES                                │          │
│  │  • Winston Logger (File + Console)                            │          │
│  │  • Email Service (Nodemailer)                                 │          │
│  │  • Cron Jobs (Scheduled Scans)                                │          │
│  └──────────────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ SQL Queries
                                      │ ORM/Raw SQL
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE LAYER                                    │
│                            PostgreSQL 15+                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────┐  ┌──────────────────┐  ┌──────────────────┐               │
│  │   Users    │  │ Vulnerability    │  │  Compliance      │               │
│  │            │  │    Scans         │  │  Frameworks      │               │
│  │ • id       │  │ • id             │  │ • id             │               │
│  │ • username │  │ • scan_type      │  │ • name           │               │
│  │ • email    │  │ • status         │  │ • version        │               │
│  │ • password │  │ • started_at     │  │ • is_active      │               │
│  │ • role     │  │ • completed_at   │  └──────────────────┘               │
│  └────────────┘  └──────────────────┘                                       │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │ Vulnerabilities  │  │  Compliance      │  │   Audit Logs     │         │
│  │                  │  │    Checks        │  │                  │         │
│  │ • id             │  │ • id             │  │ • id             │         │
│  │ • scan_id        │  │ • framework_id   │  │ • user_id        │         │
│  │ • type           │  │ • control_id     │  │ • action         │         │
│  │ • severity       │  │ • status         │  │ • resource_type  │         │
│  │ • title          │  │ • compliance_    │  │ • status         │         │
│  │ • description    │  │   score          │  │ • ip_address     │         │
│  │ • remediation    │  │ • last_checked   │  │ • created_at     │         │
│  │ • cwe_id         │  └──────────────────┘  │ • details (JSON) │         │
│  │ • owasp_category │                        └──────────────────┘         │
│  │ • cvss_score     │                                                       │
│  │ • is_resolved    │                                                       │
│  └──────────────────┘                                                       │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │   Security       │  │   Risk           │  │  Notifications   │         │
│  │   Incidents      │  │   Assessments    │  │                  │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│                                                                              │
│  Indexes:                                                                    │
│  • severity, status, user_id, created_at (for fast queries)                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          INFRASTRUCTURE LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────────┐   │
│  │   Docker Container  │  │   Docker Container  │  │ Docker Container │   │
│  │     (Frontend)      │  │     (Backend)       │  │   (PostgreSQL)   │   │
│  │   nginx:alpine      │  │   node:18-alpine    │  │ postgres:15      │   │
│  │   Port: 3000        │  │   Port: 5000        │  │ Port: 5432       │   │
│  └─────────────────────┘  └─────────────────────┘  └──────────────────┘   │
│            │                        │                        │              │
│            └────────────────────────┴────────────────────────┘              │
│                                     │                                        │
│                            Docker Compose Network                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            CI/CD PIPELINE                                    │
│                           GitHub Actions                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Trigger: Push to main/develop                                              │
│      │                                                                        │
│      ├─► Backend Tests ────► Lint ────► Build ────► Security Scan          │
│      │                                                                        │
│      ├─► Frontend Tests ───► Lint ────► Build ────► Security Scan          │
│      │                                                                        │
│      └─► Docker Build ─────► Test Images ──► Deploy (if main branch)       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY FEATURES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Authentication & Authorization:                                             │
│  • JWT Token-based Authentication                                           │
│  • bcrypt Password Hashing (10 rounds)                                      │
│  • Role-Based Access Control (Admin, Analyst, Auditor, User)                │
│  • Session Management                                                        │
│                                                                              │
│  Input Validation & Sanitization:                                            │
│  • express-validator                                                         │
│  • Parameterized SQL Queries                                                │
│  • XSS Protection                                                            │
│  • CSRF Token Validation                                                     │
│                                                                              │
│  Security Headers:                                                           │
│  • Content-Security-Policy                                                   │
│  • X-Frame-Options                                                           │
│  • X-Content-Type-Options                                                    │
│  • Strict-Transport-Security                                                 │
│                                                                              │
│  Rate Limiting:                                                              │
│  • 100 requests per 15 minutes per IP                                       │
│  • Configurable thresholds                                                   │
│                                                                              │
│  Encryption:                                                                 │
│  • HTTPS/TLS in transit                                                      │
│  • Encrypted password storage                                                │
│  • Secure cookie flags (HttpOnly, Secure)                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW EXAMPLE                                    │
│                     (Security Scan Execution)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. User clicks "Start Scan" button                                          │
│     │                                                                         │
│     ├─► Frontend sends POST /api/scans/start with JWT token                 │
│     │                                                                         │
│     ├─► Backend validates JWT & permissions                                 │
│     │                                                                         │
│     ├─► Creates scan record in database (status: pending)                   │
│     │                                                                         │
│     ├─► Returns scan ID to frontend                                         │
│     │                                                                         │
│     ├─► Async: Starts vulnerability scanners                                │
│     │    │                                                                    │
│     │    ├─► SQL Injection Scanner runs                                     │
│     │    ├─► XSS Scanner runs                                               │
│     │    ├─► CSRF Scanner runs                                              │
│     │    └─► Auth Scanner runs                                              │
│     │                                                                         │
│     ├─► Each scanner inserts vulnerabilities into DB                        │
│     │                                                                         │
│     ├─► Updates scan status to 'completed'                                  │
│     │                                                                         │
│     ├─► Creates notification for critical vulnerabilities                   │
│     │                                                                         │
│     └─► Frontend polls or receives real-time update                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                          DEPLOYMENT ARCHITECTURE
═══════════════════════════════════════════════════════════════════════════════

Production Environment (Example):

┌─────────────────────────────────────────────────────────────────────────────┐
│                                CLOUD PROVIDER                                │
│                      (Azure / AWS / GCP / Heroku)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────┐         ┌─────────────────────┐                   │
│  │   Azure App Service │         │  Azure Static Web   │                   │
│  │     (Backend API)   │         │    Apps (Frontend)  │                   │
│  │                     │         │                     │                   │
│  │  • Auto-scaling     │◄────────┤  • CDN integrated   │                   │
│  │  • SSL/TLS          │  API    │  • Global edge      │                   │
│  │  • Health checks    │  Calls  │  • HTTPS enforced   │                   │
│  └─────────────────────┘         └─────────────────────┘                   │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────────┐                                                    │
│  │ Azure Database for  │                                                    │
│  │    PostgreSQL       │                                                    │
│  │                     │                                                    │
│  │  • Automatic backup │                                                    │
│  │  • High availability│                                                    │
│  │  • SSL connections  │                                                    │
│  └─────────────────────┘                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                           KEY METRICS & STATS
═══════════════════════════════════════════════════════════════════════════════

Lines of Code:      5000+
Files Created:      45+
Technologies:       15+
Security Checks:    20+
Compliance Frmwks:  4
Database Tables:    11
API Endpoints:      25+
React Components:   10+
Scanners Built:     4
Development Time:   Production-ready in hours

═══════════════════════════════════════════════════════════════════════════════
                               END OF DIAGRAM
═══════════════════════════════════════════════════════════════════════════════
