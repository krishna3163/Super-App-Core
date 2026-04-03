import mongoose from 'mongoose';

const gigOrderSchema = new mongoose.Schema({
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  buyerId: { type: String, required: true, index: true },
  buyerName: { type: String },
  sellerId: { type: String, required: true, index: true },
  sellerName: { type: String },
  packageType: { type: String, enum: ['basic', 'standard', 'premium'], required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  totalAmount: { type: Number, required: true },
  serviceFee: { type: Number, default: 0 },
  requirements: [{ question: String, answer: String, files: [String] }],
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'delivered', 'revision_requested', 'completed', 'cancelled', 'disputed'],
    default: 'pending',
    index: true
  },
  deliveryDate: { type: Date },
  deliveredAt: { type: Date },
  completedAt: { type: Date },
  deliveries: [{
    message: String,
    files: [String],
    deliveredAt: { type: Date, default: Date.now }
  }],
  revisions: {
    allowed: { type: Number, default: 1 },
    used: { type: Number, default: 0 }
  },
  messages: [{
    senderId: String,
    senderName: String,
    message: String,
    files: [String],
    createdAt: { type: Date, default: Date.now }
  }],
  review: {
    rating: Number,
    comment: String,
    communication: Number,
    serviceAsDescribed: Number,
    wouldRecommend: Boolean,
    createdAt: Date
  },
  cancellationReason: { type: String },
  disputeReason: { type: String }
}, { timestamps: true });

gigOrderSchema.index({ buyerId: 1, status: 1 });
gigOrderSchema.index({ sellerId: 1, status: 1 });

export default mongoose.model('GigOrder', gigOrderSchema);
