import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { updateList, deleteList } from '../controllers/listController.js';

const router = Router();

router.use(authRequired);

router.patch('/:id', asyncHandler(updateList));
router.delete('/:id', asyncHandler(deleteList));

export default router;
