import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ Settings DB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Settings DB Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
