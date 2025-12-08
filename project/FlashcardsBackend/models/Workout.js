import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
    title: { type: String, required: true },
    exercises: { type: String, required: true },
    isFavorite: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Workout", workoutSchema);