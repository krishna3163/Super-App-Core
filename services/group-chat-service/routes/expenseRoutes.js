import express from 'express';
import * as expenseController from '../controllers/expenseController.js';

const router = express.Router();

router.post('/', expenseController.createExpense);
router.get('/:groupId', expenseController.getGroupExpenses);
router.get('/:groupId/balances', expenseController.getGroupBalances);
router.post('/settle', expenseController.settleExpense);

export default router;
