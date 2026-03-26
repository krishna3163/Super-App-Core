import express from 'express';
import serverController from '../controllers/serverController.js';
import channelController from '../controllers/channelController.js';
import messageController from '../controllers/messageController.js';

const router = express.Router();

// Servers
router.post('/servers', serverController.createServer);
router.get('/servers/:userId', serverController.getServers);
router.post('/servers/join', serverController.joinServer);

// Channels
router.post('/channels', channelController.createChannel);
router.get('/channels/:serverId', channelController.getChannels);

// Messages
router.post('/messages', messageController.sendMessage);
router.get('/messages/:channelId', messageController.getMessages);
router.post('/messages/react', messageController.addReaction);

export default router;
