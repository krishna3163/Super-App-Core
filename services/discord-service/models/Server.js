import mongoose from 'mongoose';

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: String, required: true },
  icon: { type: String },
  members: [{
    userId: { type: String, required: true },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }]
  }],
}, { timestamps: true });

export default mongoose.model('Server', serverSchema);
