export type DeckItem = { id: string, title: string }
export type CardItem = { _id: string, question: string, answer: string, isFavorite: boolean, deckId: string }

export type Workout = {
    _id: string;
    title: string;
    exercises: string;
    isFavorite: boolean;
    createdAt: string;
};

export type WorkoutLog = {
    _id: string;
    workoutId: string;
    performedAt: string;
    notes?: string;
};