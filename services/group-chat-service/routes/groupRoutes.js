import express from 'express';
import { createGroup, getGroupDetails, getUserGroups, updateGroup, addMember, removeMember, leaveGroup, makeAdmin, joinByInvite, sendMessage, getMessages, deleteMessage, reactToMessage, pinMessage, votePoll, searchMessages } from '../controllers/groupController.js';

const router = express.Router();

// Group management
router.post('/', createGroup);
router.get('/user/:userId', getUserGroups);
router.get('/:groupId', getGroupDetails);
router.put('/:groupId', updateGroup);
router.post('/:groupId/members', addMember);
router.delete('/:groupId/members', removeMember);
router.post('/:groupId/leave', leaveGroup);
router.post('/:groupId/admin', makeAdmin);
router.post('/join-invite', joinByInvite);

// Messages
router.post('/messages', sendMessage);
router.get('/messages/:groupId', getMessages);
router.get('/messages/:groupId/search', searchMessages);
router.delete('/messages/:messageId', deleteMessage);
router.post('/messages/:messageId/react', reactToMessage);
router.post('/messages/:messageId/pin', pinMessage);
router.post('/messages/:messageId/poll/vote', votePoll);

export default router;
