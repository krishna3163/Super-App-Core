import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ROOT_DIR = process.cwd();
const USER_COUNT = 500;
const DEFAULT_MONGO_URI = 'mongodb+srv://kk3163019_db_user:FaubOuNVj0HX7Hxb@cluster0.zzn5jwt.mongodb.net/superapp_auth?retryWrites=true&w=majority';

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Sai', 'Krishna', 'Kabir', 'Dhruv',
  'Ananya', 'Diya', 'Ira', 'Meera', 'Saanvi', 'Myra', 'Aadhya', 'Kiara', 'Navya', 'Riya'
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Gupta', 'Singh', 'Mehta', 'Iyer', 'Reddy', 'Nair', 'Kapoor',
  'Khan', 'Joshi', 'Jain', 'Das', 'Malhotra', 'Bose', 'Yadav', 'Pandey', 'Chaudhary', 'Kulkarni'
];

const roleCycle = [
  'user', 'moderator', 'admin', 'seller', 'driver', 'restaurant_owner',
  'hotel_owner', 'service_provider', 'creator', 'buyer', 'rider', 'provider', 'customer'
];

const authRoles = ['user', 'moderator', 'admin'];
const economyRoles = ['buyer', 'seller', 'rider', 'driver', 'customer', 'provider'];
const businessTypes = ['seller', 'restaurant', 'driver', 'hotel', 'service_provider', 'creator'];

function getServiceEnvFiles(baseDir) {
  const envFiles = [];
  const servicesDir = path.join(baseDir, 'services');

  if (!fs.existsSync(servicesDir)) {
    return envFiles;
  }

  for (const entry of fs.readdirSync(servicesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const envPath = path.join(servicesDir, entry.name, '.env');
    if (fs.existsSync(envPath)) {
      envFiles.push(envPath);
    }
  }

  return envFiles;
}

function getMongoUriFromEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^\s*MONGO_URI\s*=\s*(.+)\s*$/m);
  return match ? match[1].trim() : null;
}

function makeBaseUsers(count) {
  const users = [];

  for (let i = 1; i <= count; i += 1) {
    const idx = i - 1;
    const first = firstNames[idx % firstNames.length];
    const last = lastNames[Math.floor(idx / firstNames.length) % lastNames.length];
    const name = `${first} ${last}`;
    const userId = `user-${String(i).padStart(4, '0')}`;
    const username = `${first.toLowerCase()}_${last.toLowerCase()}_${String(i).padStart(4, '0')}`;
    const role = roleCycle[idx % roleCycle.length];

    users.push({
      userId,
      name,
      username,
      email: `${username}@example.com`,
      role,
      authRole: authRoles[idx % authRoles.length],
      age: 18 + (idx % 35),
      avatar: `https://i.pravatar.cc/150?u=${userId}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  return users;
}

function upsertManyByField(collection, docs, keyField) {
  if (!docs.length) {
    return Promise.resolve();
  }

  return collection.bulkWrite(
    docs.map((doc) => ({
      updateOne: {
        filter: { [keyField]: doc[keyField] },
        update: { $set: doc },
        upsert: true
      }
    })),
    { ordered: false }
  );
}

function getServiceName(envPath) {
  const parent = path.basename(path.dirname(envPath));
  return parent.endsWith('-service') ? parent.slice(0, -8) : parent;
}

function mapBusinessRole(role) {
  switch (role) {
    case 'seller':
      return 'seller';
    case 'restaurant_owner':
      return 'restaurant_owner';
    case 'driver':
      return 'driver';
    case 'hotel_owner':
      return 'hotel_owner';
    case 'service_provider':
      return 'service_provider';
    case 'creator':
      return 'creator';
    default:
      return 'seller';
  }
}

async function seedServiceDatabase(serviceName, uri, users, hashedPassword) {
  const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 30000 }).asPromise();
  const db = conn.db;

  try {
    const seedUsers = users.map((u) => ({
      ...u,
      service: serviceName,
      status: 'active'
    }));
    await upsertManyByField(db.collection('seed_users'), seedUsers, 'userId');

    if (serviceName === 'auth') {
      const authUsers = users.map((u) => ({
        email: u.email,
        password: hashedPassword,
        role: u.authRole,
        loginAttempts: 0,
        refreshTokens: [],
        twoFactorEnabled: false,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }));
      await upsertManyByField(db.collection('auth_users'), authUsers, 'email');
    }

    if (serviceName === 'user') {
      const userProfiles = users.map((u, i) => ({
        userId: u.userId,
        name: u.name,
        username: u.username,
        bio: `Hello, I am ${u.name}.`,
        avatar: u.avatar,
        coverPhoto: '',
        phone: `900000${String(i).padStart(4, '0')}`,
        isVerified: i % 9 === 0,
        kycStatus: i % 9 === 0 ? 'verified' : 'unverified',
        profileCompleteness: 70 + (i % 30),
        followers: [],
        following: [],
        blocked: [],
        createdAt: u.createdAt
      }));
      await upsertManyByField(db.collection('users'), userProfiles, 'userId');
    }

    if (serviceName === 'settings') {
      const settings = users.map((u) => ({
        userId: u.userId,
        profile: {
          username: u.username,
          bio: `Profile settings for ${u.name}`,
          avatar: u.avatar,
          theme: 'dark',
          language: 'en'
        },
        privacy: { profileVisibility: 'public', readReceipts: true },
        notifications: { pushEnabled: true, emailEnabled: true },
        marketplace: { currency: 'INR', sellerMode: ['seller', 'service_provider'].includes(u.role) },
        rideDelivery: {
          mode: ['driver', 'rider'].includes(u.role) ? 'both' : 'user',
          availabilityStatus: ['driver', 'rider'].includes(u.role) ? 'online' : 'offline'
        }
      }));
      await upsertManyByField(db.collection('settings'), settings, 'userId');
    }

    if (serviceName === 'professional') {
      const profiles = users.map((u, i) => ({
        userId: u.userId,
        headline: `${u.role.replace(/_/g, ' ')} professional`,
        summary: `${u.name} is active on Super App professional network.`,
        skills: ['Communication', 'Leadership', 'Operations', 'Sales'].slice(0, (i % 4) + 1),
        experience: [],
        education: []
      }));
      await upsertManyByField(db.collection('professionalprofiles'), profiles, 'userId');
    }

    if (serviceName === 'dating') {
      const profiles = users.map((u, i) => ({
        userId: u.userId,
        name: u.name,
        age: u.age,
        gender: i % 3 === 0 ? 'female' : i % 3 === 1 ? 'male' : 'other',
        interestedIn: 'everyone',
        bio: `Hi, I am ${u.name}. Looking for meaningful connections.`,
        interests: ['Travel', 'Music', 'Food', 'Movies'].slice(0, (i % 4) + 1),
        photos: [u.avatar],
        location: { type: 'Point', coordinates: [72.8777, 19.076] },
        preferences: { minAge: 18, maxAge: 45, maxDistance: 60 },
        isPremium: i % 20 === 0,
        superLikeCount: 5
      }));
      await upsertManyByField(db.collection('datingprofiles'), profiles, 'userId');
    }

    if (serviceName === 'social') {
      const posts = users.slice(0, 200).map((u, i) => ({
        userId: u.userId,
        userName: u.name,
        userAvatar: u.avatar,
        type: i % 5 === 0 ? 'notice' : i % 2 === 0 ? 'image' : 'text',
        title: i % 5 === 0 ? `Update from ${u.name}` : undefined,
        content: `Post ${i + 1} by ${u.name} in social service`,
        hashtags: ['SuperApp', 'SeedData', u.role],
        mentions: i > 0 ? [users[i - 1].username] : [],
        likes: [],
        shares: [],
        reposts: [],
        media: i % 2 === 0 ? [{ url: `https://picsum.photos/seed/${u.userId}/800/600`, mediaType: 'image' }] : [],
        reportCount: 0,
        isDeleted: false,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }));
      await upsertManyByField(db.collection('posts'), posts, 'content');
    }

    if (serviceName === 'chat') {
      const chats = users.slice(0, 120).map((u, i) => ({
        chatName: `seed-chat-${i + 1}`,
        isGroupChat: false,
        users: [
          { userId: u.userId, role: 'admin', joinedAt: new Date() },
          { userId: users[(i + 1) % users.length].userId, role: 'member', joinedAt: new Date() }
        ],
        description: 'Auto-generated seed chat',
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }));
      await upsertManyByField(db.collection('chats'), chats, 'chatName');
    }

    if (serviceName === 'business-dashboard') {
      const businessUsers = users.filter((u) => ['seller', 'driver', 'restaurant_owner', 'hotel_owner', 'service_provider', 'creator'].includes(u.role));
      const statsDocs = businessUsers.map((u, i) => ({
        userId: u.userId,
        businessMode: true,
        businessName: `${u.name} Enterprises`,
        businessType: businessTypes[i % businessTypes.length],
        roles: [mapBusinessRole(u.role)],
        revenue: {
          today: 500 + (i % 50) * 20,
          thisWeek: 5000 + (i % 100) * 40,
          thisMonth: 20000 + (i % 200) * 50,
          total: 50000 + i * 250
        },
        orders: {
          pending: i % 5,
          inProgress: i % 4,
          completed: 20 + (i % 25),
          cancelled: i % 3,
          total: 25 + (i % 30)
        },
        customers: { total: 100 + i, returning: 20 + (i % 15), newThisMonth: 10 + (i % 8) },
        rating: 3.8 + ((i % 12) / 10),
        reviewCount: 10 + (i % 200),
        dailyStats: [],
        topProducts: [],
        notifications: [],
        settings: { autoAcceptOrders: i % 2 === 0, notifyNewOrder: true, notifyLowStock: true }
      }));
      await upsertManyByField(db.collection('businessstats'), statsDocs, 'userId');
    }

    if (serviceName === 'economy') {
      const roleModes = users.map((u, i) => ({
        userId: u.userId,
        roles: [economyRoles[i % economyRoles.length]],
        activeRole: economyRoles[i % economyRoles.length]
      }));
      await upsertManyByField(db.collection('userrolemodes'), roleModes, 'userId');
    }

    return { serviceName, success: true };
  } finally {
    await conn.close();
  }
}

async function main() {
  const envFiles = getServiceEnvFiles(ROOT_DIR);

  if (!envFiles.length) {
    throw new Error('No service .env files found under services/.');
  }

  const users = makeBaseUsers(USER_COUNT);
  const hashedPassword = await bcrypt.hash('Test@12345', 12);

  const results = [];

  for (const envPath of envFiles) {
    const serviceName = getServiceName(envPath);
    const mongoUri = getMongoUriFromEnvFile(envPath) || DEFAULT_MONGO_URI;

    process.stdout.write(`Seeding ${serviceName}... `);
    try {
      const result = await seedServiceDatabase(serviceName, mongoUri, users, hashedPassword);
      results.push(result);
      console.log('ok');
    } catch (error) {
      results.push({ serviceName, success: false, error: error.message });
      console.log('failed');
      console.error(`  ${serviceName}: ${error.message}`);
    }
  }

  const okCount = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success);

  console.log(`\nCompleted. Services seeded: ${okCount}/${results.length}`);

  if (failed.length) {
    console.log('Failed services:');
    for (const item of failed) {
      console.log(`- ${item.serviceName}: ${item.error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Inserted/upserted ${USER_COUNT} users with mixed roles across all service databases.`);
}

main().catch((error) => {
  console.error('Seed run failed:', error);
  process.exit(1);
});
