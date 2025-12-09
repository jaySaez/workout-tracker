import { WorkoutLog } from '../models/WorkoutLog.js';


export const getWorkoutLogs = async (req, res) => {
    const workoutLogs = await WorkoutLog.find();
    res.json(workoutLogs);
};

export const getWorkoutLogsById = async (req, res) => {
    try {
        const workoutLogs = await WorkoutLog.find({ workoutId: req.params.workoutId })
        if (!workoutLogs) {
            return res.status(404).json({ error: 'Logs not found' });
        }
        res.json(workoutLogs);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const addWorkoutLogs = async (req, res) => {
    try {
        const workoutLog = new WorkoutLog(req.body);
        await workoutLog.save();
        res.status(201).json(workoutLog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteWorkoutLog = async (req, res) => {
    try {
        const deleted = await WorkoutLog.findByIdAndDelete(req.params.workoutLogId);
        if (!deleted) {
            return res.status(404).json({ error: 'WorkoutLog not found' });
        }
        res.json({ message: 'WorkoutLog deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};