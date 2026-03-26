import CartItem from '../models/CartItem.js';

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, price } = req.body;
    let item = await CartItem.findOne({ userId, productId });
    
    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      item = new CartItem({ userId, productId, quantity, price });
      await item.save();
    }
    
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await CartItem.find({ userId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const item = await CartItem.findByIdAndUpdate(id, { quantity }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeItem = async (req, res) => {
  try {
    await CartItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await CartItem.deleteMany({ userId: req.params.userId });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { addToCart, getCart, updateQuantity, removeItem, clearCart };
