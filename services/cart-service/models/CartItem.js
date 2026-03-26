import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true }, // price at time of adding
}, { timestamps: true });

export default mongoose.model('CartItem', cartItemSchema);
