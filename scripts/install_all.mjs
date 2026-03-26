import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const servicesDir = 'c:/Users/krish/Desktop/Super-App-Core/services';
const gatewayDir = 'c:/Users/krish/Desktop/Super-App-Core/api-gateway';
const frontendDir = 'c:/Users/krish/Desktop/Super-App-Core/frontend';

const install = (dir) => {
    console.log(`Installing in ${dir}...`);
    try {
        execSync('npm install', { cwd: dir, stdio: 'inherit' });
    } catch (e) {
        console.error(`Failed in ${dir}`);
    }
};

// Install in gateway and frontend
install(gatewayDir);
install(frontendDir);

// Install in each service
if (fs.existsSync(servicesDir)) {
    const services = fs.readdirSync(servicesDir);
    services.forEach(service => {
        const servicePath = path.join(servicesDir, service);
        if (fs.statSync(servicePath).isDirectory() && fs.existsSync(path.join(servicePath, 'package.json'))) {
            install(servicePath);
        }
    });
}
