import AdvancedRestaurant from '../models/AdvancedRestaurant.js';
import AdvancedOrder from '../models/AdvancedOrder.js';
import DeliveryPartner from '../models/DeliveryPartner.js';

const placeOrder = async (req, res) => {
  try {
    const { userId, restaurantId, items, deliveryLocation } = req.body;
    const total = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const deliveryCharge = 40; // Flat 40 units

    const order = new AdvancedOrder({ 
      userId, 
      restaurantId, 
      items, 
      total: total + deliveryCharge, 
      deliveryLocation,
      deliveryCharge 
    });
    await order.save();

    // Matching: Find nearby delivery partners within 3km
    const partners = await DeliveryPartner.find({
      status: 'available',
      location: {
        $near: {
          $geometry: deliveryLocation,
          $maxDistance: 3000
        }
      }
    }).limit(5);

    res.status(201).json({ order, nearbyPartners: partners });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, deliveryPartnerId } = req.body;
    const order = await AdvancedOrder.findByIdAndUpdate(
      orderId, 
      { status, deliveryPartnerId }, 
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOrderTracking = async (req, res) => {
  try {
    const order = await AdvancedOrder.findById(req.params.orderId).populate('restaurantId');
    if (order.deliveryPartnerId) {
      const partner = await DeliveryPartner.findOne({ userId: order.deliveryPartnerId });
      return res.json({ order, partnerLocation: partner.location });
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { placeOrder, updateOrderStatus, getOrderTracking };
