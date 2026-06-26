import express from 'express';
import { getTasksByProject, getTaskById, createTask, updateTask, deleteTask, getMyTasks } from '../controllers/tasksController.js';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth.js';
import { validateId } from '../middleware/validate.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get('/my', getMyTasks);
router.get('/', getTasksByProject);
router.get('/:id', validateId, getTaskById);
router.post('/', requireManagerOrAdmin, createTask);
router.put('/:id', validateId, updateTask);
router.delete('/:id', validateId, requireManagerOrAdmin, deleteTask);

export default router;
