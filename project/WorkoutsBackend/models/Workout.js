import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: Number },
}, { _id: false });

const workoutSchema = new mongoose.Schema({
    title: { type: String, required: true },
    exercises: { type: [exerciseSchema], required: true },
    isFavorite: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export const Workout = mongoose.model('Workout', workoutSchema);