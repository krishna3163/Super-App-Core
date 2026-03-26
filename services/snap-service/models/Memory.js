import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  encryptedBlob: { type: String, required: true }, // AES-encrypted base64/buffer
  iv: { type: String, required: true }, // Initialization vector for encryption
  tag: { type: String }, // Auth tag if using GCM
  title: { type: String },
  tags: [String],
  locationMeta: {
    latitude: Number,
    longitude: Number,
    placeName: String
  },
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Memory', memorySchema);
