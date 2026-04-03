import { spawn } from 'child_process';
import path from 'path';

const services = [
  'api-gateway',
  'services/auth-service',
  'services/user-service',
  'services/chat-service',
  'services/social-service',
  'services/story-service',
  'services/snap-service',
  'services/ride-service',
  'services/food-service',
  'services/dating-service',
  'services/game-service',
  'services/hotel-service',
  'services/notification-service',
  'services/global-search-service',
  'services/business-dashboard-service',
  'services/super-communication-service',
  'services/marketplace-service',
  'services/advanced-marketplace-service',
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

services.forEach(service => {
  startService(service);
});

console.log('✅ All core services triggered. Check individual outputs.');
