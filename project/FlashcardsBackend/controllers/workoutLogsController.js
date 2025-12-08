import { workoutLog } from '../models/WorkoutLog.js';


export const getWorkoutLogs = async (req, res) => {
    const workoutLogs = await workoutLog.find();
    res.json(workoutLogs);
};

export const addWorkoutLogs = async (req, res) => {
    try {
        const workoutLog = new Workout(req.body);
        await workoutLog.save();
        res.status(201).json(workoutLog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteWorkoutLog = async (req, res) => {
    try {
        const deleted = await workoutLog.findByIdAndDelete(req.params.workoutLogId);
        if (!deleted) {
            return res.status(404).json({ error: 'WorkoutLog not found' });
        }
        res.json({ message: 'WorkoutLog deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};