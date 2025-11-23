const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://jahnavisingh@localhost:5432/ecommerce_security'
});

async function fixSchema() {
  console.log('🔧 Checking and fixing database schema...\n');
  
  try {
    // Check vulnerabilities table structure
    console.log('📋 Checking vulnerabilities table...');
    const tableInfo = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vulnerabilities'
      ORDER BY ordinal_position
    `);
    
    console.log('Current columns:');
    tableInfo.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Add missing columns to vulnerabilities table
    console.log('\n✨ Adding missing columns...');
    
    const columnsToAdd = [
      { name: 'type', type: 'VARCHAR(100)', default: "'UNKNOWN'" },
      { name: 'cwe_id', type: 'VARCHAR(50)' },
      { name: 'owasp_category', type: 'VARCHAR(200)' },
      { name: 'affected_url', type: 'TEXT' }
    ];
    
    for (const col of columnsToAdd) {
      try {
        const defaultClause = col.default ? `DEFAULT ${col.default}` : '';
        await pool.query(`
          ALTER TABLE vulnerabilities 
          ADD COLUMN IF NOT EXISTS ${col.name} ${col.type} ${defaultClause}
        `);
        console.log(`  ✅ Added column: ${col.name}`);
      } catch (err) {
        if (err.code === '42701') { // duplicate column
          console.log(`  ℹ️  Column already exists: ${col.name}`);
        } else {
          throw err;
        }
      }
    }
    
    // Add columns to vulnerability_scans table
    console.log('\n✨ Updating vulnerability_scans table...');
    
    const scanColumns = [
      { name: 'target_url', type: 'TEXT' },
      { name: 'completed_at', type: 'TIMESTAMP' },
      { name: 'findings_count', type: 'INTEGER', default: '0' }
    ];
    
    for (const col of scanColumns) {
      try {
        const defaultClause = col.default ? `DEFAULT ${col.default}` : '';
        await pool.query(`
          ALTER TABLE vulnerability_scans 
          ADD COLUMN IF NOT EXISTS ${col.name} ${col.type} ${defaultClause}
        `);
        console.log(`  ✅ Added column: ${col.name}`);
      } catch (err) {
        if (err.code === '42701') {
          console.log(`  ℹ️  Column already exists: ${col.name}`);
        } else {
          throw err;
        }
      }
    }
    
    // Verify final structure
    console.log('\n📋 Final vulnerabilities table structure:');
    const finalInfo = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vulnerabilities'
      ORDER BY ordinal_position
    `);
    
    finalInfo.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n✅ Schema updated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

fixSchema().catch(console.error);
