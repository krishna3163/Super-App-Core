import DeliveryPartner from '../models/DeliveryPartner.js';
import AdvancedOrder from '../models/AdvancedOrder.js';

const updatePartnerStatus = async (req, res) => {
  try {
    const { userId, status, location } = req.body;
    const partner = await DeliveryPartner.findOneAndUpdate(
      { userId },
      { status, location },
      { new: true, upsert: true }
    );
    res.json(partner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const { orderId, partnerId } = req.body;
    const order = await AdvancedOrder.findById(orderId);
    if (order.status !== 'placed' && order.status !== 'confirmed') {
      return res.status(400).json({ error: 'Order already assigned' });
    }

    order.deliveryPartnerId = partnerId;
    order.status = 'confirmed';
    await order.save();

    await DeliveryPartner.findOneAndUpdate({ userId: partnerId }, { status: 'busy' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const completeDelivery = async (req, res) => {
  try {
    const orderId = req.params.orderId || req.body.orderId;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }
    const order = await AdvancedOrder.findByIdAndUpdate(orderId, { status: 'delivered' }, { new: true });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Add earnings to partner (flat 30 units per delivery)
    await DeliveryPartner.findOneAndUpdate(
      { userId: order.deliveryPartnerId }, 
      { status: 'available', $inc: { earnings: 30 } }
    );
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEarnings = async (req, res) => {
  try {
    const partnerId = req.params.partnerId;
    const partner = await DeliveryPartner.findOne({ userId: partnerId });
    if (!partner) {
      return res.status(404).json({ error: 'Delivery partner not found' });
    }
    res.json({
      status: 'success',
      data: {
        userId: partner.userId,
        earnings: partner.earnings || 0,
        status: partner.status || 'available'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Backward-compatible aliases used by routes
const registerPartner = updatePartnerStatus;
const acceptDelivery = acceptOrder;

export default {
  updatePartnerStatus,
  acceptOrder,
  completeDelivery,
  getEarnings,
  registerPartner,
  acceptDelivery
};
