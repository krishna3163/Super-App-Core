import { MongoMemoryServer } from 'mongodb-memory-server';

const server = await MongoMemoryServer.create({
  instance: {
    port: 27017,
    ip: '127.0.0.1',
    dbName: 'superapp_auth'
  }
});

console.log('mongo-memory-uri=' + server.getUri());

process.on('SIGINT', async () => {
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.stop();
  process.exit(0);
});

setInterval(() => {}, 1 << 30);
