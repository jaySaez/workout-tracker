import express from 'express';
import cardsRoutes from './routes/cardsRoutes.js';
import decksRoutes from './routes/decksRoutes.js';
import mongoose from 'mongoose';
import 'dotenv/config';
import cors from 'cors'


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
app.use('/api/decks', decksRoutes);
app.use('/api/cards', cardsRoutes);

app.listen(process.env.PORT, () => console.log(`Server running on port ${PORT}`));