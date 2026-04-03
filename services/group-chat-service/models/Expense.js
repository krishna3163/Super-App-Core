import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paidBy: { type: String, required: true }, // userId who paid
  splitMethod: { type: String, enum: ['equal', 'exact', 'percentages'], default: 'equal' },
  splits: [{
    userId: { type: String, required: true },
    amountOwed: { type: Number, required: true },
    status: { type: String, enum: ['unsettled', 'settled'], default: 'unsettled' }
  }],
  status: { type: String, enum: ['pending', 'partially_settled', 'settled'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
