const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting E-Commerce Security Dashboard...\n');

// Start backend
const backend = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// Start frontend
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '..', 'frontend'),
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => {
  console.error('❌ Backend error:', err);
});

frontend.on('error', (err) => {
  console.error('❌ Frontend error:', err);
});

backend.on('exit', (code) => {
  console.log(`Backend exited with code ${code}`);
  process.exit(code);
});

frontend.on('exit', (code) => {
  console.log(`Frontend exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

console.log('✅ Both servers starting...');
console.log('📊 Frontend: http://localhost:3000');
console.log('🔧 Backend: http://localhost:5001');
console.log('\nPress Ctrl+C to stop\n');
