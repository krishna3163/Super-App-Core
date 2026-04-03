import express from 'express';
import * as roleController from '../controllers/roleController.js';
import { requirePermission } from '../middleware/rbac.js';

const router = express.Router();

router.post('/', requirePermission('manage_roles'), roleController.createRole);
router.post('/assign', requirePermission('manage_roles'), roleController.assignRole);
router.get('/:targetId', roleController.getRoles);
router.get('/:targetId/audit', requirePermission('view_audit_log'), roleController.getAuditLogs);

export default router;
