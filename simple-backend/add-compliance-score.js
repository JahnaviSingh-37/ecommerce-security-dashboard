const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://jahnavisingh@localhost:5432/ecommerce_security'
});

async function addComplianceScore() {
  console.log('🔧 Adding compliance_score column...\n');
  
  try {
    // Add compliance_score column to vulnerability_scans
    await pool.query(`
      ALTER TABLE vulnerability_scans 
      ADD COLUMN IF NOT EXISTS compliance_score INTEGER DEFAULT 100
    `);
    
    console.log('✅ Added compliance_score column to vulnerability_scans table');
    
    // Update existing scans with calculated compliance scores
    const scans = await pool.query('SELECT id, findings_count FROM vulnerability_scans');
    
    for (const scan of scans.rows) {
      const complianceScore = scan.findings_count 
        ? Math.max(50, 100 - (scan.findings_count * 5))
        : 100;
      
      await pool.query(
        'UPDATE vulnerability_scans SET compliance_score = $1 WHERE id = $2',
        [complianceScore, scan.id]
      );
    }
    
    console.log(`✅ Updated ${scans.rows.length} existing scans with compliance scores`);
    
    // Verify the update
    const result = await pool.query(`
      SELECT id, scan_type, findings_count, compliance_score 
      FROM vulnerability_scans 
      ORDER BY id DESC 
      LIMIT 5
    `);
    
    console.log('\n📊 Sample scan data:');
    result.rows.forEach(row => {
      console.log(`  Scan ${row.id}: ${row.findings_count} findings, ${row.compliance_score}% compliance`);
    });
    
    console.log('\n✅ Database updated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

addComplianceScore().catch(console.error);
