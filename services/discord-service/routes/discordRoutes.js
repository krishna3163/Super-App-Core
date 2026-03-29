import express from 'express';
import serverController from '../controllers/serverController.js';
import messageController from '../controllers/messageController.js';
import channelController from '../controllers/channelController.js';

const router = express.Router();

// Server management
router.post('/servers', serverController.createServer);
router.get('/servers/user/:userId', serverController.getServers);
router.get('/servers/discover', serverController.discoverServers);
router.get('/servers/:serverId', serverController.getServerDetails);
router.put('/servers/:serverId', serverController.updateServer);
router.post('/servers/join', serverController.joinServer);
router.post('/servers/leave', serverController.leaveServer);
router.post('/servers/kick', serverController.kickMember);
router.post('/servers/ban', serverController.banMember);
router.post('/servers/unban', serverController.unbanMember);
router.post('/servers/invite', serverController.createInvite);
router.post('/servers/invite/join', serverController.joinByInvite);

// Channels
router.post('/channels', channelController.createChannel);
router.get('/channels/server/:serverId', channelController.getChannels);
router.put('/channels/:channelId', channelController.updateChannel);
router.delete('/channels/:channelId', channelController.deleteChannel);

// Roles
router.post('/roles', channelController.createRole);
router.get('/roles/server/:serverId', channelController.getRoles);
router.put('/roles/:roleId', channelController.updateRole);
router.delete('/roles/:roleId', channelController.deleteRole);

// Messages
router.post('/messages', messageController.sendMessage);
router.get('/messages/channel/:channelId', messageController.getMessages);
router.put('/messages/:messageId', messageController.editMessage);
router.delete('/messages/:messageId', messageController.deleteMessage);
router.post('/messages/:messageId/reaction', messageController.addReaction);
router.post('/messages/:messageId/pin', messageController.pinMessage);
router.get('/messages/pinned/:channelId', messageController.getPinnedMessages);
router.get('/messages/search', messageController.searchMessages);

export default router;
