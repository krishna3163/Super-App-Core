import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
  gigRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'GigRequest' },
  providerId: { type: String, required: true },
  providerName: { type: String },
  clientId: { type: String, required: true },
  coverLetter: { type: String, required: true },
  proposedPrice: { type: Number, required: true },
  deliveryDays: { type: Number, required: true },
  attachments: [String],
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'withdrawn'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Proposal', proposalSchema);
