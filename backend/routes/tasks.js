import express from 'express';
import { getTasksByProject, getTaskById, createTask, updateTask, deleteTask, getMyTasks } from '../controllers/tasksController.js';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get('/my', getMyTasks);
router.get('/', getTasksByProject);
router.get('/:id', getTaskById);
router.post('/', requireManagerOrAdmin, createTask);
router.put('/:id', updateTask);
router.delete('/:id', requireManagerOrAdmin, deleteTask);

export default router;
