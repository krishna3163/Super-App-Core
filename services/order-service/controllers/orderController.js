import Order from '../models/Order.js';

const placeOrder = async (req, res) => {
  try {
    const { userId, vendorId, items, totalAmount, shippingAddress, paymentMethod } = req.body;
    // Auto-generate initial tracking events
    const order = new Order({
      userId, vendorId, items, totalAmount, shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      tracking: {
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        currentLocation: 'Seller Warehouse',
        events: [{ status: 'Order Placed', location: 'Online', description: 'Your order has been placed successfully' }]
      }
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getVendorOrders = async (req, res) => {
  try {
    const orders = await Order.find({ vendorId: req.params.vendorId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, location, description, estimatedDelivery } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    if (location) order.tracking.currentLocation = location;
    if (estimatedDelivery) order.tracking.estimatedDelivery = new Date(estimatedDelivery);
    order.tracking.events.push({
      status,
      location: location || order.tracking.currentLocation,
      description: description || `Order status updated to ${status}`
    });
    if (status === 'delivered') order.deliveredAt = new Date();
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (['shipped', 'delivered', 'out_for_delivery'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel after shipping' });
    }
    order.status = 'cancelled';
    order.tracking.events.push({ status: 'cancelled', description: 'Order cancelled by user' });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Order-level chat between buyer and vendor
const sendOrderChat = async (req, res) => {
  try {
    const { senderId, senderName, message } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.orderChat.push({ senderId, senderName, message });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { placeOrder, getOrderById, getUserOrders, getVendorOrders, updateOrderStatus, cancelOrder, sendOrderChat };
