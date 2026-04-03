import mongoose from 'mongoose';

const aiBotContextSchema = new mongoose.Schema({
  businessId: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: false },
  knowledgeBase: { type: String, default: 'We are a local business offering various services. We are open from 9 AM to 5 PM.' },
  tone: { type: String, enum: ['professional', 'friendly', 'casual'], default: 'professional' },
  autoReplyEnabled: { type: Boolean, default: true },
  maxDailyReplies: { type: Number, default: 100 }
}, { timestamps: true });

export default mongoose.model('AiBotContext', aiBotContextSchema);
