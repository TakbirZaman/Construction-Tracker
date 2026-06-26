import express from 'express';
import { getMaterialsByProject, getMaterialById, createMaterial, updateMaterial, deleteMaterial, getMaterialSummary } from '../controllers/materialsController.js';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth.js';
import { validateId } from '../middleware/validate.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get('/summary', getMaterialSummary);
router.get('/', getMaterialsByProject);
router.get('/:id', validateId, getMaterialById);
router.post('/', requireManagerOrAdmin, createMaterial);
router.put('/:id', validateId, requireManagerOrAdmin, updateMaterial);
router.delete('/:id', validateId, requireManagerOrAdmin, deleteMaterial);

export default router;
