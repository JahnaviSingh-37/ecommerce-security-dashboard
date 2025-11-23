-- E-Commerce Security Database Schema

-- Users table with RBAC
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    CONSTRAINT check_role CHECK (role IN ('admin', 'security_analyst', 'auditor', 'user'))
);

-- Vulnerability scans
CREATE TABLE IF NOT EXISTS vulnerability_scans (
    id SERIAL PRIMARY KEY,
    scan_type VARCHAR(50) NOT NULL,
    target_url VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    initiated_by INTEGER REFERENCES users(id),
    scan_duration INTEGER,
    CONSTRAINT check_status CHECK (status IN ('pending', 'in_progress', 'completed', 'failed'))
);

-- Vulnerabilities discovered
CREATE TABLE IF NOT EXISTS vulnerabilities (
    id SERIAL PRIMARY KEY,
    scan_id INTEGER REFERENCES vulnerability_scans(id) ON DELETE CASCADE,
    vulnerability_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    affected_component VARCHAR(255),
    remediation TEXT,
    cwe_id VARCHAR(20),
    owasp_category VARCHAR(100),
    cvss_score DECIMAL(3,1),
    is_resolved BOOLEAN DEFAULT false,
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    CONSTRAINT check_severity CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info'))
);

-- Compliance frameworks
CREATE TABLE IF NOT EXISTS compliance_frameworks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    version VARCHAR(20),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance checks
CREATE TABLE IF NOT EXISTS compliance_checks (
    id SERIAL PRIMARY KEY,
    framework_id INTEGER REFERENCES compliance_frameworks(id),
    control_id VARCHAR(50) NOT NULL,
    control_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'not_checked',
    compliance_score INTEGER DEFAULT 0,
    last_checked TIMESTAMP,
    checked_by INTEGER REFERENCES users(id),
    evidence TEXT,
    notes TEXT,
    CONSTRAINT check_status CHECK (status IN ('compliant', 'non_compliant', 'partial', 'not_applicable', 'not_checked')),
    CONSTRAINT check_score CHECK (compliance_score >= 0 AND compliance_score <= 100)
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_status CHECK (status IN ('success', 'failure', 'warning'))
);

-- Security incidents
CREATE TABLE IF NOT EXISTS security_incidents (
    id SERIAL PRIMARY KEY,
    incident_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    affected_systems TEXT[],
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detected_by INTEGER REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    assigned_to INTEGER REFERENCES users(id),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    CONSTRAINT check_severity CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    CONSTRAINT check_status CHECK (status IN ('open', 'investigating', 'contained', 'resolved', 'closed'))
);

-- Risk assessments
CREATE TABLE IF NOT EXISTS risk_assessments (
    id SERIAL PRIMARY KEY,
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100),
    risk_category VARCHAR(100),
    likelihood VARCHAR(20),
    impact VARCHAR(20),
    risk_score INTEGER,
    risk_level VARCHAR(20),
    mitigation_strategy TEXT,
    owner INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'identified',
    assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    CONSTRAINT check_likelihood CHECK (likelihood IN ('very_low', 'low', 'medium', 'high', 'very_high')),
    CONSTRAINT check_impact CHECK (impact IN ('very_low', 'low', 'medium', 'high', 'very_high')),
    CONSTRAINT check_status CHECK (status IN ('identified', 'assessed', 'mitigated', 'accepted', 'transferred'))
);

-- Security configurations
CREATE TABLE IF NOT EXISTS security_configs (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    config_type VARCHAR(50),
    description TEXT,
    is_sensitive BOOLEAN DEFAULT false,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    severity VARCHAR(20),
    is_read BOOLEAN DEFAULT false,
    sent_via VARCHAR(20) DEFAULT 'in_app',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    CONSTRAINT check_sent_via CHECK (sent_via IN ('in_app', 'email', 'both'))
);

-- Insert default compliance frameworks
INSERT INTO compliance_frameworks (name, version, description, is_active) VALUES
('ISO 27001', '2022', 'International standard for information security management systems', true),
('PCI-DSS', '4.0', 'Payment Card Industry Data Security Standard', true),
('GDPR', '2016/679', 'General Data Protection Regulation', true),
('OWASP Top 10', '2021', 'Top 10 Web Application Security Risks', true),
('NIST CSF', '1.1', 'NIST Cybersecurity Framework', true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample ISO 27001 controls
INSERT INTO compliance_checks (framework_id, control_id, control_name, description, category) VALUES
((SELECT id FROM compliance_frameworks WHERE name = 'ISO 27001'), 'A.5.1', 'Information Security Policies', 'Policies for information security should be defined', 'Organizational Controls'),
((SELECT id FROM compliance_frameworks WHERE name = 'ISO 27001'), 'A.8.1', 'User Endpoint Devices', 'Information stored on user endpoint devices should be protected', 'Technical Controls'),
((SELECT id FROM compliance_frameworks WHERE name = 'ISO 27001'), 'A.8.2', 'Privileged Access Rights', 'Allocation and use of privileged access rights should be restricted', 'Technical Controls'),
((SELECT id FROM compliance_frameworks WHERE name = 'ISO 27001'), 'A.8.3', 'Information Access Restriction', 'Access to information should be restricted', 'Technical Controls')
ON CONFLICT DO NOTHING;

-- Insert sample PCI-DSS controls
INSERT INTO compliance_checks (framework_id, control_id, control_name, description, category) VALUES
((SELECT id FROM compliance_frameworks WHERE name = 'PCI-DSS'), '1.1', 'Firewall Configuration', 'Install and maintain network security controls', 'Network Security'),
((SELECT id FROM compliance_frameworks WHERE name = 'PCI-DSS'), '2.1', 'Strong Cryptography', 'Apply secure configurations to all system components', 'Secure Configuration'),
((SELECT id FROM compliance_frameworks WHERE name = 'PCI-DSS'), '3.1', 'Protect Account Data', 'Protect stored account data', 'Data Protection'),
((SELECT id FROM compliance_frameworks WHERE name = 'PCI-DSS'), '8.1', 'User Identification', 'Identify users and authenticate access', 'Access Control')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX idx_vulnerabilities_scan_id ON vulnerabilities(scan_id);
CREATE INDEX idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX idx_vulnerabilities_resolved ON vulnerabilities(is_resolved);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_compliance_checks_framework ON compliance_checks(framework_id);
CREATE INDEX idx_security_incidents_status ON security_incidents(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Create default admin user (password: Admin@123)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@ecommerce-security.com', '$2b$10$YKkGXqZ8Z1QKZ8Z1QKZ8ZeOxKqZ8Z1QKZ8Z1QKZ8Z1QKZ8Z1QKZ8Z', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
