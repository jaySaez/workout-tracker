import { Deck } from '../models/Deck.js';


export const getDecks = async (req, res) => {
    const decks = await Deck.find();
    res.json(decks);
};

export const addDecks = async (req, res) => {
    try {
        const deck = new Deck(req.body);
        await deck.save();
        res.status(201).json(deck);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getDeckById = async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.deckId);
        if (!deck) {
            return res.status(404).json({ error: 'Deck not found' });
        }
        res.json(deck);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteDeck = async (req, res) => {
    try {
        const deleted = await Deck.findByIdAndDelete(req.params.deckId);
        if (!deleted) {
            return res.status(404).json({ error: 'Deck not found' });
        }
        res.json({ message: 'Deck deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};