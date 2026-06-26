import express from 'express';
import { getAllProjects, getProjectById, createProject, updateProject, deleteProject, getProjectStats } from '../controllers/projectsController.js';
import { authenticate, requireAdmin, requireManagerOrAdmin } from '../middleware/auth.js';
import { validateId } from '../middleware/validate.js';
import tasksRouter from './tasks.js';
import materialsRouter from './materials.js';
import budgetRouter from './budget.js';

const router = express.Router();

router.use(authenticate);

router.get('/stats', getProjectStats);
router.get('/', getAllProjects);
router.get('/:id', validateId, getProjectById);
router.post('/', requireManagerOrAdmin, createProject);
router.put('/:id', validateId, requireManagerOrAdmin, updateProject);
router.delete('/:id', validateId, requireAdmin, deleteProject);

// Nested routes
router.use('/:projectId/tasks', tasksRouter);
router.use('/:projectId/materials', materialsRouter);
router.use('/:projectId/budget', budgetRouter);

export default router;
