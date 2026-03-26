import express from 'express';
import * as channelController from '../controllers/channelController.js';

const router = express.Router();

router.post('/create', channelController.createChannel);
router.get('/user/:userId', channelController.getUserChannels);
router.post('/subscribe', channelController.subscribeToChannel);
router.get('/:channelId', channelController.getChannel);
router.patch('/:channelId', channelController.updateChannel);
router.post('/:channelId/message', channelController.sendChannelMessage);
router.get('/:channelId/messages', channelController.getChannelMessages);
router.post('/:channelId/admin', channelController.addAdmin);
router.post('/:channelId/members', channelController.addMembers);

export default router;
