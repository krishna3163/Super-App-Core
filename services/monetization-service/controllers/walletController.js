import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Subscription from '../models/Subscription.js';
import CreatorProfile from '../models/CreatorProfile.js';

// ========== WALLET ==========
const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.params.userId });
    if (!wallet) { wallet = new Wallet({ userId: req.params.userId }); await wallet.save(); }
    res.json({ status: 'success', data: wallet });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const addFunds = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const wallet = await Wallet.findOneAndUpdate({ userId }, { $inc: { balance: amount } }, { new: true, upsert: true });
    await new Transaction({ userId, amount, type: 'deposit', status: 'completed' }).save();
    res.json({ status: 'success', data: wallet });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const buyCoins = async (req, res) => {
  try {
    const { userId, currencyAmount } = req.body;
    const coinsToReceive = currencyAmount * 10;
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < currencyAmount) return res.status(400).json({ error: 'Insufficient balance' });
    wallet.balance -= currencyAmount;
    wallet.coins += coinsToReceive;
    await wallet.save();
    await new Transaction({ userId, amount: currencyAmount, type: 'purchase', metadata: { reason: 'coin_purchase', coins: coinsToReceive } }).save();
    res.json({ status: 'success', data: wallet });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const sendTip = async (req, res) => {
  try {
    const { senderId, recipientId, amount, assetType, message } = req.body;
    const senderWallet = await Wallet.findOne({ userId: senderId });
    const field = assetType === 'coins' ? 'coins' : 'balance';
    if (!senderWallet || senderWallet[field] < amount) return res.status(400).json({ error: `Insufficient ${assetType}` });

    senderWallet[field] -= amount;
    await senderWallet.save();
    await Wallet.findOneAndUpdate({ userId: recipientId }, { $inc: { [field]: amount, lifetimeEarnings: assetType === 'coins' ? 0 : amount } }, { upsert: true });
    await new Transaction({ userId: senderId, amount, type: 'tip', assetType, metadata: { targetUserId: recipientId, message } }).save();
    res.json({ status: 'success', message: 'Tip sent' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getTransactions = async (req, res) => {
  try {
    const { type, page = 1, limit = 30 } = req.query;
    const filter = { userId: req.params.userId };
    if (type) filter.type = type;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Transaction.countDocuments(filter)
    ]);
    res.json({ status: 'success', data: transactions, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ========== CREATOR PROFILES ==========
const upsertCreatorProfile = async (req, res) => {
  try {
    const profile = await CreatorProfile.findOneAndUpdate({ userId: req.body.userId }, req.body, { upsert: true, new: true });
    res.json({ status: 'success', data: profile });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getCreatorProfile = async (req, res) => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ error: 'Creator not found' });
    res.json({ status: 'success', data: profile });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getTopCreators = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const creators = await CreatorProfile.find(filter).sort({ totalSubscribers: -1 }).limit(20);
    res.json({ status: 'success', data: creators });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ========== SUBSCRIPTIONS ==========
const subscribe = async (req, res) => {
  try {
    const { subscriberId, creatorId, tier } = req.body;
    const creator = await CreatorProfile.findOne({ userId: creatorId });
    if (!creator) return res.status(404).json({ error: 'Creator not found' });

    const tierConfig = creator.subscriptionTiers.find(t => t.name === tier);
    if (!tierConfig) return res.status(400).json({ error: 'Invalid tier' });

    // Charge wallet
    const wallet = await Wallet.findOne({ userId: subscriberId });
    if (!wallet || wallet.balance < tierConfig.price) return res.status(400).json({ error: 'Insufficient balance' });

    wallet.balance -= tierConfig.price;
    await wallet.save();

    // Credit creator
    await Wallet.findOneAndUpdate({ userId: creatorId }, { $inc: { balance: tierConfig.price * 0.85, lifetimeEarnings: tierConfig.price * 0.85 } }, { upsert: true }); // 85% to creator

    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    const sub = await Subscription.findOneAndUpdate(
      { subscriberId, creatorId },
      { tier, price: tierConfig.price, status: 'active', startDate: new Date(), nextBillingDate: nextBilling, perks: tierConfig.perks },
      { upsert: true, new: true }
    );

    // Update creator stats
    const totalSubs = await Subscription.countDocuments({ creatorId, status: 'active' });
    await CreatorProfile.findOneAndUpdate({ userId: creatorId }, { totalSubscribers: totalSubs });

    await new Transaction({ userId: subscriberId, amount: tierConfig.price, type: 'subscription', metadata: { creatorId, tier } }).save();

    res.json({ status: 'success', data: sub });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const cancelSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndUpdate(req.params.subId, { status: 'cancelled', cancelledAt: new Date(), autoRenew: false }, { new: true });
    res.json({ status: 'success', data: sub });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getMySubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ subscriberId: req.params.userId, status: 'active' });
    res.json({ status: 'success', data: subs });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getCreatorSubscribers = async (req, res) => {
  try {
    const subs = await Subscription.find({ creatorId: req.params.creatorId, status: 'active' });
    res.json({ status: 'success', data: subs });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ========== CREATOR EARNINGS ==========
const getCreatorEarnings = async (req, res) => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.params.userId });
    const wallet = await Wallet.findOne({ userId: req.params.userId });
    const recentTxns = await Transaction.find({ 'metadata.targetUserId': req.params.userId }).sort({ createdAt: -1 }).limit(50);
    
    res.json({ status: 'success', data: {
      totalEarnings: profile?.totalEarnings || 0,
      balance: wallet?.balance || 0,
      pendingBalance: wallet?.pendingBalance || 0,
      totalSubscribers: profile?.totalSubscribers || 0,
      recentTransactions: recentTxns
    }});
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export default { 
  getWallet, addFunds, buyCoins, sendTip, getTransactions,
  upsertCreatorProfile, getCreatorProfile, getTopCreators,
  subscribe, cancelSubscription, getMySubscriptions, getCreatorSubscribers,
  getCreatorEarnings
};
