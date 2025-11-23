import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger';
import errorHandler from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import scanRoutes from './routes/scan.routes';
import complianceRoutes from './routes/compliance.routes';
import auditRoutes from './routes/audit.routes';
import vulnerabilityRoutes from './routes/vulnerability.routes';
import incidentRoutes from './routes/incident.routes';
import riskRoutes from './routes/risk.routes';
import userRoutes from './routes/user.routes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Database connection
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

// Test database connection
db.connect()
  .then(() => logger.info('✅ Database connected successfully'))
  .catch((err) => logger.error('❌ Database connection error:', err));

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/vulnerabilities', vulnerabilityRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    db.end(() => {
      logger.info('Database pool closed');
      process.exit(0);
    });
  });
});

export default app;
