import express from 'express';
import { addWorkoutLogs, getWorkoutLogs, deleteWorkoutLog, getWorkoutLogsById } from '../controllers/workoutLogsController.js';

const router = express.Router();

router.post('/', addWorkoutLogs);
router.delete('/:workoutId', deleteWorkoutLog);
router.get('/:workoutId', getWorkoutLogsById);
router.get('/', getWorkoutLogs);

export default router;