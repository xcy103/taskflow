import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getCard, updateCard, deleteCard } from '../controllers/cardController.js';

const router = Router();

router.use(authRequired);

router.get('/:id', asyncHandler(getCard));
router.patch('/:id', asyncHandler(updateCard));
router.delete('/:id', asyncHandler(deleteCard));

export default router;
