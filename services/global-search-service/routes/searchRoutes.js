import express from 'express';
import searchController from '../controllers/searchController.js';

const router = express.Router();

router.get('/', searchController.globalSearch);
router.get('/trending', searchController.getTrending);

export default router;
