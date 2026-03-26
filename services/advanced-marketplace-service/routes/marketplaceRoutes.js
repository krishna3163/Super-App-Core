import express from 'express';
import listingController from '../controllers/listingController.js';
import negotiationController from '../controllers/negotiationController.js';

const router = express.Router();

// Listings
router.post('/listings', listingController.createListing);
router.get('/listings', listingController.getListings);

// Bidding
router.post('/listings/bid', listingController.placeBid);
router.get('/listings/:listingId/bids', listingController.getBids);

// Negotiation
router.post('/negotiate/start', negotiationController.startNegotiation);
router.post('/negotiate/message', negotiationController.sendMessage);
router.get('/negotiate/user/:userId', negotiationController.getNegotiations);

export default router;
