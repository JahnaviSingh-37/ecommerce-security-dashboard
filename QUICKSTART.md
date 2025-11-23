# Quick Start Guide
## Get Running in 5 Minutes!

### Prerequisites Check
```bash
node --version    # Should be 18+
psql --version    # Should be 14+
docker --version  # Optional
```

### 🚀 Option 1: Automated Setup (Recommended)

```bash
# Make sure you're in the project root
cd "/Users/jahnavisingh/ecommerce dashboard"

# Run the setup script
./setup.sh
```

The script will:
- ✅ Create PostgreSQL database
- ✅ Initialize database schema
- ✅ Install all dependencies
- ✅ Create environment files

Then start the servers:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 🐳 Option 2: Docker (Easiest)

```bash
# Start everything with one command
docker-compose up

# Or run in background
docker-compose up -d
```

### 📝 Option 3: Manual Setup

```bash
# 1. Database
createdb ecommerce_security
psql ecommerce_security < database/init.sql

# 2. Backend
cd backend
npm install
cp .env.example .env
npm run dev

# 3. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 🔑 Login Credentials

```
Email: admin@ecommerce-security.com
Password: Admin@123
```

### 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

### ⚡ Quick Test

1. Open http://localhost:3000
2. Login with credentials above
3. Navigate to "Security Scans"
4. Click "Start Scan"
5. View results in Dashboard

### 🔧 Troubleshooting

**Port conflicts:**
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:5000 | xargs kill -9  # Backend
```

**Database issues:**
```bash
# Reset database
dropdb ecommerce_security
createdb ecommerce_security
psql ecommerce_security < database/init.sql
```

**Dependencies:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### 📚 Next Steps

1. ✅ Explore the dashboard
2. ✅ Run different scan types
3. ✅ Check compliance scores
4. ✅ Review audit logs
5. ✅ Generate reports

### 🎯 For Resume/Portfolio

Take screenshots of:
- Dashboard with metrics
- Vulnerability scan results
- Compliance framework scores
- Security scan in progress
- Audit log table

### 📖 Documentation

- **Full Setup**: See `SETUP.md`
- **Features**: See `README.md`
- **Presentation**: See `PROJECT_PRESENTATION.md`

---

**Need Help?** Check the SETUP.md file for detailed instructions.
