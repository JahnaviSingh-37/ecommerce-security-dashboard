# E-Commerce Security Dashboard - Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))
- **Docker** (Optional, for containerized deployment)

## 🚀 Quick Start

### Option 1: Manual Setup

#### 1. Database Setup

```bash
# Create PostgreSQL database
createdb ecommerce_security

# Initialize database schema
psql ecommerce_security < database/init.sql
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configuration
# Make sure to update:
# - DATABASE_URL
# - JWT_SECRET
# - SMTP credentials (for email notifications)

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:5000`

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (open new terminal)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Option 2: Docker Setup

```bash
# From the project root directory
docker-compose up --build

# Access the application:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# PostgreSQL: localhost:5432
```

## 🔑 Default Credentials

After initializing the database, you can log in with:

- **Email:** admin@ecommerce-security.com
- **Password:** Admin@123

**⚠️ Important:** Change this password in production!

## 📁 Project Structure

```
ecommerce-dashboard/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   │   └── scanner/      # Vulnerability scanners
│   │   ├── middleware/       # Authentication, validation
│   │   └── utils/            # Helpers
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/                  # React TypeScript app
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   └── services/        # API services
│   ├── .env.example
│   └── package.json
├── database/
│   └── init.sql             # Database schema
├── docker-compose.yml
└── README.md
```

## 🔐 Key Features

### 1. Vulnerability Scanning
- **SQL Injection Detection**: Checks for unsafe database queries
- **XSS Detection**: Identifies cross-site scripting vulnerabilities
- **CSRF Protection**: Validates anti-CSRF token implementation
- **Authentication Weaknesses**: Analyzes password policies, session management

### 2. Compliance Monitoring
- **ISO 27001**: Information security management
- **PCI-DSS**: Payment card security
- **GDPR**: Data protection and privacy
- **OWASP Top 10**: Web application security risks

### 3. Risk Assessment
- Automated risk scoring
- Vulnerability prioritization
- Remediation recommendations
- CVSS scoring integration

### 4. Audit Logging
- Comprehensive activity tracking
- User authentication logs
- Security event monitoring
- Compliance audit trails

### 5. Reporting
- Executive summaries
- Technical security reports
- Compliance reports
- PDF export capabilities

## 🛠️ Development Workflow

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

### Linting and Formatting

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
```

## 🔧 Configuration

### Backend Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_security

# JWT
JWT_SECRET=your-super-secret-key-minimum-32-characters
JWT_EXPIRE=24h

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=E-Commerce Security Dashboard
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Security Scans
- `POST /api/scans/start` - Start new security scan
- `GET /api/scans/history` - Get scan history
- `GET /api/scans/:scanId` - Get scan details
- `POST /api/scans/:scanId/cancel` - Cancel running scan

### Vulnerabilities
- `GET /api/vulnerabilities` - List vulnerabilities
- `GET /api/vulnerabilities/:id` - Get vulnerability details

### Compliance
- `GET /api/compliance/frameworks` - List compliance frameworks
- `GET /api/compliance/checks` - Get compliance checks

### Audit Logs
- `GET /api/audit` - Get audit logs

## 🧪 Testing the Application

### 1. Run a Security Scan

1. Log in to the dashboard
2. Navigate to "Security Scans"
3. Select scan type (SQL Injection, XSS, Full Scan, etc.)
4. Click "Start Scan"
5. View results in the Dashboard

### 2. Check Compliance

1. Navigate to "Compliance"
2. View compliance scores for each framework
3. Check detailed control assessments

### 3. Review Vulnerabilities

1. Navigate to "Vulnerabilities"
2. Filter by severity
3. View remediation recommendations

## 🎯 Resume Highlights

Use this project description on your resume:

> "Developed a full-stack **Cybersecurity Risk Assessment and Compliance Dashboard** for e-commerce platforms, integrating automated vulnerability scanning (OWASP Top 10), compliance reporting (ISO 27001, PCI-DSS, GDPR), and role-based access controls. Implemented real-time threat detection, comprehensive audit logging, and CI/CD security automation using **React**, **Node.js**, **PostgreSQL**, and **Docker**. Features include SQL injection detection, XSS scanning, CSRF validation, and authentication weakness analysis with actionable remediation steps."

## 🔒 Security Best Practices Implemented

✅ Input validation and sanitization  
✅ Parameterized queries (SQL injection prevention)  
✅ Content Security Policy (CSP)  
✅ HTTPS enforcement  
✅ Secure headers (Helmet.js)  
✅ Rate limiting  
✅ Password hashing (bcrypt)  
✅ JWT token authentication  
✅ Role-Based Access Control (RBAC)  
✅ Data encryption at rest and in transit  
✅ Security logging and monitoring  

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Verify database exists
psql -l | grep ecommerce_security

# Reset database if needed
dropdb ecommerce_security
createdb ecommerce_security
psql ecommerce_security < database/init.sql
```

### Port Already in Use

```bash
# Find process using port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Find process using port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### TypeScript Compilation Errors

```bash
# Clean node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [ISO 27001](https://www.iso.org/isoiec-27001-information-security.html)
- [PCI-DSS](https://www.pcisecuritystandards.org/)
- [GDPR](https://gdpr.eu/)

## 👤 Author

**Jahnavi Singh**  
Specialization: Cybersecurity, GRC, Information Security  
Project Purpose: Portfolio demonstration for Infosec/GRC roles

## 📄 License

MIT License - see LICENSE file for details

---

**🎓 Perfect for showcasing in Infosec/GRC interviews!**

This project demonstrates practical application of:
- Security vulnerability assessment
- Risk management frameworks
- Compliance monitoring (ISO 27001, PCI-DSS, GDPR)
- Full-stack development skills
- DevOps and containerization
- Security automation
