import fs from 'fs';
import path from 'path';

function getEnvFiles(dir, allFiles = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        getEnvFiles(name, allFiles);
      }
    } else if (file === '.env') {
      allFiles.push(name);
    }
  }
  return allFiles;
}

const rootDir = 'C:/Users/krish/Desktop/Super-App-Core';
const envFiles = getEnvFiles(rootDir);

for (const filePath of envFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('MONGO_URI=')) {
    const parentDir = path.basename(path.dirname(filePath));
    const serviceName = parentDir.endsWith('-service') ? parentDir.slice(0, -8) : parentDir;
    const newUri = `mongodb://127.0.0.1:27017/superapp?retryWrites=true&w=majority`;
    
    // Replace the line starting with MONGO_URI=
    const updatedContent = content.split('\n').map(line => {
      if (line.trim().startsWith('MONGO_URI=')) {
        return `MONGO_URI=${newUri}`;
      }
      return line;
    }).join('\n');
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`Updated ${filePath} with database super-app-${serviceName}`);
    } else {
      console.log(`No change for ${filePath}`);
    }
  } else {
    // console.log(`Skipping ${filePath} (no MONGO_URI)`);
  }
}
