import fs from 'fs';
import path from 'path';

const baseDir = process.cwd();
const servicesDir = path.join(baseDir, 'services');
const gatewayDir = path.join(baseDir, 'api-gateway');

const DEFAULT_JWT_SECRET = 'my_super_secret_key_123';
const DEFAULT_MONGO_URI = 'mongodb+srv://kk3163019_db_user:FaubOuNVj0HX7Hxb@cluster0.zzn5jwt.mongodb.net/';

const servicePorts = {
  'api-gateway': 5050,
  'auth-service': 5001,
  'user-service': 5002,
  'chat-service': 5003,
  'group-chat-service': 5037,
  'social-service': 5004,
  'story-service': 5005,
  'professional-service': 5006,
  'dating-service': 5007,
  'marketplace-service': 5008,
  'ride-service': 5009,
  'food-service': 5010,
  'productivity-service': 5011,
  'game-service': 5012,
  'notification-service': 5013,
  'dashboard-service': 5014,
  'economy-service': 5015,
  'mini-app-service': 5016,
  'hotel-service': 5021,
  'payment-service': 5032,
  'snap-service': 5031,
  'ai-service': 5033,
  'business-dashboard-service': 5034,
  'cart-service': 5035,
  'order-service': 5036,
  'global-search-service': 5025,
  'advanced-interactions-service': 5029
};

// Fix overlapping ports if needed based on gateway index.js
// Food is 5010
// Hotel - not in gateway? Let's check gateway again.
// Dating is 5007
// Ride is 5009
// Pro is 5006
// AI is 5033

const createEnv = (dir, port, extra = '') => {
  const envPath = path.join(dir, '.env');
  const parentDir = path.basename(dir);
  const serviceName = parentDir.endsWith('-service') ? parentDir.slice(0, -8) : parentDir;
  const dbName = `superapp_${serviceName.replace(/-/g, '_')}`;
  const mongoUri = `mongodb://127.0.0.1:27017/${dbName}`;
  
  const content = `PORT=${port}\nMONGO_URI=${mongoUri}\nJWT_SECRET=${DEFAULT_JWT_SECRET}\n${extra}`;
  fs.writeFileSync(envPath, content);
  console.log(`Created/Updated ${envPath} with database ${dbName}`);
};

// Gateway env needs service URLs
const gatewayExtra = Object.entries(servicePorts)
  .filter(([name]) => name !== 'api-gateway')
  .map(([name, port]) => `${name.toUpperCase().replace(/-/g, '_')}_URL=http://localhost:${port}`)
  .join('\n');

createEnv(gatewayDir, 5050, gatewayExtra);

// Services env
if (fs.existsSync(servicesDir)) {
  const services = fs.readdirSync(servicesDir);
  services.forEach(service => {
    const servicePath = path.join(servicesDir, service);
    if (fs.statSync(servicePath).isDirectory() && servicePorts[service]) {
      let extra = '';
      if (service === 'dating-service') {
        extra = `CHAT_SERVICE_URL=http://localhost:5003\nNOTIFICATION_SERVICE_URL=http://localhost:5013`;
      }
      if (service === 'business-dashboard-service') {
        extra = `MARKETPLACE_SERVICE_URL=http://localhost:5002\nRIDE_SERVICE_URL=http://localhost:5008\nFOOD_SERVICE_URL=http://localhost:5001\nHOTEL_SERVICE_URL=http://localhost:5010\nORDER_SERVICE_URL=http://localhost:5036`;
      }
      createEnv(servicePath, servicePorts[service], extra);
    }
  });
}
