import express from 'express';
import serverController from '../controllers/serverController.js';

const router = express.Router();

router.post('/', serverController.createServer);
router.get('/user/:userId', serverController.getUserServers);
router.get('/:serverId', serverController.getServer);
router.post('/join', serverController.joinServer);
router.post('/:serverId/leave', serverController.leaveServer);

// Channels inside server
router.post('/:serverId/channels', serverController.createServerChannel);

// Roles & Categories
router.post('/:serverId/roles', serverController.addRole);
router.post('/:serverId/roles/assign', serverController.assignRole);
router.post('/:serverId/categories', serverController.addCategory);

export default router;
