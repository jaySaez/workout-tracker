import mongoose from 'mongoose';

const workoutLogSchema = new mongoose.Schema({
    workoutId: { type: mongoose.Schema.Types.ObjectId, ref: "Workout", required: true },
    performedAt: { type: Date, default: Date.now },
    notes: { type: String },
});

export const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);