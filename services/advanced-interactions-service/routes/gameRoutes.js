import express from 'express';
import * as gameController from '../controllers/gameController.js';

const router = express.Router();

router.post('/start', gameController.startGame);
router.patch('/update', gameController.updateGameState);
router.post('/end', gameController.endGame);

export default router;
