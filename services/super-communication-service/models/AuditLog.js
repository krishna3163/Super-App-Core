import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  targetId: { type: String, required: true },
  actorId: { type: String, required: true }, // Who did it
  action: { type: String, required: true }, // 'ASSIGN_ROLE', 'DELETE_MESSAGE', 'KICK_USER', 'CHANGE_SETTING'
  details: { type: Object }, // Before/After state or impacted user ID
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);
