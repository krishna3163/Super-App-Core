import { spawn } from 'child_process';
import path from 'path';

const services = [
  'api-gateway',
  'services/auth-service',
  'services/user-service',
  'services/chat-service',
  'services/social-service',
  'services/snap-service',
  'services/payment-service',
  'services/settings-service',
  'services/notification-service',
  'services/dashboard-service',
  'services/ai-service',
  'frontend'
];

console.log('🚀 Starting Super App Core Ecosystem...');

const startService = (servicePath) => {
  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';
  
  console.log(`🔥 Starting ${servicePath}...`);
  
  const cmd = servicePath === 'frontend' ? ['run', 'dev'] : ['start'];
  const child = spawn(npmCmd, cmd, {
    cwd: path.resolve(servicePath),
    shell: true,
    stdio: 'inherit'
  });

  child.on('error', (err) => {
    console.error(`❌ Failed to start ${servicePath}:`, err);
  });
};

// Install dependencies first (optional, but good for first run)
// For speed, I'll assume they are installed or handled manually if this fails.
// But let's try to just start them.

services.forEach(service => {
  startService(service);
});

console.log('✅ All services triggered. Check individual outputs.');
