import express from 'express';
import socialController from '../controllers/socialController.js';

const router = express.Router();

// Friends
router.post('/friends/request', socialController.sendFriendRequest);
router.post('/friends/respond', socialController.respondToFriendRequest);

// Timeline
router.post('/timeline/posts', socialController.createTimelinePost);
router.get('/timeline/:targetId', socialController.getTimeline);

// Pages & Groups
router.post('/pages', socialController.createPage);
router.post('/groups', socialController.createGroup);

// Events
router.post('/events', socialController.createEvent);
router.post('/events/rsvp', socialController.rsvpToEvent);

export default router;
