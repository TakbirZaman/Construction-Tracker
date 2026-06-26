import express from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, getWorkers } from '../controllers/usersController.js';
import { authenticate, requireAdmin, requireManagerOrAdmin } from '../middleware/auth.js';
import { validateId } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', requireAdmin, getAllUsers);
router.get('/workers', requireManagerOrAdmin, getWorkers);
router.get('/:id', validateId, requireAdmin, getUserById);
router.post('/', requireAdmin, createUser);
router.put('/:id', validateId, requireAdmin, updateUser);
router.delete('/:id', validateId, requireAdmin, deleteUser);

export default router;
