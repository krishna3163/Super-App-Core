import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

router.post('/products', productController.createProduct);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.patch('/products/:id/status', productController.updateStatus);
router.post('/products/:id/wishlist', productController.toggleWishlist);

// Review Routes
router.post('/products/:id/reviews', productController.addReview);
router.get('/products/:id/reviews', productController.getReviews);
router.post('/reviews/:reviewId/helpful', productController.voteHelpful);

export default router;
