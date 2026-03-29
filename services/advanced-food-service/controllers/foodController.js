import AdvancedRestaurant from '../models/AdvancedRestaurant.js';
import AdvancedOrder from '../models/AdvancedOrder.js';

const searchRestaurants = async (req, res) => {
  try {
    const { q, cuisine, veg, sort = 'rating', lat, lon, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (q) filter.name = new RegExp(q, 'i');
    if (cuisine) filter.cuisines = cuisine;
    if (veg === 'true') filter.isVeg = true;

    const sortMap = { rating: { rating: -1 }, delivery_time: { avgDeliveryTime: 1 }, cost_low: { avgCostForTwo: 1 }, cost_high: { avgCostForTwo: -1 }, popular: { totalOrders: -1 } };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const restaurants = await AdvancedRestaurant.find(filter).sort(sortMap[sort] || sortMap.rating).skip(skip).limit(parseInt(limit));
    res.json({ status: 'success', data: restaurants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRestaurantDetails = async (req, res) => {
  try {
    const restaurant = await AdvancedRestaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json({ status: 'success', data: restaurant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMenu = async (req, res) => {
  try {
    const restaurant = await AdvancedRestaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    
    // Group menu items by category
    const menuByCategory = {};
    (restaurant.menu || []).forEach(item => {
      const cat = item.category || 'Other';
      if (!menuByCategory[cat]) menuByCategory[cat] = [];
      menuByCategory[cat].push(item);
    });
    
    res.json({ status: 'success', data: { restaurantName: restaurant.name, categories: menuByCategory } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const placeOrder = async (req, res) => {
  try {
    const { userId, userName, restaurantId, items, deliveryAddress, paymentMethod = 'cash', specialInstructions, couponCode } = req.body;
    
    const restaurant = await AdvancedRestaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map(item => {
      const menuItem = restaurant.menu?.find(m => m._id?.toString() === item.menuItemId || m.name === item.name);
      const price = menuItem?.price || item.price || 0;
      subtotal += price * (item.quantity || 1);
      return { name: menuItem?.name || item.name, price, quantity: item.quantity || 1, customizations: item.customizations };
    });

    const deliveryFee = subtotal > 500 ? 0 : 40;
    const tax = Math.round(subtotal * 0.05);
    let discount = 0;
    if (couponCode === 'FIRST50') discount = Math.min(subtotal * 0.5, 150);
    else if (couponCode === 'FLAT100') discount = 100;

    const total = subtotal + deliveryFee + tax - discount;
    const estimatedDelivery = new Date(Date.now() + (restaurant.avgDeliveryTime || 35) * 60000);

    const order = new AdvancedOrder({
      userId, userName, restaurantId, restaurantName: restaurant.name,
      items: orderItems, subtotal, deliveryFee, tax, discount, total,
      deliveryAddress, paymentMethod, specialInstructions, couponCode,
      estimatedDelivery, status: 'placed'
    });
    await order.save();

    await AdvancedRestaurant.findByIdAndUpdate(restaurantId, { $inc: { totalOrders: 1 } });

    res.status(201).json({ status: 'success', data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const update = { status };
    if (status === 'delivered') update.deliveredAt = new Date();
    if (status === 'cancelled') update.cancelledAt = new Date();

    const order = await AdvancedOrder.findByIdAndUpdate(req.params.orderId, update, { new: true });
    res.json({ status: 'success', data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await AdvancedOrder.find({ userId: req.params.userId }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ status: 'success', data: orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const trackOrder = async (req, res) => {
  try {
    const order = await AdvancedOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ status: 'success', data: { 
      orderId: order._id, status: order.status, estimatedDelivery: order.estimatedDelivery,
      restaurant: order.restaurantName, items: order.items, total: order.total
    }});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rateOrder = async (req, res) => {
  try {
    const { rating, review, foodRating, deliveryRating } = req.body;
    const order = await AdvancedOrder.findByIdAndUpdate(req.params.orderId, {
      'review.rating': rating, 'review.comment': review, 'review.foodRating': foodRating, 'review.deliveryRating': deliveryRating
    }, { new: true });

    // Update restaurant rating
    if (order) {
      const orders = await AdvancedOrder.find({ restaurantId: order.restaurantId, 'review.rating': { $exists: true } });
      const avgRating = orders.reduce((sum, o) => sum + o.review.rating, 0) / orders.length;
      await AdvancedRestaurant.findByIdAndUpdate(order.restaurantId, { rating: Math.round(avgRating * 10) / 10 });
    }
    res.json({ status: 'success', data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const reorderPrevious = async (req, res) => {
  try {
    const previousOrder = await AdvancedOrder.findById(req.params.orderId);
    if (!previousOrder) return res.status(404).json({ error: 'Order not found' });
    
    const newOrder = new AdvancedOrder({
      ...previousOrder.toObject(),
      _id: undefined,
      status: 'placed',
      createdAt: undefined,
      updatedAt: undefined,
      deliveredAt: undefined,
      review: undefined,
      estimatedDelivery: new Date(Date.now() + 35 * 60000)
    });
    await newOrder.save();
    res.status(201).json({ status: 'success', data: newOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { searchRestaurants, getRestaurantDetails, getMenu, placeOrder, updateOrderStatus, getOrderHistory, trackOrder, rateOrder, reorderPrevious };
