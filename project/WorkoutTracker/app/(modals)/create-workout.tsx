import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable, Text, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { BASE_URL } from "../../src/config";
import { theme } from "../../src/theme";

type ExerciseInput = { name: string; sets: string; reps: string };

export default function CreateWorkout() {
    const [title, setTitle] = useState("");
    const [exercises, setExercises] = useState<ExerciseInput[]>([]);
    const [exerciseName, setExerciseName] = useState("");
    const [exerciseSets, setExerciseSets] = useState("");
    const [exerciseReps, setExerciseReps] = useState("");

    const addExercise = () => {
        const name = exerciseName.trim();
        const sets = parseInt(exerciseSets, 10);
        const reps = parseInt(exerciseReps, 10);
        if (!name || isNaN(sets) || sets < 1 || isNaN(reps) || reps < 1) return;

        setExercises((prev) => [...prev, { name, sets: exerciseSets, reps: exerciseReps }]);
        setExerciseName("");
        setExerciseSets("");
        setExerciseReps("");
    };

    const removeExercise = (index: number) => {
        setExercises((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        const t = title.trim();
        if (!t || exercises.length === 0) return;

        try {
            const res = await fetch(`${BASE_URL}/api/workouts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: t,
                    exercises: exercises.map((e) => ({
                        name: e.name,
                        sets: parseInt(e.sets, 10),
                        reps: parseInt(e.reps, 10),
                    })),
                }),
            });

            if (!res.ok) {
                throw new Error(`Failed to create workout: ${res.status}`);
            }

            router.dismiss();
        } catch (err) {
            console.error(err);
        }
    };

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

            <Text style={styles.sectionLabel}>Add Exercise</Text>
            <TextInput
                keyboardAppearance="dark"
                value={exerciseName}
                onChangeText={setExerciseName}
                placeholder="Exercise name (e.g. Bench Press)"
                placeholderTextColor={theme.colors.textTertiary}
                style={styles.input}
            />
            <View style={styles.row}>
                <TextInput
                    keyboardAppearance="dark"
                    value={exerciseSets}
                    onChangeText={setExerciseSets}
                    placeholder="Sets"
                    placeholderTextColor={theme.colors.textTertiary}
                    style={[styles.input, styles.halfInput]}
                    keyboardType="number-pad"
                />
                <TextInput
                    keyboardAppearance="dark"
                    value={exerciseReps}
                    onChangeText={setExerciseReps}
                    placeholder="Reps"
                    placeholderTextColor={theme.colors.textTertiary}
                    style={[styles.input, styles.halfInput]}
                    keyboardType="number-pad"
                />
            </View>
            <Pressable style={styles.addBtn} onPress={addExercise}>
                <Text style={styles.addBtnText}>+ Add Exercise</Text>
            </Pressable>

            {exercises.length > 0 && (
                <>
                    <Text style={styles.sectionLabel}>Exercises</Text>
                    <FlatList
                        data={exercises}
                        keyExtractor={(_, i) => i.toString()}
                        style={styles.list}
                        renderItem={({ item, index }) => (
                            <Pressable onLongPress={() => removeExercise(index)} delayLongPress={500}>
                                <View style={styles.exerciseRow}>
                                    <Text style={styles.exerciseText}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.exerciseDetail}>
                                        {item.sets} × {item.reps}
                                    </Text>
                                </View>
                            </Pressable>
                        )}
                    />
                </>
            )}

            <Pressable
                style={[styles.save, (!title.trim() || exercises.length === 0) && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={!title.trim() || exercises.length === 0}
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
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 8,
    },
    halfInput: {
        flex: 1,
        marginHorizontal: 8,
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
