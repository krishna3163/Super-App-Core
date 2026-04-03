import express from 'express';
import { 
  createChannel, getUserChannels, subscribeToChannel, getChannel, 
  updateChannelSettings, sendChannelMessage, getChannelMessages, 
  addAdmin, addMembers, pinMessage, unpinMessage, getPinnedMessages,
  createThread, getChannelThreads, updatePermissions
} from '../controllers/channelController.js';

const router = express.Router();

router.post('/', createChannel);
router.get('/user/:userId', getUserChannels);
router.post('/subscribe', subscribeToChannel);
router.get('/:channelId', getChannel);
router.put('/:channelId', updateChannelSettings); // Full settings update (topic, slowmode, etc)
router.post('/:channelId/messages', sendChannelMessage);
router.get('/:channelId/messages', getChannelMessages);
router.post('/:channelId/admin', addAdmin);
router.post('/:channelId/members', addMembers);

// Discord-like subfeatures
router.post('/:channelId/messages/:messageId/pin', pinMessage);
router.delete('/:channelId/messages/:messageId/pin', unpinMessage);
router.get('/:channelId/pinned', getPinnedMessages);

// Thread support
router.post('/:channelId/messages/:messageId/thread', createThread);
router.get('/:channelId/threads', getChannelThreads);

// Permissions
router.put('/:channelId/permissions', updatePermissions);

export default router;
