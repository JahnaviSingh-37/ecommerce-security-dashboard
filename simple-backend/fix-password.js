const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://jahnavisingh@localhost:5432/ecommerce_security'
});

async function fixPassword() {
  const password = 'Admin@123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('Hashed password:', hashedPassword);
  
  const result = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
    [hashedPassword, 'admin@ecommerce-security.com']
  );
  
  console.log('Updated user:', result.rows[0]);
  
  // Test the login
  const user = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    ['admin@ecommerce-security.com']
  );
  
  const isValid = await bcrypt.compare(password, user.rows[0].password_hash);
  console.log('Password validation test:', isValid ? '✅ SUCCESS' : '❌ FAILED');
  
  await pool.end();
  process.exit(0);
}

fixPassword().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
