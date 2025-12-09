import express from 'express';
import { addworkouts, deleteWorkout, getWorkouts, toggleFavorite, getFavorites, getWorkoutById } from '../controllers/workoutsController.js';

const router = express.Router();

router.post('/', addworkouts);
router.delete('/:workoutId', deleteWorkout);
router.get('/', getWorkouts);
router.get('/:workoutId', getWorkoutById)
router.patch('/:workoutId/favorite', toggleFavorite);
router.get('/favorites', getFavorites);

export default router;