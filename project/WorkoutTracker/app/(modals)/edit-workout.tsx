import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Pressable, Text, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BASE_URL } from "../../src/config";
import { theme } from "../../src/theme";
import { Workout, WorkoutExercise } from "../../src/components/types";

type ExerciseInput = { name: string; sets: string };

export default function EditWorkout() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [existingExercises, setExistingExercises] = useState<WorkoutExercise[]>([]);
    const [exercises, setExercises] = useState<ExerciseInput[]>([]);
    const [exerciseName, setExerciseName] = useState("");
    const [exerciseSets, setExerciseSets] = useState("");

    useEffect(() => {
        if (!id) return;
        async function fetchWorkout() {
            try {
                const res = await fetch(`${BASE_URL}/api/workouts/${id}`);
                if (!res.ok) throw new Error("Failed to load workout");
                const data: Workout = await res.json();
                setTitle(data.title);
                setExistingExercises(data.exercises);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchWorkout();
    }, [id]);

    const addExercise = () => {
        const name = exerciseName.trim();
        const sets = parseInt(exerciseSets, 10);
        if (!name || isNaN(sets) || sets < 1) return;

        setExercises((prev) => [...prev, { name, sets: exerciseSets }]);
        setExerciseName("");
        setExerciseSets("");
    };

    const removeNewExercise = (index: number) => {
        setExercises((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingExercise = (index: number) => {
        setExistingExercises((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!id) return;
        const allExercises = [
            ...existingExercises.map((e) => ({
                name: e.name,
                sets: e.sets,
                ...(e.reps != null ? { reps: e.reps } : {}),
            })),
            ...exercises.map((e) => ({
                name: e.name,
                sets: parseInt(e.sets, 10),
            })),
        ];

        if (allExercises.length === 0) return;

        try {
            const res = await fetch(`${BASE_URL}/api/workouts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    exercises: allExercises,
                }),
            });

            if (!res.ok) {
                throw new Error(`Failed to update workout: ${res.status}`);
            }

            router.dismiss();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator color={theme.colors.primary} />
            </View>
        );
    }

    const totalExercises = existingExercises.length + exercises.length;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <TextInput
                keyboardAppearance="dark"
                value={title}
                onChangeText={setTitle}
                placeholder="Workout name"
                placeholderTextColor={theme.colors.textTertiary}
                style={styles.titleInput}
            />

            {existingExercises.length > 0 && (
                <>
                    <Text style={styles.sectionLabel}>Current Exercises</Text>
                    <FlatList
                        data={existingExercises}
                        keyExtractor={(_, i) => `existing-${i}`}
                        style={styles.list}
                        scrollEnabled={false}
                        renderItem={({ item, index }) => (
                            <Pressable onLongPress={() => removeExistingExercise(index)} delayLongPress={500}>
                                <View style={styles.exerciseRow}>
                                    <Text style={styles.exerciseText}>{item.name}</Text>
                                    <Text style={styles.exerciseDetail}>
                                        {item.sets} sets
                                    </Text>
                                </View>
                            </Pressable>
                        )}
                    />
                </>
            )}

            {exercises.length > 0 && (
                <>
                    <Text style={styles.sectionLabel}>New Exercises</Text>
                    <FlatList
                        data={exercises}
                        keyExtractor={(_, i) => `new-${i}`}
                        style={styles.list}
                        scrollEnabled={false}
                        renderItem={({ item, index }) => (
                            <Pressable onLongPress={() => removeNewExercise(index)} delayLongPress={500}>
                                <View style={styles.exerciseRow}>
                                    <Text style={styles.exerciseText}>{item.name}</Text>
                                    <Text style={styles.exerciseDetail}>
                                        {item.sets} sets
                                    </Text>
                                </View>
                            </Pressable>
                        )}
                    />
                </>
            )}

            <Text style={styles.sectionLabel}>Add Exercise</Text>
            <TextInput
                keyboardAppearance="dark"
                value={exerciseName}
                onChangeText={setExerciseName}
                placeholder="Exercise name (e.g. Bench Press)"
                placeholderTextColor={theme.colors.textTertiary}
                style={styles.input}
            />
            <TextInput
                keyboardAppearance="dark"
                value={exerciseSets}
                onChangeText={setExerciseSets}
                placeholder="Number of sets"
                placeholderTextColor={theme.colors.textTertiary}
                style={styles.input}
                keyboardType="number-pad"
            />
            <Pressable style={styles.addBtn} onPress={addExercise}>
                <Text style={styles.addBtnText}>+ Add Exercise</Text>
            </Pressable>

            <Pressable
                style={[styles.save, (!title.trim() || totalExercises === 0) && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={!title.trim() || totalExercises === 0}
            >
                <Text style={styles.saveText}>Save</Text>
            </Pressable>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    titleInput: {
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginHorizontal: 16,
        marginVertical: 10,
        fontSize: 16,
        fontWeight: "600",
        color: theme.colors.text,
    },
    sectionLabel: {
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
        fontSize: 14,
        fontWeight: "500",
        color: theme.colors.textSecondary,
    },
    input: {
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginVertical: 4,
        fontSize: 16,
        color: theme.colors.text,
    },
    addBtn: {
        alignItems: "center",
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        borderColor: theme.colors.primaryDark,
        backgroundColor: theme.colors.surfaceElevated,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginTop: 8,
    },
    addBtnText: {
        color: theme.colors.primary,
        fontWeight: "600",
    },
    list: {
        maxHeight: 200,
        marginHorizontal: 16,
    },
    exerciseRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.sm,
        borderColor: theme.colors.border,
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginVertical: 2,
    },
    exerciseText: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.colors.text,
    },
    exerciseDetail: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    save: {
        alignItems: "center",
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 10,
    },
    saveText: {
        color: theme.colors.text,
        fontWeight: "600",
    },
});
