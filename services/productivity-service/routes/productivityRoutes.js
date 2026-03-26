import express from 'express';
import workspaceController from '../controllers/workspaceController.js';
import pageController from '../controllers/pageController.js';

const router = express.Router();

// Workspaces
router.post('/workspaces', workspaceController.createWorkspace);
router.get('/workspaces/user/:userId', workspaceController.getWorkspaces);
router.post('/workspaces/add-member', workspaceController.addMember);

// Pages
router.post('/pages', pageController.createPage);
router.get('/pages/:pageId', pageController.getPage);
router.patch('/pages/:pageId', pageController.updatePage);
router.get('/workspaces/:workspaceId/pages', pageController.getWorkspacePages);

// Forms
router.post('/forms', workspaceController.createForm);
router.get('/forms/user/:userId', workspaceController.getUserForms);
router.get('/forms/:id', workspaceController.getFormById);
router.post('/forms/:id/submit', workspaceController.submitResponse);

export default router;
