import { Card } from '../models/Card.js';


export const getCards = async (req, res) => {
    const cards = await Card.find();
    res.json(cards);
};

export const addCards = async (req, res) => {
    try {
        const card = new Card(req.body);
        await card.save();
        res.status(201).json(card);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getCardsByDeck = async (req, res) => {
    try {
        const cards = await Card.find({ deckId: req.params.deckId });
        res.json(cards);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const addCardToDeck = async (req, res) => {
    try {
        const card = new Card({
            deckId: req.params.deckId,
            question: req.body.question,
            answer: req.body.answer,
            isFavorite: false,
        });
        await card.save();
        res.status(201).json(card);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


export const deleteCard = async (req, res) => {
    try {
        const deleted = await Card.findByIdAndDelete(req.params.cardId);
        if (!deleted) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.json({ message: 'Card deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const updateCard = async (req, res) => {
    try {
        const card = await Card.findByIdAndUpdate(req.params.cardId, req.body, { new: true });
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.json(card);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const toggleFavorite = async (req, res) => {
    try {
        const card = await Card.findById(req.params.cardId);
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        card.isFavorite = !card.isFavorite;
        await card.save();
        res.json(card);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getFavorites = async (req, res) => {
    try {
        const favs = await Card.find({ isFavorite: true });
        res.json(favs);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
