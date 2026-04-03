import mongoose from 'mongoose';

const negotiationChatSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdvancedListing', required: true },
  participants: [String], // [sellerId, buyerId]
  messages: [{
    senderId: String,
    text: String,
    offerAmount: Number, // Optional offer
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('NegotiationChat', negotiationChatSchema);
