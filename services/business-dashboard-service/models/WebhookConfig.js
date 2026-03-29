import mongoose from 'mongoose';

const webhookConfigSchema = new mongoose.Schema({
  businessId: { type: String, required: true, unique: true },
  endpointUrl: { type: String, required: true }, // Customer's own API endpoint outside the Super App
  secretToken: { type: String, required: true }, // Used for HMAC signature verification
  activeEvents: [{
    type: String, 
    enum: ['order.created', 'payment.success', 'booking.cancelled', 'inventory.low']
  }],
  retryCount: { type: Number, default: 3 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('WebhookConfig', webhookConfigSchema);
