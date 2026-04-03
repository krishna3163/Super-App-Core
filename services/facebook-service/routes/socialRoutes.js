import express from 'express';
import socialController from '../controllers/socialController.js';

const router = express.Router();

// Friends
router.post('/friends/request', socialController.sendFriendRequest);
router.post('/friends/respond', socialController.respondToFriendRequest);
router.get('/friends/:userId', socialController.getFriends);
router.get('/friends/pending/:userId', socialController.getPendingRequests);

// Timeline & Feed
router.post('/posts', socialController.createTimelinePost);
router.get('/timeline/:targetId', socialController.getTimeline);
router.get('/feed/:userId', socialController.getNewsFeed);
router.post('/posts/:postId/react', socialController.reactToPost);
router.post('/posts/:postId/comment', socialController.addComment);
router.post('/posts/:postId/share', socialController.sharePost);

// Pages
router.post('/pages', socialController.createPage);
router.get('/pages/user/:userId', socialController.getPages);

// Groups
router.post('/groups', socialController.createGroup);
router.get('/groups/user/:userId', socialController.getGroups);

// Events
router.post('/events', socialController.createEvent);
router.post('/events/:eventId/rsvp', socialController.rsvpToEvent);
router.get('/events/upcoming', socialController.getUpcomingEvents);

export default router;
