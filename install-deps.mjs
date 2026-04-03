import { spawn } from 'child_process';
import path from 'path';

const services = [
  '.',
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

console.log('📦 Installing dependencies for all services...');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const installService = (servicePath) => {
  return new Promise((resolve) => {
    console.log(`Installing in ${servicePath}...`);
    const child = spawn(npmCmd, ['install'], {
      cwd: path.resolve(servicePath),
      shell: true,
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      resolve(code);
    });
  });
};

async function run() {
  for (const service of services) {
    await installService(service);
  }
  console.log('✅ All dependencies installed! You can now start the application.');
}

run();
