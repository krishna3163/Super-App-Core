import ShippingLogistics from '../models/ShippingLogistics.js';
import crypto from 'crypto';

export const createShippingRecord = async (req, res) => {
  try {
    const { orderId, businessId, buyerId, originAddress, destinationAddress } = req.body;
    
    // Generate Universal Tracking Number (UTN)
    const trackingNumber = `SA-TRK-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const estimatedDeliveryDate = new Date(Date.now() + 7 * 86400000); // 7 Days default
    
    const shipping = new ShippingLogistics({
      orderId, businessId, buyerId, trackingNumber, originAddress, destinationAddress, estimatedDeliveryDate
    });
    
    await shipping.save();
    res.status(201).json({ status: 'success', data: shipping });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLiveLocation = async (req, res) => {
  try {
    const { trackingNumber, latitude, longitude, status } = req.body;
    
    const shipping = await ShippingLogistics.findOneAndUpdate(
      { trackingNumber },
      { 
        $set: { 
            'currentLocation.latitude': latitude, 
            'currentLocation.longitude': longitude,
            'currentLocation.lastUpdated': new Date()
        } 
      },
      { new: true }
    );
    
    if (!shipping) return res.status(404).json({ error: 'Tracking number not found.' });
    
    if (status) {
        shipping.status = status;
        if (status === 'delivered') shipping.actualDeliveryDate = new Date();
        await shipping.save();
    }
    
    // NOTE: In production, we emit this realtime over Socket.io to the buyer.
    
    res.json({ status: 'success', data: shipping });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const trackShipment = async (req, res) => {
    try {
        const { trackingNumber } = req.params;
        const shipping = await ShippingLogistics.findOne({ trackingNumber });
        if (!shipping) return res.status(404).json({ error: 'Shipment not found' });
        
        res.json({ status: 'success', data: shipping });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export default { createShippingRecord, updateLiveLocation, trackShipment };
