import mongoose from 'mongoose';

const gigRequestSchema = new mongoose.Schema({
  clientId: { type: String, required: true, index: true },
  clientName: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  budget: { min: Number, max: Number },
  deadline: { type: Date },
  skills: [String],
  attachments: [String],
  proposalCount: { type: Number, default: 0 },
  status: { type: String, enum: ['open', 'in_progress', 'closed', 'cancelled'], default: 'open' },
  selectedProviderId: { type: String }
}, { timestamps: true });

export default mongoose.model('GigRequest', gigRequestSchema);
