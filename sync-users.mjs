import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'services/auth-service/.env') });
const AUTH_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/superapp_auth';

dotenv.config({ path: path.join(__dirname, 'services/user-service/.env') });
const USER_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/superapp_user';

async function sync() {
  console.log('Connecting to Auth DB...');
  const authConn = await mongoose.createConnection(AUTH_URI).asPromise();
  const authUserSchema = new mongoose.Schema({ email: String }, { strict: false });
  const AuthUser = authConn.model('User', authUserSchema);

  console.log('Connecting to User DB...');
  const userConn = await mongoose.createConnection(USER_URI).asPromise();
  const userProfileSchema = new mongoose.Schema({
    userId: { type: String, unique: true },
    name: String,
    username: { type: String, unique: true },
    avatar: String,
    bio: String
  }, { strict: false });
  const UserProfile = userConn.model('User', userProfileSchema);

  const authUsers = await AuthUser.find({});
  console.log(`Found ${authUsers.length} users in Auth DB.`);

  for (const u of authUsers) {
    const existing = await UserProfile.findOne({ userId: u._id.toString() });
    if (!existing) {
      const name = u.email.split('@')[0];
      await new UserProfile({
        userId: u._id.toString(),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        username: name.toLowerCase(),
        avatar: `https://i.pravatar.cc/150?u=${u._id}`,
        bio: 'Super App User 🚀'
      }).save();
      console.log(`Created profile for ${u.email}`);
    }
  }

  console.log('Sync complete!');
  process.exit(0);
}

sync().catch(err => {
  console.error(err);
  process.exit(1);
});
