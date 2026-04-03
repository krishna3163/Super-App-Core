import express from 'express';
import { createGig, updateGig, searchGigs, getGigDetails, getProviderGigs, getFeaturedGigs, getCategories, deleteGig } from '../controllers/gigController.js';
import { placeOrder, startOrder, deliverOrder, acceptDelivery, requestRevision, cancelOrder, leaveReview, sendOrderMessage, getBuyerOrders, getSellerOrders } from '../controllers/orderController.js';
import { postGigRequest, getOpenRequests, getClientRequests, submitProposal, getProposals, acceptProposal, getProviderProposals } from '../controllers/requestController.js';
import { upsertProfile, getProfile, searchProviders, getTopProviders, updateOnlineStatus, getEarnings } from '../controllers/serviceProviderController.js';

const router = express.Router();

// Provider profiles
router.post('/providers', upsertProfile);
router.get('/providers/search', searchProviders);
router.get('/providers/top', getTopProviders);
router.get('/providers/:userId', getProfile);
router.post('/providers/status', updateOnlineStatus);
router.get('/providers/:userId/earnings', getEarnings);

// Gigs
router.post('/gigs', createGig);
router.put('/gigs/:gigId', updateGig);
router.delete('/gigs/:gigId', deleteGig);
router.get('/gigs/search', searchGigs);
router.get('/gigs/featured', getFeaturedGigs);
router.get('/gigs/categories', getCategories);
router.get('/gigs/provider/:providerId', getProviderGigs);
router.get('/gigs/:gigId', getGigDetails);

// Orders
router.post('/orders', placeOrder);
router.patch('/orders/:orderId/start', startOrder);
router.post('/orders/:orderId/deliver', deliverOrder);
router.post('/orders/:orderId/accept', acceptDelivery);
router.post('/orders/:orderId/revision', requestRevision);
router.post('/orders/:orderId/cancel', cancelOrder);
router.post('/orders/:orderId/review', leaveReview);
router.post('/orders/:orderId/message', sendOrderMessage);
router.get('/orders/buyer/:userId', getBuyerOrders);
router.get('/orders/seller/:userId', getSellerOrders);

// Gig Requests & Proposals
router.post('/requests', postGigRequest);
router.get('/requests/open', getOpenRequests);
router.get('/requests/client/:clientId', getClientRequests);
router.post('/proposals', submitProposal);
router.get('/proposals/request/:requestId', getProposals);
router.get('/proposals/provider/:providerId', getProviderProposals);
router.post('/proposals/:proposalId/accept', acceptProposal);

export default router;
