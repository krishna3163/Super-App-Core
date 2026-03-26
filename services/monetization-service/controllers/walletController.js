import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';

const getWallet = async (req, res) => {
  try {
    const { userId } = req.params;
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
      await wallet.save();
    }
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addFunds = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true, upsert: true }
    );

    const transaction = new Transaction({ userId, amount, type: 'deposit', status: 'completed' });
    await transaction.save();

    res.json({ wallet, transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const buyCoins = async (req, res) => {
  try {
    const { userId, currencyAmount } = req.body;
    const coinsToReceive = currencyAmount * 10; // 1 USD = 10 coins

    const wallet = await Wallet.findOne({ userId });
    if (wallet.balance < currencyAmount) return res.status(400).json({ error: 'Insufficient balance' });

    wallet.balance -= currencyAmount;
    wallet.coins += coinsToReceive;
    await wallet.save();

    const transaction = new Transaction({ 
      userId, 
      amount: currencyAmount, 
      type: 'purchase', 
      metadata: { reason: 'coin_purchase' } 
    });
    await transaction.save();

    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendTip = async (req, res) => {
  try {
    const { senderId, recipientId, amount, assetType } = req.body; // assetType: 'currency' | 'coins'
    
    const senderWallet = await Wallet.findOne({ userId: senderId });
    if (assetType === 'coins' && senderWallet.coins < amount) return res.status(400).json({ error: 'Insufficient coins' });
    if (assetType === 'currency' && senderWallet.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

    // Deduct from sender
    if (assetType === 'coins') senderWallet.coins -= amount;
    else senderWallet.balance -= amount;
    await senderWallet.save();

    // Add to recipient
    const recipientWallet = await Wallet.findOneAndUpdate(
      { userId: recipientId },
      { $inc: { [assetType === 'coins' ? 'coins' : 'balance']: amount } },
      { new: true, upsert: true }
    );

    const transaction = new Transaction({ 
      userId: senderId, 
      amount, 
      type: 'tip', 
      assetType, 
      metadata: { targetUserId: recipientId } 
    });
    await transaction.save();

    res.json({ success: true, transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getWallet, addFunds, buyCoins, sendTip };
