import Expense from '../models/Expense.js';

export const createExpense = async (req, res) => {
  try {
    const { groupId, description, amount, currency, paidBy, splitMethod, splits } = req.body;
    
    // Validations (e.g. check if splits sum up to amount)
    let finalSplits = splits;
    if (splitMethod === 'equal' && finalSplits.length > 0) {
      const splitAmount = amount / finalSplits.length;
      finalSplits = finalSplits.map(s => ({ ...s, amountOwed: splitAmount }));
    }

    const expense = new Expense({
      groupId, description, amount, currency, paidBy, splitMethod, splits: finalSplits
    });

    await expense.save();
    
    res.status(201).json({ status: 'success', data: expense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const expenses = await Expense.find({ groupId }).sort({ createdAt: -1 });
    res.json({ status: 'success', data: expenses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getGroupBalances = async (req, res) => {
  try {
    const { groupId } = req.params;
    const expenses = await Expense.find({ groupId, status: { $ne: 'settled' } });
    
    // Calculate balances: positive means owed to them, negative means they owe
    const balances = {}; 
    
    expenses.forEach(exp => {
      // The person who paid getting money back (+)
      if (!balances[exp.paidBy]) balances[exp.paidBy] = 0;
      balances[exp.paidBy] += exp.amount;
      
      // The people who owe money (-)
      exp.splits.forEach(split => {
        if (!balances[split.userId]) balances[split.userId] = 0;
        balances[split.userId] -= split.amountOwed;
      });
    });

    // Strip out net 0 balances
    for (const user in balances) {
      if (Math.abs(balances[user]) < 0.01) delete balances[user];
    }

    res.json({ status: 'success', balances });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const settleExpense = async (req, res) => {
  try {
    const { expenseId, userId } = req.body;
    
    // Process wallet transaction via Wallet API (monetization-service) if fully integrated
    // For now, mark as settled
    const expense = await Expense.findOneAndUpdate(
      { _id: expenseId, 'splits.userId': userId },
      { $set: { 'splits.$.status': 'settled' } },
      { new: true }
    );
    
    // Check if fully settled
    const allSettled = expense.splits.every(s => s.status === 'settled');
    if (allSettled) expense.status = 'settled';
    else expense.status = 'partially_settled';
    
    await expense.save();

    res.json({ status: 'success', data: expense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
