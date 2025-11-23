# 🛡️ E-Commerce Security & Compliance Dashboard

> A comprehensive security assessment and compliance monitoring platform for e-commerce businesses

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue.svg)](https://www.postgresql.org/)

---

## 📋 Overview

The E-Commerce Security Dashboard is a full-stack security assessment and compliance monitoring platform that helps organizations identify vulnerabilities, assess security posture, and maintain compliance with industry standards including ISO 27001, PCI-DSS, GDPR, and OWASP Top 10.

### Key Capabilities

- **Real-time vulnerability scanning** of live websites
- **Automated compliance scoring** across multiple frameworks
- **Professional security reports** for different stakeholders
- **Risk visualization** through interactive dashboards
- **Comprehensive security checks** including headers, SSL/TLS, injection vulnerabilities

---

## ✨ Features

### 🔍 Security Scanning Engine
- Real-time vulnerability detection on live e-commerce websites
- Security header analysis (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
- SSL/TLS configuration validation
- SQL injection vulnerability detection
- Cross-Site Scripting (XSS) detection
- CSRF protection validation
- Cookie security assessment (HttpOnly, Secure, SameSite)
- Payment security checks (PCI-DSS specific)
- E-commerce platform detection
- CVSS-based risk scoring

### 📊 Compliance Monitoring
Multi-framework compliance tracking:
- **ISO 27001** - Information Security Management
- **PCI-DSS** - Payment Card Industry Data Security Standard
- **GDPR** - General Data Protection Regulation
- **OWASP Top 10** - Web Application Security Risks

Features:
- Automated compliance scoring (0-100% per framework)
- Visual compliance status indicators
- Scan-to-framework traceability
- Gap analysis and remediation tracking

### 📄 Professional Reporting
Four types of downloadable reports:

1. **Executive Summary** - High-level overview for management
2. **Technical Report** - Detailed analysis for security teams
3. **Compliance Report** - Framework-specific assessments for auditors
4. **Vulnerability Report** - Complete findings with remediation guidance

### 📈 Analytics & Visualization
- Real-time security metrics dashboard
- Interactive vulnerability distribution charts
- Compliance framework score tracking
- Color-coded severity indicators
- Historical scan analysis

---

## 🏅 Compliance Frameworks

### ISO 27001 - Information Security Management
- Information security controls assessment
- Risk management requirements
- Security policy evaluation
- Incident response readiness

### PCI-DSS - Payment Card Industry
- Cardholder data protection
- Secure transmission requirements
- Access control measures
- Vulnerability management
- Security testing procedures

### GDPR - Data Protection
- Personal data security
- Privacy controls
- Data breach notification readiness
- Security by design validation

### OWASP Top 10
- Broken Access Control
- Cryptographic Failures
- Injection vulnerabilities
- Insecure Design
- Security Misconfiguration
- Vulnerable Components
- Authentication Failures
- Software and Data Integrity
- Security Logging Failures
- Server-Side Request Forgery

---

## 🔐 Security Capabilities

### Vulnerability Detection
- **Injection Attacks**: SQL injection point identification
- **XSS Protection**: Cross-site scripting vulnerability detection
- **CSRF Protection**: Token validation checks
- **Security Headers**: Missing header detection
- **Transport Security**: SSL/TLS configuration analysis
- **Cookie Security**: Attribute validation
- **Authentication**: Weak authentication detection

### Risk Assessment
- **CVSS Scoring**: Industry-standard vulnerability scoring
- **CWE Mapping**: Common Weakness Enumeration categorization
- **OWASP Classification**: Top 10 category mapping
- **Severity Levels**: Critical, High, Medium, Low prioritization
- **Business Impact**: Compliance and security score calculation

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS 3.4** - Utility-first styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Heroicons** - Icon library

### Backend
- **Node.js 18** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL 15** - Relational database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Security
- Native HTTP/HTTPS modules for real website scanning
- Security header analysis engine
- TLS/SSL verification
- CVSS 3.1 scoring implementation

---

## 📥 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Git

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/JahnaviSingh-37/ecommerce-security-dashboard.git
cd ecommerce-security-dashboard
```

2. **Database Setup**
```bash
# Start PostgreSQL
brew services start postgresql@15  # macOS
# or
sudo service postgresql start      # Linux

# Create database
createdb ecommerce_security

# Initialize schema
psql -d ecommerce_security -f simple-backend/init-db.sql
```

3. **Backend Setup**
```bash
cd simple-backend
npm install

# Start backend server
node server.js
# Backend will run on http://localhost:5001
```

4. **Frontend Setup**
```bash
cd frontend
npm install

# Start frontend server
npm run dev
# Frontend will run on http://localhost:3000
```

5. **Access Dashboard**
```
http://localhost:3000
```

### Quick Start (Unified)
```bash
cd simple-backend
node start-all.js
```

---

## 📖 Usage

### Running Security Scans

1. Navigate to the **Scans** page
2. Enter target URL (e.g., `https://www.example.com`)
3. Select scan type:
   - Full Security Scan (recommended)
   - SQL Injection
   - Cross-Site Scripting (XSS)
   - CSRF Protection
   - Authentication Weaknesses
4. Click "Start Scan"
5. View results in real-time

### Viewing Results

- **Dashboard**: Overview of vulnerabilities and compliance scores
- **Vulnerabilities**: Detailed findings with severity, CVSS, CWE, OWASP category
- **Compliance**: Framework-specific scores with status indicators
- **Reports**: Download professional reports for stakeholders

### Generating Reports

1. Go to **Reports** page
2. Select a completed scan
3. Choose report type:
   - Executive Summary
   - Technical Report
   - Compliance Report
   - Vulnerability Report
4. Download as text file

---

## 📁 Project Structure

```
ecommerce-security-dashboard/
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Dashboard pages
│   │   └── index.css       # Tailwind styles
│   └── package.json
├── simple-backend/         # Node.js backend
│   ├── server.js           # Express server
│   ├── init-db.sql         # Database schema
│   └── package.json
├── docs/                   # Documentation
├── README.md
└── LICENSE
```

---

## 🔒 Security Considerations

This tool is designed for authorized security assessments only. Users must:
- Have explicit permission to scan target websites
- Comply with applicable laws and regulations
- Use responsibly and ethically
- Not use for malicious purposes

---

## 🚀 Roadmap

- [ ] PDF report generation
- [ ] Email notifications for critical findings
- [ ] Scheduled recurring scans
- [ ] API integration with SIEM tools
- [ ] Multi-user support with RBAC
- [ ] Remediation ticket integration (Jira, ServiceNow)
- [ ] Custom compliance frameworks
- [ ] Historical trend analysis
- [ ] AI-powered risk prediction

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

**Jahnavi Singh**

- GitHub: [@JahnaviSingh-37](https://github.com/JahnaviSingh-37)
- Email: jahnavisingh37@example.com
- LinkedIn: [linkedin.com/in/jahnavi123604](https://www.linkedin.com/in/jahnavi123604/)

---

## 🙏 Acknowledgments

- OWASP - Security testing guidelines
- NIST - Cybersecurity framework reference
- ISO - Information security standards
- PCI Security Standards Council - PCI-DSS requirements
- CWE/MITRE - Vulnerability classification

---

<div align="center">
<sub>Built for security professionals | © 2025</sub>
</div>
