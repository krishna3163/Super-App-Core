import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = 'mongodb+srv://kk3163019_db_user:FaubOuNVj0HX7Hxb@cluster0.zzn5jwt.mongodb.net/';

const indianNames = [
    'Aarav Sharma', 'Priyanka Chopra', 'Arjun Kapoor', 'Ishaan Malhotra', 'Diya Patel',
    'Rohan Gupta', 'Ananya Singh', 'Kabir Varma', 'Tara Iyer', 'Vihaan Reddy',
    'Sanya Bakshi', 'Advait Joshi', 'Shanaya Khan', 'Reyansh Deshmukh', 'Myra Rao',
    'Vivaan Chauhan', 'Aadi Sinha', 'Ira Nair', 'Kiaun Bhatt', 'Meher Grewal',
    'Armaan Aggarwal', 'Zoya Siddiqui', 'Aryan Saxena', 'Sia Thakur', 'Dev Shah',
    'Ishani Mehra', 'Ranveer Oberoi', 'Vanya Ghose', 'Kiaan Panda', 'Avni Jain',
    'Aditya Kulkarni', 'Neha Shrivastava', 'Varun Dubey', 'Alisha Merchant', 'Vikram Rathore',
    'Kriti Sanon', 'Ayushmann Khurrana', 'Kiara Advani', 'Hrithik Roshan', 'Deepika Padukone',
    'Ranbir Kapoor', 'Shraddha Kapoor', 'Kartik Aaryan', 'Janhvi Kapoor', 'Sara Ali Khan',
    'Vicky Kaushal', 'Alia Bhatt', 'Siddharth Malhotra', 'Anushcka Sharma', 'Virat Kohli',
    'Sakshi Tanwar', 'Nakuul Mehta', 'Surbhi Jyoti', 'Shaheer Sheikh', 'Erica Fernandes',
    'Zain Imam', 'Aditi Sharma', 'Shivin Narang', 'Jennifer Winget', 'Kushal Tandon',
    'Mouni Roy', 'Mohit Raina', 'Divyanka Tripathi', 'Vivek Dahiya', 'Drashti Dhami',
    'Sanjeeda Sheikh', 'Amir Khan', 'Salman Khan', 'Shah Rukh Khan', 'Preity Zinta',
    'Kajol Devgan', 'Rani Mukerji', 'Madhuri Dixit', 'Juhi Chawla', 'Sridevi Kapoor',
    'Rekha Ganesan', 'Hema Malini', 'Amitabh Bachchan', 'Dharmendra Deol', 'Rajesh Khanna',
    'Dev Anand', 'Dilip Kumar', 'Suniel Shetty', 'Akshay Kumar', 'Ajay Devgn',
    'Saif Ali Khan', 'Kareena Kapoor', 'Karisma Kapoor', 'Sanjay Dutt', 'Jackie Shroff',
    'Anil Kapoor', 'Govinda Ahuja', 'Nana Patekar', 'Paresh Rawal', 'Boman Irani',
    'Naseeruddin Shah', 'Om Puri', 'Irrfan Khan', 'Pankaj Tripathi', 'Manoj Bajpayee'
];

async function seed() {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    
    const db = mongoose.connection.db;
    
    // 0. Clean old data if desired
    console.log('🧹 Cleaning Database...');
    await db.dropDatabase();

    // 1. Seed Users
    console.log('👤 Seeding 100 Indian Users...');
    const hashedPassword = bcrypt.hashSync('password123', 12);
    
    const usersList = indianNames.map((name, i) => {
        const _id = new mongoose.Types.ObjectId();
        const userId = _id.toString();
        return {
            _id,
            userId,
            username: name.toLowerCase().replace(/ /g, '_') + `_${i}`,
            name,
            email: `${name.toLowerCase().replace(/ /g, '.')}@example.com`,
            password: hashedPassword,
            avatar: `https://i.pravatar.cc/150?u=${i}`,
            location: {
                address: 'Mumbai, India',
                coordinates: [72.8777, 19.0760]
            },
            role: 'user',
            age: 20 + (i % 30),
            createdAt: new Date(),
            updatedAt: new Date(),
            loginAttempts: 0,
            refreshTokens: [],
            twoFactorEnabled: false
        };
    });
    
    await db.collection('users').insertMany(usersList);
    const userIds = usersList.map(u => u.userId);

    // 2. Seed Posts (Social Service)
    console.log('📝 Seeding Feed Posts...');
    const posts = userIds.map((userId, i) => ({
        userId,
        type: i % 2 === 0 ? 'text' : 'notice',
        content: `Namaste from ${indianNames[i]}! Just joined the Super App. Excited to explore! #India #SuperApp`,
        media: [],
        likes: userIds.slice(0, 5),
        shares: userIds.slice(5, 7),
        hashtags: ['India', 'SuperApp'],
        isReel: false,
        createdAt: new Date(),
        updatedAt: new Date()
    }));
    await db.collection('posts').insertMany(posts);

    // 3. Seed Chats
    console.log('💬 Seeding Messages...');
    const chats = userIds.slice(0, 10).map((userId, i) => {
        const targetUserId = userIds[(i + 1) % 10];
        return {
            users: [
                { userId: userId, role: 'admin', joinedAt: new Date() },
                { userId: targetUserId, role: 'member', joinedAt: new Date() }
            ],
            isGroupChat: false,
            latestMessage: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    });
    await db.collection('chats').insertMany(chats);

    // 4. Seed Shopping (Marketplace)
    console.log('🛒 Seeding Marketplace...');
    const products = [
        { title: 'iPhone 15 Pro', price: 1200, category: 'Electronics', description: 'Brand new iPhone', images: ['https://images.unsplash.com/photo-1592890288564-76628a30a657?w=400&q=80'] },
        { title: 'Cricket Bat - English Willow', price: 250, category: 'Sports', description: 'Professional grade bat', images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&q=80'] },
        { title: 'Traditional Silk Saree', price: 80, category: 'Clothing', description: 'Pure silk Kanchipuram', images: ['https://images.unsplash.com/photo-1621183313651-7870a0d6ed1a?w=400&q=80'] }
    ].map((p, i) => ({ 
        ...p, 
        sellerId: userIds[i % 10], 
        status: 'available',
        location: { type: 'Point', coordinates: [72.8777, 19.0760], address: 'Mumbai' },
        createdAt: new Date(),
        updatedAt: new Date()
    }));
    await db.collection('products').insertMany(products);

    // 5. Seed Dating Profiles
    console.log('💖 Seeding Dating Profiles...');
    const dating = usersList.slice(0, 50).map((user, i) => ({
        userId: user.userId,
        name: user.name,
        age: user.age,
        gender: i % 2 === 0 ? 'female' : 'male',
        bio: `Software Engineer from Bangalore. Love traveling and music!`,
        interests: ['Tech', 'Hiking', 'Cooking'],
        photos: [`https://i.pravatar.cc/150?u=${user.userId}`],
        location: { type: 'Point', coordinates: [72.8777, 19.0760] },
        preferences: { gender: i % 2 === 0 ? 'male' : 'female', minAge: 21, maxAge: 35 },
        createdAt: new Date(),
        updatedAt: new Date()
    }));
    await db.collection('datingprofiles').insertMany(dating);

    console.log('🚀 SEEDING COMPLETE! 100 Indian Users added.');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ SEED ERROR:', err);
    process.exit(1);
});
