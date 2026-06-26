import express from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, getWorkers } from '../controllers/usersController.js';
import { authenticate, requireAdmin, requireManagerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', requireAdmin, getAllUsers);
router.get('/workers', requireManagerOrAdmin, getWorkers);
router.get('/:id', requireAdmin, getUserById);
router.post('/', requireAdmin, createUser);
router.put('/:id', requireAdmin, updateUser);
router.delete('/:id', requireAdmin, deleteUser);

export default router;
