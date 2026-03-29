import PaymentProfile from '../models/PaymentProfile.js';
import Transaction from '../models/Transaction.js';
import crypto from 'crypto';

export const createProfile = async (req, res) => {
  try {
    const { userId, upiId } = req.body;
    
    // Check if profile already exists
    let profile = await PaymentProfile.findOne({ userId });
    if (profile) return res.status(200).json(profile);

    const walletId = `wallet_${crypto.randomUUID().split('-')[0]}`;
    profile = new PaymentProfile({ 
      userId, 
      upiId: upiId || `${userId}@superapp`,
      walletId,
      balance: 1000 // Welcome bonus for new users
    });
    
    await profile.save();
    res.status(201).json({ status: 'success', data: profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.headers['x-user-id'];
    let profile = await PaymentProfile.findOne({ userId });
    
    if (!profile) {
      // Create profile on the fly if it doesn't exist
      const walletId = `wallet_${crypto.randomUUID().split('-')[0]}`;
      profile = await PaymentProfile.create({
        userId,
        upiId: `${userId}@superapp`,
        walletId,
        balance: 1000
      });
    }
    
    res.json({ status: 'success', data: profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const initiateTransfer = async (req, res) => {
  try {
    const { senderId, receiverId, amount, description } = req.body;
    
    if (amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const senderProfile = await PaymentProfile.findOne({ userId: senderId });
    if (!senderProfile || senderProfile.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const receiverProfile = await PaymentProfile.findOne({ userId: receiverId });
    if (!receiverProfile) return res.status(404).json({ error: 'Receiver not found' });

    // Atomic transaction (simulation)
    senderProfile.balance -= amount;
    receiverProfile.balance += amount;

    await senderProfile.save();
    await receiverProfile.save();

    const transaction = new Transaction({ 
      senderId, 
      receiverId, 
      amount, 
      description,
      type: 'transfer',
      status: 'success'
    });
    await transaction.save();

    res.status(201).json({ status: 'success', data: transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addMoney = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const profile = await PaymentProfile.findOne({ userId });
    
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    
    profile.balance += amount;
    await profile.save();

    const transaction = new Transaction({
      senderId: 'SYSTEM',
      receiverId: userId,
      amount,
      type: 'add_money',
      status: 'success',
      description: 'Wallet Top-up'
    });
    await transaction.save();

    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const userId = req.params.userId || req.headers['x-user-id'];
    const transactions = await Transaction.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    res.json({ status: 'success', data: transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
