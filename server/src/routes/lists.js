import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { updateList, deleteList } from '../controllers/listController.js';
import { createCard, listCards } from '../controllers/cardController.js';

const router = Router();

router.use(authRequired);

router.patch('/:id', asyncHandler(updateList));
router.delete('/:id', asyncHandler(deleteList));

// Cards nested under a list.
router.post('/:listId/cards', asyncHandler(createCard));
router.get('/:listId/cards', asyncHandler(listCards));

export default router;
