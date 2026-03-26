import express from 'express';
import notificationController from '../controllers/notificationController.js';

const router = express.Router();

router.post('/', notificationController.createNotification);
router.get('/:userId', notificationController.getNotifications);
router.patch('/:notificationId/read', notificationController.markAsRead);
router.post('/read-all', notificationController.markAllAsRead);

export default router;
