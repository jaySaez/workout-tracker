import express from 'express';
import { addWorkoutLogs, getWorkoutLogs, deleteWorkoutLog, getWorkoutLogsById, getLatestWorkoutLog } from '../controllers/workoutLogsController.js';

const router = express.Router();

router.post('/', addWorkoutLogs);
router.delete('/:workoutLogId', deleteWorkoutLog);
router.get('/latest/:workoutId', getLatestWorkoutLog);
router.get('/:id', getWorkoutLogsById);
router.get('/', getWorkoutLogs);

export default router;