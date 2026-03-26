import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
  name: { type: String, required: true },
  color: { type: String, default: '#99AAB5' },
  permissions: [String], // e.g., ['ADMINISTRATOR', 'MANAGE_CHANNELS', 'SEND_MESSAGES']
  position: { type: Number, default: 0 } // for hierarchy
}, { timestamps: true });

export default mongoose.model('Role', roleSchema);
