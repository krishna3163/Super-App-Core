import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = await MongoMemoryServer.create({
  instance: {
    port: 27017,
    dbName: 'superapp',
  }
});

const uri = mongod.getUri();
console.log(`🚀 MongoDB Memory Server running at: ${uri}`);

// Keep process alive
process.stdin.resume();
