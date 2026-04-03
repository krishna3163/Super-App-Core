import GigOrder from '../models/GigOrder.js';
import Gig from '../models/Gig.js';
import ServiceProvider from '../models/ServiceProvider.js';

// Place an order
export const placeOrder = async (req, res) => {
  try {
    const { gigId, buyerId, buyerName, packageType, requirements, quantity = 1 } = req.body;
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ error: 'Gig not found' });

    const pkg = gig.packages.find(p => p.name === packageType);
    if (!pkg) return res.status(400).json({ error: 'Invalid package type' });

    const totalAmount = pkg.price * quantity;
    const serviceFee = Math.round(totalAmount * 0.1); // 10% service fee

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + pkg.deliveryDays);

    const order = new GigOrder({
      gigId, buyerId, buyerName, sellerId: gig.providerId, sellerName: gig.providerName,
      packageType, price: pkg.price, quantity, totalAmount: totalAmount + serviceFee, serviceFee,
      requirements, deliveryDate,
      revisions: { allowed: pkg.revisions || 1, used: 0 }
    });
    await order.save();

    // Update gig stats
    await Gig.findByIdAndUpdate(gigId, { $inc: { ordersInQueue: 1 } });

    res.status(201).json({ status: 'success', data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Start working on order
export const startOrder = async (req, res) => {
  try {
    const order = await GigOrder.findByIdAndUpdate(req.params.orderId, { status: 'in_progress' }, { new: true });
    res.json({ status: 'success', data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Deliver order
export const deliverOrder = async (req, res) => {
  try {
    const { message, files } = req.body;
    const order = await GigOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.deliveries.push({ message, files, deliveredAt: new Date() });
    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();

    res.json({ status: 'success', data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Accept delivery (complete order)
export const acceptDelivery = async (req, res) => {
  try {
    const order = await GigOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = 'completed';
    order.completedAt = new Date();
    await order.save();

    // Update gig and provider stats
    await Promise.all([
      Gig.findByIdAndUpdate(order.gigId, { $inc: { ordersCompleted: 1, ordersInQueue: -1 } }),
      ServiceProvider.findOneAndUpdate(
        { userId: order.sellerId },
        { $inc: { completedGigs: 1, totalEarnings: order.totalAmount - order.serviceFee } }
      )
    ]);

    res.json({ status: 'success', data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Request revision
export const requestRevision = async (req, res) => {
  try {
    const { message } = req.body;
    const order = await GigOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.revisions.used >= order.revisions.allowed) {
      return res.status(400).json({ error: 'No revisions remaining' });
    }

    order.status = 'revision_requested';
    order.revisions.used += 1;
    order.messages.push({ senderId: order.buyerId, senderName: order.buyerName, message: `Revision requested: ${message}` });
    await order.save();

    res.json({ status: 'success', data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await GigOrder.findByIdAndUpdate(
      req.params.orderId,
      { status: 'cancelled', cancellationReason: reason },
      { new: true }
    );
    await Gig.findByIdAndUpdate(order.gigId, { $inc: { ordersInQueue: -1 } });
    res.json({ status: 'success', data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Leave review on completed order
export const leaveReview = async (req, res) => {
  try {
    const { rating, comment, communication, serviceAsDescribed, wouldRecommend } = req.body;
    const order = await GigOrder.findById(req.params.orderId);
    if (!order || order.status !== 'completed') return res.status(400).json({ error: 'Can only review completed orders' });

    order.review = { rating, comment, communication, serviceAsDescribed, wouldRecommend, createdAt: new Date() };
    await order.save();

    // Update gig and provider ratings
    const gigOrders = await GigOrder.find({ gigId: order.gigId, 'review.rating': { $exists: true } });
    const avgRating = gigOrders.reduce((sum, o) => sum + o.review.rating, 0) / gigOrders.length;
    await Gig.findByIdAndUpdate(order.gigId, { rating: Math.round(avgRating * 10) / 10, reviewCount: gigOrders.length });

    const providerOrders = await GigOrder.find({ sellerId: order.sellerId, 'review.rating': { $exists: true } });
    const provAvg = providerOrders.reduce((sum, o) => sum + o.review.rating, 0) / providerOrders.length;
    await ServiceProvider.findOneAndUpdate({ userId: order.sellerId }, { rating: Math.round(provAvg * 10) / 10, reviewCount: providerOrders.length });

    res.json({ status: 'success', data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send message in order
export const sendOrderMessage = async (req, res) => {
  try {
    const { senderId, senderName, message, files } = req.body;
    const order = await GigOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.messages.push({ senderId, senderName, message, files });
    await order.save();

    res.json({ status: 'success', data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get orders for buyer
export const getBuyerOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { buyerId: req.params.userId };
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      GigOrder.find(filter).populate('gigId').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      GigOrder.countDocuments(filter)
    ]);
    res.json({ status: 'success', data: orders, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get orders for seller
export const getSellerOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { sellerId: req.params.userId };
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      GigOrder.find(filter).populate('gigId').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      GigOrder.countDocuments(filter)
    ]);
    res.json({ status: 'success', data: orders, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
