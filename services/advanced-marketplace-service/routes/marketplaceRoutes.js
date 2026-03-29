import express from 'express';
import listingController from '../controllers/listingController.js';
import negotiationController from '../controllers/negotiationController.js';

const router = express.Router();

// Listings
router.post('/listings', listingController.createListing);
router.get('/listings', listingController.getListings);
router.get('/listings/seller/:sellerId', listingController.getSellerListings);
router.get('/listings/:id', listingController.getListingDetails);
router.put('/listings/:id', listingController.updateListing);
router.delete('/listings/:id', listingController.deleteListing);
router.post('/listings/:id/sold', listingController.markAsSold);
router.post('/listings/:id/wishlist', listingController.addToWishlist);
router.post('/listings/:id/report', listingController.reportListing);

// Bidding
router.post('/bids', listingController.placeBid);
router.get('/bids/:listingId', listingController.getBids);
router.post('/bids/:bidId/accept', listingController.acceptBid);

// Negotiations
router.post('/negotiate', negotiationController.startNegotiation);
router.get('/negotiate/:userId', negotiationController.getNegotiations);
router.post('/negotiate/message', negotiationController.sendMessage);

export default router;
