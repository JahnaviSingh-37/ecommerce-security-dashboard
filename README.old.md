# E-Commerce Security Risk Assessment & Compliance Dashboard

## 🎯 Project Overview

A comprehensive cybersecurity platform that assesses security risks, ensures compliance, and provides actionable insights for e-commerce applications. This project demonstrates expertise in **Information Security, Governance, Risk Management, and Compliance (GRC)**.

## 🔐 Key Features

### 1. **Risk Assessment Module**
- Automated vulnerability scanning (SQL Injection, XSS, CSRF, weak authentication)
- OWASP Top 10 vulnerability detection
- Risk severity rating (Critical, High, Medium, Low)
- Real-time threat analysis

### 2. **Compliance & Governance**
- ISO 27001 compliance checks
- PCI-DSS payment security validation
- GDPR data privacy controls
- Comprehensive audit logging

### 3. **Interactive Dashboard**
- Real-time vulnerability metrics
- Compliance score visualization
- Risk trend analysis
- Remediation recommendations

### 4. **Automation & CI/CD**
- Automated security scans on deployment
- Email alerts for critical vulnerabilities
- Scheduled periodic assessments
- Integration with CI/CD pipelines

### 5. **Security Controls**
- Role-Based Access Control (RBAC)
- Data encryption (at rest & in transit)
- Secure authentication (JWT + bcrypt)
- Session management

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** for data persistence
- **JWT** for authentication
- **bcrypt** for password hashing

### Security Tools
- **Helmet.js** - HTTP security headers
- **express-rate-limit** - Rate limiting
- **OWASP ZAP** integration
- **SQL injection detection**
- **XSS protection**

### DevOps
- **Docker** & **Docker Compose**
- **GitHub Actions** for CI/CD
- **ESLint** & **Prettier**

## 📁 Project Structure

```
ecommerce-dashboard/
├── backend/
│   ├── src/
│   │   ├── controllers/      # API controllers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   │   ├── scanner/      # Vulnerability scanning
│   │   │   ├── compliance/   # Compliance checks
│   │   │   └── audit/        # Audit logging
│   │   ├── middleware/       # Auth, validation
│   │   ├── config/           # Configuration
│   │   └── utils/            # Utilities
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Utilities
│   │   └── types/            # TypeScript types
│   └── package.json
├── database/
│   └── init.sql              # Database schema
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Installation

1. **Clone the repository**
```bash
cd "/Users/jahnavisingh/ecommerce dashboard"
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Set up PostgreSQL Database**
```bash
# Create database
createdb ecommerce_security

# Run migrations
cd ../backend
npm run migrate
```

5. **Configure Environment Variables**

Create `.env` files in both frontend and backend directories (see `.env.example`)

6. **Run the Application**

Using Docker:
```bash
docker-compose up
```

Or manually:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

7. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## 🔍 Features in Detail

### Vulnerability Scanning
- **SQL Injection Detection**: Analyzes database queries for injection vulnerabilities
- **XSS Detection**: Identifies cross-site scripting risks
- **Authentication Weaknesses**: Checks password policies, session management
- **CSRF Protection**: Validates anti-CSRF token implementation
- **Dependency Scanning**: Checks for vulnerable npm packages

### Compliance Checks
- **ISO 27001**: Information security management controls
- **PCI-DSS**: Payment card industry data security standards
- **GDPR**: Data protection and privacy regulations
- **OWASP Top 10**: Industry-standard vulnerability assessment

### Audit Logging
- User authentication events
- Data access logs
- Configuration changes
- Security incidents
- Compliance violations

## 📊 Dashboard Features

1. **Security Overview**
   - Total vulnerabilities count
   - Risk distribution chart
   - Compliance score gauge
   - Recent security events

2. **Vulnerability Management**
   - Detailed vulnerability list
   - Severity-based filtering
   - Remediation steps
   - Historical trends

3. **Compliance Monitoring**
   - Framework-specific compliance scores
   - Gap analysis
   - Audit trail
   - Certification readiness

4. **Reports & Analytics**
   - Executive summary reports
   - Technical security reports
   - Compliance reports (PDF export)
   - Custom date range analysis

## 🎓 Resume-Friendly Highlights

> *"Developed a full-stack Cybersecurity Risk Assessment and Compliance Dashboard for e-commerce platforms, integrating automated vulnerability scanning (OWASP Top 10), compliance reporting (ISO 27001, PCI-DSS, GDPR), and role-based access controls. Implemented real-time threat detection, audit logging, and CI/CD security automation, resulting in a comprehensive GRC solution using React, Node.js, PostgreSQL, and Docker."*

## 🔒 Security Best Practices Implemented

- ✅ Input validation and sanitization
- ✅ Parameterized queries (SQL injection prevention)
- ✅ Content Security Policy (CSP)
- ✅ HTTPS enforcement
- ✅ Secure headers (Helmet.js)
- ✅ Rate limiting
- ✅ Password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ RBAC implementation
- ✅ Data encryption at rest and in transit
- ✅ Security logging and monitoring

## 📈 Future Enhancements

- [ ] Machine Learning for threat prediction
- [ ] Integration with SIEM tools
- [ ] Penetration testing automation
- [ ] Mobile application
- [ ] Multi-tenant support
- [ ] Real-time threat intelligence feeds
- [ ] Blockchain for audit trail immutability

## 📝 License

MIT License

## 👤 Author

**Jahnavi Singh**
- Specialization: Cybersecurity, GRC, Information Security
- Project Purpose: Portfolio demonstration for Infosec/GRC roles

---

*This project demonstrates practical application of cybersecurity principles, risk management, and compliance frameworks in a real-world e-commerce context.*
