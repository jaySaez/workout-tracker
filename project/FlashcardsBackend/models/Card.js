import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
    deckId: { type: mongoose.Schema.Types.ObjectId, ref: "Deck", required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    isFavorite: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});


export const Card = mongoose.model('Card', cardSchema);