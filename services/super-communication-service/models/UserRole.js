import mongoose from 'mongoose';

const userRoleSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  targetId: { type: String, required: true },
  targetType: { type: String, enum: ['group', 'channel', 'community'], required: true },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true }
}, { timestamps: true });

userRoleSchema.index({ userId: 1, targetId: 1 }, { unique: true });

export default mongoose.model('UserRole', userRoleSchema);
