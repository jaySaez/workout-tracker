import mongoose from 'mongoose';

const deckSchema = new mongoose.Schema({
    title: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export const Deck = mongoose.model('Deck', deckSchema);