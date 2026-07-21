import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createBoard,
  listBoards,
  getBoard,
  updateBoard,
  deleteBoard,
} from '../controllers/boardController.js';
import { createList, listLists } from '../controllers/listController.js';

const router = Router();

router.use(authRequired); // every board route requires a logged-in user

router.post('/', asyncHandler(createBoard));
router.get('/', asyncHandler(listBoards));
router.get('/:id', asyncHandler(getBoard));
router.patch('/:id', asyncHandler(updateBoard));
router.delete('/:id', asyncHandler(deleteBoard));

// Lists nested under a board.
router.post('/:boardId/lists', asyncHandler(createList));
router.get('/:boardId/lists', asyncHandler(listLists));

export default router;
