import express from 'express';
import { getDecks } from '../controllers/decksController.js';
import { addDecks } from '../controllers/decksController.js';
import { getDeckById } from '../controllers/decksController.js';
import { deleteDeck } from '../controllers/decksController.js';
import { getCardsByDeck } from '../controllers/cardsController.js';
import { addCardToDeck } from '../controllers/cardsController.js';

const router = express.Router();

router.get('/', getDecks);
router.post('/', addDecks);
router.get('/:deckId', getDeckById);
router.delete('/:deckId', deleteDeck);
router.get('/:deckId/cards', getCardsByDeck);
router.post('/:deckId/cards', addCardToDeck);

export default router;