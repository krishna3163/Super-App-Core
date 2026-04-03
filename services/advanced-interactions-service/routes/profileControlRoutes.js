import express from 'express';
import * as profileControlController from '../controllers/profileControlController.js';

const router = express.Router();

router.patch('/disable', profileControlController.disableProfile);
router.patch('/reactivate', profileControlController.reactivateProfile);
router.delete('/delete', profileControlController.deleteProfile);

export default router;
