import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';

const placeOrder = async (req, res) => {
  try {
    const { userId, restaurantId, items, shippingAddress, paymentMethod } = req.body;
    const restaurant = await Restaurant.findById(restaurantId).catch(() => null);
    const total = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const order = new Order({
      userId, restaurantId,
      restaurantName: restaurant?.name || '',
      items, total, shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      estimatedTime: restaurant ? '30-45 min' : '45-60 min'
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, deliveryPartnerId, estimatedTime } = req.body;
    const update = { status };
    if (deliveryPartnerId) update.deliveryPartnerId = deliveryPartnerId;
    if (estimatedTime) update.estimatedTime = estimatedTime;
    const order = await Order.findByIdAndUpdate(orderId, update, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getActiveOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId, status: { $in: ['placed', 'confirmed', 'preparing', 'on_the_way'] } }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendOrderChat = async (req, res) => {
  try {
    const { orderId, senderId, senderName, message } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.orderChat.push({ senderId, senderName, message });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Vendor: get all orders for a restaurant
const getRestaurantOrders = async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: req.params.restaurantId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Vendor: update order status by orderId
const updateOrderStatusById = async (req, res) => {
  try {
    const { status, estimatedTime } = req.body;
    const update = { status };
    if (estimatedTime) update.estimatedTime = estimatedTime;
    const order = await Order.findByIdAndUpdate(req.params.orderId, update, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Table booking (stored as special order type)
const placeTableBooking = async (req, res) => {
  try {
    const { userId, restaurantId, tableId, name, phone, date, time, guests, occasion, depositAmount } = req.body;
    const order = new Order({
      userId, restaurantId,
      items: [{ name: `Table Booking - ${tableId}`, price: depositAmount || 0, quantity: 1 }],
      total: depositAmount || 0,
      shippingAddress: { name, phone, address: `${date} at ${time} · ${guests} guests${occasion ? ` · ${occasion}` : ''}` },
      status: 'confirmed',
      estimatedTime: `${date} at ${time}`
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTableBookings = async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: req.params.restaurantId, 'items.name': /Table Booking/ }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { placeOrder, updateOrderStatus, getOrderHistory, getActiveOrders, sendOrderChat, getRestaurantOrders, updateOrderStatusById, placeTableBooking, getTableBookings };
