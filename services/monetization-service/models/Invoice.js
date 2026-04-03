import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  businessId: { type: String, required: true },
  customerId: { type: String, required: true },
  transactionId: { type: String, required: true, unique: true }, // Ties back to wallet transaction
  invoiceNumber: { type: String, required: true, unique: true },
  
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 0.18 }, // E.g. GST/VAT at 18%
  taxAmount: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  
  status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], default: 'paid' },
  dueDate: { type: Date },
  pdfUrl: { type: String } // Cdn link to physical PDF file
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);
