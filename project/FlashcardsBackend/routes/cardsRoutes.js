import express from 'express';
import { deleteCard } from '../controllers/cardsController.js';
import { updateCard } from '../controllers/cardsController.js';
import { toggleFavorite } from '../controllers/cardsController.js';
import { getFavorites } from '../controllers/cardsController.js';

const router = express.Router();

router.get('/favorites', getFavorites);
router.delete('/:cardId', deleteCard);
router.patch('/:cardId', updateCard);
router.patch('/:cardId/favorite', toggleFavorite);

export default router;