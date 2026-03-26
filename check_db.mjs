import mongoose from 'mongoose';
async function check() {
    await mongoose.connect('mongodb://127.0.0.1:27017/superapp');
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).limit(1).toArray();
    console.log('USER:', JSON.stringify(users, null, 2));
    const posts = await db.collection('posts').find({}).limit(1).toArray();
    console.log('POST:', JSON.stringify(posts, null, 2));
    const chats = await db.collection('chats').find({}).limit(1).toArray();
    console.log('CHAT:', JSON.stringify(chats, null, 2));
    process.exit(0);
}
check();
