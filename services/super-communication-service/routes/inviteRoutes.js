import express from 'express';
import * as inviteController from '../controllers/inviteController.js';

const router = express.Router();

router.post('/create', inviteController.createInvite);
router.post('/join/:token', inviteController.joinViaInvite);

export default router;
