export type DeckItem = { id: string, title: string }
export type CardItem = { _id: string, question: string, answer: string, isFavorite: boolean, deckId: string }

export type WorkoutExercise = {
    name: string;
    sets: number;
    reps: number;
};

export type Workout = {
    _id: string;
    title: string;
    exercises: WorkoutExercise[];
    isFavorite: boolean;
    createdAt: string;
};

export type LogSet = {
    reps: number;
    weight: number;
};

export type LogExercise = {
    name: string;
    sets: LogSet[];
};

export type WorkoutLog = {
    _id: string;
    workoutId: string;
    performedAt: string;
    notes?: string;
    exercises: LogExercise[];
};