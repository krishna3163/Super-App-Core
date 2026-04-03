import express from 'express';
import cartController from '../controllers/cartController.js';

const router = express.Router();

router.post('/add', cartController.addToCart);
router.get('/:userId', cartController.getCart);
router.patch('/:id', cartController.updateQuantity);
router.delete('/:id', cartController.removeItem);
router.delete('/clear/:userId', cartController.clearCart);

export default router;
