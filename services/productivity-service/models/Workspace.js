import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: String, required: true },
  members: [{
    userId: String,
    role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' }
  }],
}, { timestamps: true });

export default mongoose.model('Workspace', workspaceSchema);
