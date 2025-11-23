#!/bin/bash

# E-Commerce Security Dashboard - Quick Setup Script
# Author: Jahnavi Singh

set -e

echo "🔐 E-Commerce Security Dashboard - Quick Setup"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed. Please install it first.${NC}"
    echo "Visit: https://www.postgresql.org/download/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install it first.${NC}"
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Create PostgreSQL database
echo "📦 Setting up database..."
DB_NAME="ecommerce_security"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' already exists.${NC}"
    read -p "Do you want to drop and recreate it? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        dropdb $DB_NAME
        createdb $DB_NAME
        echo -e "${GREEN}✅ Database recreated${NC}"
    fi
else
    createdb $DB_NAME
    echo -e "${GREEN}✅ Database created${NC}"
fi

# Initialize database schema
echo "📋 Initializing database schema..."
psql $DB_NAME < database/init.sql
echo -e "${GREEN}✅ Database schema initialized${NC}"
echo ""

# Setup Backend
echo "🔧 Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Created .env file from .env.example${NC}"
    echo -e "${YELLOW}   Please update JWT_SECRET and SMTP credentials in backend/.env${NC}"
fi

echo "📦 Installing backend dependencies..."
npm install

echo -e "${GREEN}✅ Backend setup complete${NC}"
echo ""

# Setup Frontend
echo "🎨 Setting up frontend..."
cd ../frontend

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file from .env.example${NC}"
fi

echo "📦 Installing frontend dependencies..."
npm install

echo -e "${GREEN}✅ Frontend setup complete${NC}"
echo ""

cd ..

echo "================================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "Or use Docker:"
echo "   docker-compose up"
echo ""
echo "Access the application at: http://localhost:3000"
echo "Default credentials:"
echo "   Email: admin@ecommerce-security.com"
echo "   Password: Admin@123"
echo ""
echo "⚠️  Important: Update JWT_SECRET in backend/.env before production use!"
echo ""
