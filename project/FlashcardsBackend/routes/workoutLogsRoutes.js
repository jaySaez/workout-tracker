import express from 'express';
import { addWorkoutLogs, getWorkoutLogs, deleteWorkoutLog } from '../controllers/workoutLogsController.js';

const router = express.Router();

router.post('/', addWorkoutLogs);
router.delete('/:workoutId', deleteWorkoutLog);
router.get('/', getWorkoutLogs);

export default router;