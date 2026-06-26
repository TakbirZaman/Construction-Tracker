import express from 'express';
import { getBudgetByProject, getBudgetSummary, createBudgetEntry, updateBudgetEntry, deleteBudgetEntry } from '../controllers/budgetController.js';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth.js';
import { validateId } from '../middleware/validate.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get('/summary', getBudgetSummary);
router.get('/', getBudgetByProject);
router.post('/', requireManagerOrAdmin, createBudgetEntry);
router.put('/:id', validateId, requireManagerOrAdmin, updateBudgetEntry);
router.delete('/:id', validateId, requireManagerOrAdmin, deleteBudgetEntry);

export default router;
