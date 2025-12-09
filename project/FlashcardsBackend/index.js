import express from 'express';
import workoutsRoutes from './routes/workoutsRoutes.js'
import workoutLogsRoutes from './routes/workoutLogsRoutes.js'
import mongoose from 'mongoose';
import 'dotenv/config';
import cors from 'cors'

const PORT = process.env.PORT || 3000
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Mongo connection error:', err);
    }
}

connectDB(); // Call the async function

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));
app.use('/api/workouts', workoutsRoutes);
app.use('/api/workoutLogs', workoutLogsRoutes);

app.listen(process.env.PORT, () => console.log(`Server running on port ${PORT}`));