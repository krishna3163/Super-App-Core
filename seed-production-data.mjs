import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = 'mongodb+srv://kk3163019_db_user:FaubOuNVj0HX7Hxb@cluster0.zzn5jwt.mongodb.net/';

const indianNames = [
    'Aarav Sharma', 'Priyanka Chopra', 'Arjun Kapoor', 'Ishaan Malhotra', 'Diya Patel',
    'Rohan Gupta', 'Ananya Singh', 'Kabir Varma', 'Tara Iyer', 'Vihaan Reddy',
    'Sanya Bakshi', 'Advait Joshi', 'Shanaya Khan', 'Reyansh Deshmukh', 'Myra Rao',
    'Vivaan Chauhan', 'Aadi Sinha', 'Ira Nair', 'Kiaun Bhatt', 'Meher Grewal'
];

async function seed() {
    console.log('🔗 Connecting to persistent MongoDB (Prod)...');
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    
    console.log('🧹 Cleaning superapp_prod database...');
    await db.dropDatabase();

    const hashedPassword = bcrypt.hashSync('password123', 12);
    
    // 1. Users
    console.log('👤 Seeding Users...');
    const users = indianNames.map((name, i) => {
        const _id = new mongoose.Types.ObjectId();
        const userId = _id.toString();
        let role = 'user';
        if (i === 0) role = 'seller';
        if (i === 1) role = 'rider';
        if (i === 2) role = 'restaurant';
        if (i === 3) role = 'hotel';

        return {
            _id,
            userId,
            username: name.toLowerCase().replace(/ /g, '_'),
            name,
            email: `${name.toLowerCase().replace(/ /g, '.')}@example.com`,
            password: hashedPassword,
            avatar: `https://i.pravatar.cc/150?u=${userId}`,
            role,
            age: 22 + (i % 10),
            createdAt: new Date(),
            updatedAt: new Date()
        };
    });
    await db.collection('users').insertMany(users);
    const userIds = users.map(u => u.userId);

    // 2. Social Posts
    console.log('📝 Seeding Social Feed...');
    const posts = users.map((u, i) => ({
        userId: u.userId,
        userName: u.name,
        userAvatar: u.avatar,
        type: i % 3 === 0 ? 'image' : 'text',
        content: `Namaste! I am ${u.name}. Check out my new update on SuperApp!`,
        media: i % 3 === 0 ? [{ url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80', type: 'image' }] : [],
        likes: userIds.slice(0, 5),
        commentCount: i,
        createdAt: new Date(),
        updatedAt: new Date()
    }));
    await db.collection('posts').insertMany(posts);

    // 3. Dating Profiles
    console.log('💖 Seeding Dating Profiles...');
    const dating = users.map((u, i) => ({
        userId: u.userId,
        name: u.name,
        age: u.age,
        gender: i % 2 === 0 ? 'female' : 'male',
        bio: `Software professional. Love exploring new places.`,
        interests: ['Travel', 'Music', 'Tech'],
        photos: [u.avatar],
        location: { type: 'Point', coordinates: [72.8777, 19.0760] },
        preferences: { minAge: 18, maxAge: 40, maxDistance: 50 },
        createdAt: new Date(),
        updatedAt: new Date()
    }));
    await db.collection('datingprofiles').insertMany(dating);

    // 4. Marketplace Products
    console.log('🛒 Seeding Products...');
    const products = [
        { title: 'MacBook Pro M3', price: 150000, category: 'Electronics', description: 'Powerful laptop' },
        { title: 'Gaming Mouse', price: 2500, category: 'Accessories', description: 'RGB Mouse' },
        { title: 'Wireless Headset', price: 5000, category: 'Audio', description: 'Noise cancelling' }
    ].map((p, i) => ({
        ...p,
        sellerId: userIds[0], // The seller
        status: 'available',
        images: [`https://images.unsplash.com/photo-1517336712461-05173ef94ad5?w=400&q=80`],
        createdAt: new Date(),
        updatedAt: new Date()
    }));
    await db.collection('products').insertMany(products);

    // 5. Business Stats
    console.log('📊 Seeding Business Hub...');
    const businessStats = users.slice(0, 4).map(u => ({
        userId: u.userId,
        businessMode: true,
        businessName: `${u.name}'s Ventures`,
        roles: [u.role],
        revenue: { total: 50000, today: 500, thisWeek: 3500, thisMonth: 15000 },
        orders: { total: 120, completed: 110, pending: 5, cancelled: 5 },
        dailyStats: [{ date: new Date().toISOString().split('T')[0], revenue: 500, orders: 2 }],
        topProducts: [],
        notifications: [],
        createdAt: new Date(),
        updatedAt: new Date()
    }));
    await db.collection('businessstats').insertMany(businessStats);

    console.log('✅ SEEDING SUCCESSFUL! Persistent DB is ready.');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ SEED ERROR:', err);
    process.exit(1);
});
