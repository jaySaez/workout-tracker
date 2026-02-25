import mongoose from 'mongoose';

const setSchema = new mongoose.Schema({
    reps: { type: Number },
    weight: { type: Number },
    skipped: { type: Boolean, default: false },
}, { _id: false });

const logExerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sets: { type: [setSchema], required: true },
}, { _id: false });

const workoutLogSchema = new mongoose.Schema({
    workoutId: { type: mongoose.Schema.Types.ObjectId, ref: "Workout", required: true },
    performedAt: { type: Date, default: Date.now },
    notes: { type: String },
    exercises: { type: [logExerciseSchema], default: [] },
});

export const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);