import express from 'express';
import * as roleController from '../controllers/roleController.js';

const router = express.Router();

router.get('/:userId', roleController.getUserRoles);
router.patch('/switch', roleController.switchActiveRole);
router.post('/add', roleController.addRole);

export default router;
