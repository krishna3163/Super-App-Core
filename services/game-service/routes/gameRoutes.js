import express from 'express';
import roomController from '../controllers/roomController.js';

const router = express.Router();

router.post('/rooms', roomController.createRoom);
router.post('/rooms/join', roomController.joinRoom);
router.get('/rooms/:roomCode', roomController.getRoom);

export default router;
