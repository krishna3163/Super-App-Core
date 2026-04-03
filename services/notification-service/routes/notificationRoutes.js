import express from 'express';
import { createNotification, batchNotify, getNotifications, markAsRead, markAllAsRead, deleteNotification, clearAll, getUnreadCount, getPreferences, updatePreferences, muteUser, unmuteUser } from '../controllers/notificationController.js';

const router = express.Router();

// Notifications
router.post('/', createNotification);
router.post('/batch', batchNotify);
router.get('/:userId', getNotifications);
router.get('/:userId/unread-count', getUnreadCount);
router.post('/:notificationId/read', markAsRead);
router.post('/:userId/read-all', markAllAsRead);
router.delete('/:notificationId', deleteNotification);
router.delete('/clear/:userId', clearAll);

// Preferences
router.get('/preferences/:userId', getPreferences);
router.put('/preferences/:userId', updatePreferences);
router.post('/preferences/:userId/mute', muteUser);
router.post('/preferences/:userId/unmute', unmuteUser);

export default router;
