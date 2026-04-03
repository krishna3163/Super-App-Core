import B2BProduct from '../models/B2BProduct.js';

export const createWholesaleListing = async (req, res) => {
  try {
    const { sellerId, productName, basePrice, inStock, moq, bulkPricing, leadTimeDays } = req.body;
    
    const product = new B2BProduct({
      sellerId, productName, basePrice, inStock, moq, bulkPricing, leadTimeDays
    });
    await product.save();

    res.status(201).json({ status: 'success', data: product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const negotiateBulkOrder = async (req, res) => {
  try {
    const { buyerId, productId, requestedQuantity, requestedPrice } = req.body;
    const product = await B2BProduct.findById(productId);
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (requestedQuantity < product.moq) {
      return res.status(400).json({ error: `MOQ (Minimum Order Quantity) is ${product.moq} units.` });
    }

    // Advanced negotiation logic or simple acceptance depending on business requirements
    // For now, we return a draft contract or "negotiation started" event.
    res.json({ 
      status: 'pending', 
      message: 'Negotiation sent to supplier.',
      contract: {
         buyerId, 
         productId, 
         requestedQuantity, 
         totalOffer: requestedPrice * requestedQuantity,
         status: 'awaiting_seller_approval' 
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createWholesaleListing, negotiateBulkOrder };
