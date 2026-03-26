import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  targetId: { type: String, required: true }, // groupId, channelId, communityId
  targetType: { type: String, enum: ['group', 'channel', 'community'], required: true },
  name: { type: String, required: true },
  level: { type: Number, required: true }, // 0 = Owner, 1 = Admin, 2 = Manager, 3 = HR, 10 = Member, 99 = Restricted
  permissions: [{ type: String }], 
  color: { type: String, default: '#99AAB5' },
  isDefault: { type: Boolean, default: false } // System roles can't be deleted
}, { timestamps: true });

export default mongoose.model('Role', roleSchema);
