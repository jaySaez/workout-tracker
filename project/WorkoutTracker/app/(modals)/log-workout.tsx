import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, StyleSheet, Pressable, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import { BASE_URL } from "../../src/config";
import { scheduleWorkoutReminder } from "../../src/notifications";
import { Workout, WorkoutLog, LogExercise } from "../../src/components/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { theme } from "../../src/theme";

type Phase = "select" | "logging" | "finished";

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CreateWorkoutLog() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
    const [phase, setPhase] = useState<Phase>("select");

    // Logging state
    const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
    const [currentSetIdx, setCurrentSetIdx] = useState(0);
    const [repsInput, setRepsInput] = useState("");
    const [weightInput, setWeightInput] = useState("");
    const [loggedExercises, setLoggedExercises] = useState<LogExercise[]>([]);
    const [previousLog, setPreviousLog] = useState<WorkoutLog | null>(null);

    // Stopwatch state
    const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
    const [stopwatchRunning, setStopwatchRunning] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        async function fetchWorkouts() {
            try {
                const res = await fetch(`${BASE_URL}/api/workouts`);
                if (!res.ok) {
                    throw new Error(`Failed to load workouts: ${res.status}`);
                }
                const data: Workout[] = await res.json();
                data.sort((a, b) => {
                    if (a.isFavorite === b.isFavorite) {
                        return a.title.localeCompare(b.title);
                    }
                    return a.isFavorite ? -1 : 1;
                });

                setWorkouts(data);
                if (data.length > 0) {
                    setSelectedWorkoutId(data[0]._id);
                }
            } catch (err) {
                console.error(err);
            }
        }

        fetchWorkouts();
    }, []);

    // Stopwatch effect
    useEffect(() => {
        if (stopwatchRunning) {
            intervalRef.current = setInterval(() => {
                setStopwatchSeconds((s) => s + 1);
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [stopwatchRunning]);

    const selectedWorkout = workouts.find((w) => w._id === selectedWorkoutId) ?? null;

    const handleStart = async () => {
        if (!selectedWorkout) return;

        // Fetch previous log for placeholder values
        try {
            const res = await fetch(`${BASE_URL}/api/workoutLogs/latest/${selectedWorkout._id}`);
            if (res.ok) {
                const data: WorkoutLog = await res.json();
                setPreviousLog(data);
            }
        } catch (err) {
            console.error(err);
        }

        // Initialize logged exercises structure
        setLoggedExercises(
            selectedWorkout.exercises.map((ex) => ({ name: ex.name, sets: [] }))
        );
        setCurrentExerciseIdx(0);
        setCurrentSetIdx(0);
        setRepsInput("");
        setWeightInput("");
        setStopwatchSeconds(0);
        setStopwatchRunning(false);
        setPhase("logging");
    };

    const getPlaceholder = (exerciseIdx: number, setIdx: number, field: "reps" | "weight"): string => {
        if (!previousLog || !previousLog.exercises) return "";
        const prevExercise = previousLog.exercises[exerciseIdx];
        if (!prevExercise || !prevExercise.sets[setIdx]) return "";
        return String(prevExercise.sets[setIdx][field]);
    };

    const handleLogSet = () => {
        if (!selectedWorkout) return;

        const exercise = selectedWorkout.exercises[currentExerciseIdx];
        const repsPlaceholder = getPlaceholder(currentExerciseIdx, currentSetIdx, "reps");
        const weightPlaceholder = getPlaceholder(currentExerciseIdx, currentSetIdx, "weight");

        const reps = repsInput.trim() ? parseInt(repsInput, 10) : (repsPlaceholder ? parseInt(repsPlaceholder, 10) : 0);
        const weight = weightInput.trim() ? parseFloat(weightInput) : (weightPlaceholder ? parseFloat(weightPlaceholder) : 0);

        if (isNaN(reps) || isNaN(weight)) return;

        // Add set to current exercise
        setLoggedExercises((prev) => {
            const updated = [...prev];
            updated[currentExerciseIdx] = {
                ...updated[currentExerciseIdx],
                sets: [...updated[currentExerciseIdx].sets, { reps, weight }],
            };
            return updated;
        });

        // Determine next set/exercise
        const isLastSetOfExercise = currentSetIdx + 1 >= exercise.sets;
        const isLastExercise = currentExerciseIdx + 1 >= selectedWorkout.exercises.length;

        if (isLastSetOfExercise && isLastExercise) {
            // All done
            setStopwatchRunning(false);
            setPhase("finished");
        } else if (isLastSetOfExercise) {
            // Move to next exercise
            setCurrentExerciseIdx((prev) => prev + 1);
            setCurrentSetIdx(0);
            // Restart stopwatch
            setStopwatchSeconds(0);
            setStopwatchRunning(true);
        } else {
            // Next set of same exercise
            setCurrentSetIdx((prev) => prev + 1);
            // Restart stopwatch
            setStopwatchSeconds(0);
            setStopwatchRunning(true);
        }

        setRepsInput("");
        setWeightInput("");
    };

    const handleFinish = async () => {
        if (!selectedWorkoutId) return;

        try {
            const res = await fetch(`${BASE_URL}/api/workoutLogs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    workoutId: selectedWorkoutId,
                    exercises: loggedExercises,
                }),
            });

            if (!res.ok) {
                throw new Error(`Failed to log workout: ${res.status}`);
            }
            await scheduleWorkoutReminder();
            router.dismiss();
        } catch (err) {
            console.error(err);
        }
    };

    // --- SELECT PHASE ---
    if (phase === "select") {
        return (
            <View style={styles.container}>
                <Text style={styles.label}>Select workout:</Text>

                <ScrollView
                    style={styles.dropdown}
                    contentContainerStyle={{ paddingVertical: 4 }}
                >
                    {workouts.map((w) => {
                        const selected = w._id === selectedWorkoutId;
                        return (
                            <Pressable
                                key={w._id}
                                onPress={() => setSelectedWorkoutId(w._id)}
                                style={[
                                    styles.option,
                                    selected && styles.optionSelected,
                                ]}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                                    {w.isFavorite && (
                                        <FontAwesome
                                            name="star"
                                            size={16}
                                            color={theme.colors.primary}
                                            style={{ marginRight: 8 }}
                                        />
                                    )}
                                    <Text
                                        style={[
                                            styles.optionText,
                                            selected && styles.optionTextSelected,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {w.title}
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })}

                    {workouts.length === 0 && (
                        <View style={{ paddingVertical: 8 }}>
                            <Text style={{ color: theme.colors.textTertiary }}>
                                No workouts found.
                            </Text>
                        </View>
                    )}
                </ScrollView>

                <Pressable
                    style={[styles.startBtn, !selectedWorkoutId && { opacity: 0.5 }]}
                    onPress={handleStart}
                    disabled={!selectedWorkoutId}
                >
                    <Text style={styles.startBtnText}>Start Workout</Text>
                </Pressable>
            </View>
        );
    }

    // --- LOGGING PHASE ---
    if (phase === "logging" && selectedWorkout) {
        const exercise = selectedWorkout.exercises[currentExerciseIdx];
        const totalSetsAll = selectedWorkout.exercises.reduce((s, e) => s + e.sets, 0);
        const completedSets = loggedExercises.reduce((s, e) => s + e.sets.length, 0);

        return (
            <View style={styles.container}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { flex: completedSets, backgroundColor: theme.colors.primary }]} />
                    <View style={{ flex: Math.max(totalSetsAll - completedSets, 0) }} />
                </View>

                <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                <Text style={styles.setInfo}>
                    Set {currentSetIdx + 1} of {exercise.sets}
                </Text>

                <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Reps</Text>
                        <TextInput
                            keyboardAppearance="dark"
                            value={repsInput}
                            onChangeText={setRepsInput}
                            placeholder={getPlaceholder(currentExerciseIdx, currentSetIdx, "reps") || "0"}
                            placeholderTextColor={theme.colors.textTertiary}
                            style={styles.numberInput}
                            keyboardType="number-pad"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Weight</Text>
                        <TextInput
                            keyboardAppearance="dark"
                            value={weightInput}
                            onChangeText={setWeightInput}
                            placeholder={getPlaceholder(currentExerciseIdx, currentSetIdx, "weight") || "0"}
                            placeholderTextColor={theme.colors.textTertiary}
                            style={styles.numberInput}
                            keyboardType="decimal-pad"
                        />
                    </View>
                </View>

                <Pressable style={styles.logSetBtn} onPress={handleLogSet}>
                    <Text style={styles.logSetBtnText}>Log Set</Text>
                </Pressable>

                {stopwatchRunning && (
                    <View style={styles.stopwatchContainer}>
                        <FontAwesome name="clock-o" size={20} color={theme.colors.primary} />
                        <Text style={styles.stopwatchText}>{formatTime(stopwatchSeconds)}</Text>
                    </View>
                )}

                <ScrollView style={styles.loggedSummary}>
                    {loggedExercises.map((ex, ei) =>
                        ex.sets.length > 0 ? (
                            <View key={ei} style={styles.loggedExercise}>
                                <Text style={styles.loggedExerciseName}>{ex.name}</Text>
                                {ex.sets.map((s, si) => (
                                    <Text key={si} style={styles.loggedSetText}>
                                        Set {si + 1}: {s.reps} reps × {s.weight} lbs
                                    </Text>
                                ))}
                            </View>
                        ) : null
                    )}
                </ScrollView>
            </View>
        );
    }

    // --- FINISHED PHASE ---
    return (
        <View style={styles.container}>
            <Text style={styles.finishedTitle}>Workout Complete! 🎉</Text>

            <ScrollView style={styles.loggedSummary}>
                {loggedExercises.map((ex, ei) => (
                    <View key={ei} style={styles.loggedExercise}>
                        <Text style={styles.loggedExerciseName}>{ex.name}</Text>
                        {ex.sets.map((s, si) => (
                            <Text key={si} style={styles.loggedSetText}>
                                Set {si + 1}: {s.reps} reps × {s.weight} lbs
                            </Text>
                        ))}
                    </View>
                ))}
            </ScrollView>

            <Pressable style={styles.finishBtn} onPress={handleFinish}>
                <Text style={styles.finishBtnText}>Finish & Save</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    label: {
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 4,
        fontSize: 14,
        fontWeight: "500",
        color: theme.colors.textSecondary,
    },
    dropdown: {
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        marginHorizontal: 16,
        maxHeight: 190,
    },
    option: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    optionSelected: {
        backgroundColor: theme.colors.surfaceElevated,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary,
    },
    optionText: {
        fontSize: 16,
        color: theme.colors.text,
    },
    optionTextSelected: {
        fontWeight: "600",
        color: theme.colors.primary,
    },
    startBtn: {
        alignItems: "center",
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        marginHorizontal: 16,
        marginTop: 16,
    },
    startBtnText: {
        color: theme.colors.text,
        fontWeight: "600",
        fontSize: 16,
    },
    // --- Logging phase ---
    progressBar: {
        flexDirection: "row",
        height: 4,
        backgroundColor: theme.colors.border,
    },
    progressFill: {
        height: 4,
    },
    exerciseTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: theme.colors.text,
        textAlign: "center",
        marginTop: 20,
    },
    setInfo: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: "center",
        marginTop: 4,
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginHorizontal: 16,
    },
    inputGroup: {
        alignItems: "center",
        flex: 1,
        marginHorizontal: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    numberInput: {
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 20,
        fontWeight: "600",
        color: theme.colors.text,
        textAlign: "center",
        width: "100%",
    },
    logSetBtn: {
        alignItems: "center",
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        marginHorizontal: 32,
        marginTop: 16,
    },
    logSetBtnText: {
        color: theme.colors.text,
        fontWeight: "600",
        fontSize: 16,
    },
    stopwatchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
        gap: 8,
    },
    stopwatchText: {
        fontSize: 28,
        fontWeight: "700",
        color: theme.colors.primary,
    },
    loggedSummary: {
        marginTop: 16,
        marginHorizontal: 16,
        flex: 1,
    },
    loggedExercise: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.sm,
        borderColor: theme.colors.border,
        borderWidth: 1,
        padding: 12,
        marginBottom: 8,
    },
    loggedExerciseName: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.colors.text,
        marginBottom: 4,
    },
    loggedSetText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    // --- Finished phase ---
    finishedTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: theme.colors.primary,
        textAlign: "center",
        marginTop: 24,
        marginBottom: 8,
    },
    finishBtn: {
        alignItems: "center",
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        marginHorizontal: 16,
        marginBottom: 20,
    },
    finishBtnText: {
        color: theme.colors.text,
        fontWeight: "600",
        fontSize: 16,
    },
});
