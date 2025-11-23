import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  console.log('Initializing database...');

  // Create tables
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'security_analyst', 'auditor', 'user')) DEFAULT 'user',
      is_active INTEGER DEFAULT 1,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Vulnerability scans table
    CREATE TABLE IF NOT EXISTS vulnerability_scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_type TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')) DEFAULT 'pending',
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      duration_seconds INTEGER,
      scanned_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (scanned_by) REFERENCES users(id)
    );

    -- Vulnerabilities table
    CREATE TABLE IF NOT EXISTS vulnerabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_id INTEGER,
      type TEXT NOT NULL,
      severity TEXT CHECK(severity IN ('critical', 'high', 'medium', 'low', 'info')) NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      remediation TEXT,
      cwe_id TEXT,
      owasp_category TEXT,
      cvss_score REAL,
      is_resolved INTEGER DEFAULT 0,
      resolved_at DATETIME,
      resolved_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (scan_id) REFERENCES vulnerability_scans(id),
      FOREIGN KEY (resolved_by) REFERENCES users(id)
    );

    -- Compliance frameworks table
    CREATE TABLE IF NOT EXISTS compliance_frameworks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      version TEXT,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Compliance checks table
    CREATE TABLE IF NOT EXISTS compliance_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      framework_id INTEGER,
      control_id TEXT NOT NULL,
      control_name TEXT NOT NULL,
      status TEXT CHECK(status IN ('compliant', 'non_compliant', 'partial', 'not_applicable')) DEFAULT 'not_applicable',
      compliance_score INTEGER,
      evidence TEXT,
      last_checked DATETIME,
      checked_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id),
      FOREIGN KEY (checked_by) REFERENCES users(id)
    );

    -- Audit logs table
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id INTEGER,
      status TEXT,
      ip_address TEXT,
      user_agent TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Security incidents table
    CREATE TABLE IF NOT EXISTS security_incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      severity TEXT CHECK(severity IN ('critical', 'high', 'medium', 'low')) NOT NULL,
      status TEXT CHECK(status IN ('open', 'investigating', 'resolved', 'closed')) DEFAULT 'open',
      reported_by INTEGER,
      assigned_to INTEGER,
      resolved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reported_by) REFERENCES users(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    );

    -- Risk assessments table
    CREATE TABLE IF NOT EXISTS risk_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vulnerability_id INTEGER,
      likelihood TEXT CHECK(likelihood IN ('very_high', 'high', 'medium', 'low', 'very_low')) NOT NULL,
      impact TEXT CHECK(impact IN ('very_high', 'high', 'medium', 'low', 'very_low')) NOT NULL,
      risk_score INTEGER,
      mitigation_strategy TEXT,
      assessed_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities(id),
      FOREIGN KEY (assessed_by) REFERENCES users(id)
    );

    -- Notifications table
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);
    CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status ON vulnerabilities(is_resolved);
    CREATE INDEX IF NOT EXISTS idx_scans_status ON vulnerability_scans(status);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
  `);

  // Insert default admin user
  const hashedPassword = bcrypt.hashSync('Admin@123', 10);
  
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@ecommerce-security.com');
  
  if (!existingAdmin) {
    db.prepare(`
      INSERT INTO users (username, email, password, role, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin', 'admin@ecommerce-security.com', hashedPassword, 'admin', 1);
    console.log('✓ Default admin user created');
  }

  // Insert compliance frameworks
  const frameworks = [
    ['ISO 27001', '2022', 'International standard for information security management', 1],
    ['PCI-DSS', '4.0', 'Payment Card Industry Data Security Standard', 1],
    ['GDPR', '2018', 'General Data Protection Regulation', 1],
    ['OWASP Top 10', '2021', 'Top 10 Web Application Security Risks', 1],
    ['NIST CSF', '1.1', 'NIST Cybersecurity Framework', 1]
  ];

  frameworks.forEach(([name, version, description, is_active]) => {
    const existing = db.prepare('SELECT id FROM compliance_frameworks WHERE name = ?').get(name);
    if (!existing) {
      db.prepare(`
        INSERT INTO compliance_frameworks (name, version, description, is_active)
        VALUES (?, ?, ?, ?)
      `).run(name, version, description, is_active);
    }
  });

  console.log('✓ Database initialized successfully');
}

export default db;
