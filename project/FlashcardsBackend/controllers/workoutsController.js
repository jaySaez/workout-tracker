import { Workout } from '../models/Workout.js';


export const getWorkouts = async (req, res) => {
    const workouts = await Workout.find();
    res.json(workouts);
};

export const getWorkoutById = async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.workoutId)
        if (!workout) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        res.json(workout);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const addworkouts = async (req, res) => {
    try {
        const workout = new Workout(req.body);
        await workout.save();
        res.status(201).json(workout);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteWorkout = async (req, res) => {
    try {
        const deleted = await Workout.findByIdAndDelete(req.params.workoutId);
        if (!deleted) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        await WorkoutLog.deleteMany({ workoutId: req.params.workoutId });

        res.json({ message: 'Workout deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const toggleFavorite = async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.workoutId);
        if (!workout) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        workout.isFavorite = !workout.isFavorite;
        await workout.save();
        res.json(workout);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getFavorites = async (req, res) => {
    try {
        const favs = await Workout.find({ isFavorite: true });
        res.json(favs);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
