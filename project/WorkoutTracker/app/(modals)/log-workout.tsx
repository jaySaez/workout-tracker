import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, StyleSheet, Pressable, Text, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { BASE_URL } from "../../src/config";
import { scheduleWorkoutReminder } from "../../src/notifications";
import { Workout, WorkoutLog, LogExercise, LogSet } from "../../src/components/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { theme } from "../../src/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Phase = "select" | "logging" | "finished";

const STORAGE_KEY = "IN_PROGRESS_WORKOUT";

type InProgressState = {
    selectedWorkoutId: string;
    currentExerciseIdx: number;
    currentSetIdx: number;
    loggedExercises: LogExercise[];
};

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CreateWorkoutLog() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
    const [phase, setPhase] = useState<Phase>("select");
    const [savedProgress, setSavedProgress] = useState<InProgressState | null>(null);

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

                // Check for saved in-progress workout
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed: InProgressState = JSON.parse(saved);
                    // Verify the workout still exists
                    if (data.find((w) => w._id === parsed.selectedWorkoutId)) {
                        setSavedProgress(parsed);
                    } else {
                        await AsyncStorage.removeItem(STORAGE_KEY);
                    }
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

    const saveProgress = async (
        workoutId: string,
        exerciseIdx: number,
        setIdx: number,
        exercises: LogExercise[]
    ) => {
        const state: InProgressState = {
            selectedWorkoutId: workoutId,
            currentExerciseIdx: exerciseIdx,
            currentSetIdx: setIdx,
            loggedExercises: exercises,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    };

    const clearProgress = async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setSavedProgress(null);
    };

    const handleResume = async () => {
        if (!savedProgress) return;

        const workout = workouts.find((w) => w._id === savedProgress.selectedWorkoutId);
        if (!workout) return;

        setSelectedWorkoutId(savedProgress.selectedWorkoutId);

        // Fetch previous log
        try {
            const res = await fetch(`${BASE_URL}/api/workoutLogs/latest/${savedProgress.selectedWorkoutId}`);
            if (res.ok) {
                const data: WorkoutLog = await res.json();
                setPreviousLog(data);
            }
        } catch (err) {
            console.error(err);
        }

        setLoggedExercises(savedProgress.loggedExercises);
        setCurrentExerciseIdx(savedProgress.currentExerciseIdx);
        setCurrentSetIdx(savedProgress.currentSetIdx);
        setRepsInput("");
        setWeightInput("");
        setStopwatchSeconds(0);
        setStopwatchRunning(false);
        setPhase("logging");
    };

    const handleStart = async () => {
        if (!selectedWorkout) return;

        // Clear any saved progress when starting fresh
        await clearProgress();

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
        const val = prevExercise.sets[setIdx][field];
        return val != null ? String(val) : "";
    };

    const advanceToNext = (newLoggedExercises: LogExercise[], nextExerciseIdx: number, nextSetIdx: number) => {
        if (!selectedWorkout) return;

        const exercise = selectedWorkout.exercises[nextExerciseIdx];
        if (!exercise) return;

        const isLastSetOfExercise = nextSetIdx >= exercise.sets;
        const isLastExercise = nextExerciseIdx + 1 >= selectedWorkout.exercises.length;

        if (isLastSetOfExercise && isLastExercise) {
            setStopwatchRunning(false);
            clearProgress();
            setPhase("finished");
        } else if (isLastSetOfExercise) {
            const newExIdx = nextExerciseIdx + 1;
            setCurrentExerciseIdx(newExIdx);
            setCurrentSetIdx(0);
            setStopwatchSeconds(0);
            setStopwatchRunning(true);
            saveProgress(selectedWorkout._id, newExIdx, 0, newLoggedExercises);
        } else {
            setCurrentExerciseIdx(nextExerciseIdx);
            setCurrentSetIdx(nextSetIdx);
            setStopwatchSeconds(0);
            setStopwatchRunning(true);
            saveProgress(selectedWorkout._id, nextExerciseIdx, nextSetIdx, newLoggedExercises);
        }

        setRepsInput("");
        setWeightInput("");
    };

    const handleLogSet = () => {
        if (!selectedWorkout) return;

        const repsPlaceholder = getPlaceholder(currentExerciseIdx, currentSetIdx, "reps");
        const weightPlaceholder = getPlaceholder(currentExerciseIdx, currentSetIdx, "weight");

        const reps = repsInput.trim() ? parseInt(repsInput, 10) : (repsPlaceholder ? parseInt(repsPlaceholder, 10) : 0);
        const weight = weightInput.trim() ? parseFloat(weightInput) : (weightPlaceholder ? parseFloat(weightPlaceholder) : 0);

        if (isNaN(reps) || isNaN(weight)) return;

        const newSet: LogSet = { reps, weight, skipped: false };

        let newLoggedExercises: LogExercise[];
        setLoggedExercises((prev) => {
            const updated = [...prev];
            const existingSets = [...updated[currentExerciseIdx].sets];
            if (currentSetIdx < existingSets.length) {
                // Editing an existing set (went back)
                existingSets[currentSetIdx] = newSet;
            } else {
                existingSets.push(newSet);
            }
            updated[currentExerciseIdx] = {
                ...updated[currentExerciseIdx],
                sets: existingSets,
            };
            newLoggedExercises = updated;
            return updated;
        });

        // Use setTimeout to ensure state is updated before advancing
        setTimeout(() => {
            advanceToNext(newLoggedExercises!, currentExerciseIdx, currentSetIdx + 1);
        }, 0);
    };

    const handleSkipSet = () => {
        if (!selectedWorkout) return;

        const newSet: LogSet = { reps: 0, weight: 0, skipped: true };

        let newLoggedExercises: LogExercise[];
        setLoggedExercises((prev) => {
            const updated = [...prev];
            const existingSets = [...updated[currentExerciseIdx].sets];
            if (currentSetIdx < existingSets.length) {
                existingSets[currentSetIdx] = newSet;
            } else {
                existingSets.push(newSet);
            }
            updated[currentExerciseIdx] = {
                ...updated[currentExerciseIdx],
                sets: existingSets,
            };
            newLoggedExercises = updated;
            return updated;
        });

        setTimeout(() => {
            advanceToNext(newLoggedExercises!, currentExerciseIdx, currentSetIdx + 1);
        }, 0);
    };

    const handleGoBack = () => {
        if (!selectedWorkout) return;

        if (currentSetIdx > 0) {
            // Go back to previous set of same exercise
            const prevSetIdx = currentSetIdx - 1;
            setCurrentSetIdx(prevSetIdx);
            const prevSet = loggedExercises[currentExerciseIdx]?.sets[prevSetIdx];
            if (prevSet && !prevSet.skipped) {
                setRepsInput(prevSet.reps != null ? String(prevSet.reps) : "");
                setWeightInput(prevSet.weight != null ? String(prevSet.weight) : "");
            } else {
                setRepsInput("");
                setWeightInput("");
            }
        } else if (currentExerciseIdx > 0) {
            // Go back to last set of previous exercise
            const prevExIdx = currentExerciseIdx - 1;
            const prevExercise = selectedWorkout.exercises[prevExIdx];
            const prevSetIdx = prevExercise.sets - 1;
            setCurrentExerciseIdx(prevExIdx);
            setCurrentSetIdx(prevSetIdx);
            const prevSet = loggedExercises[prevExIdx]?.sets[prevSetIdx];
            if (prevSet && !prevSet.skipped) {
                setRepsInput(prevSet.reps != null ? String(prevSet.reps) : "");
                setWeightInput(prevSet.weight != null ? String(prevSet.weight) : "");
            } else {
                setRepsInput("");
                setWeightInput("");
            }
        }

        setStopwatchRunning(false);
        setStopwatchSeconds(0);
    };

    const handleExitWorkout = async () => {
        if (!selectedWorkout) return;

        await saveProgress(selectedWorkout._id, currentExerciseIdx, currentSetIdx, loggedExercises);
        setStopwatchRunning(false);
        router.dismiss();
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
            await clearProgress();
            await scheduleWorkoutReminder();
            router.dismiss();
        } catch (err) {
            console.error(err);
        }
    };

    const canGoBack = currentExerciseIdx > 0 || currentSetIdx > 0;

    // --- SELECT PHASE ---
    if (phase === "select") {
        return (
            <View style={styles.container}>
                {savedProgress && (
                    <View style={styles.resumeBanner}>
                        <Text style={styles.resumeText}>
                            You have an in-progress workout.
                        </Text>
                        <View style={styles.resumeActions}>
                            <Pressable style={styles.resumeBtn} onPress={handleResume}>
                                <Text style={styles.resumeBtnText}>Resume</Text>
                            </Pressable>
                            <Pressable style={styles.discardBtn} onPress={clearProgress}>
                                <Text style={styles.discardBtnText}>Discard</Text>
                            </Pressable>
                        </View>
                    </View>
                )}

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

        // Determine next exercise
        const isLastSetOfExercise = currentSetIdx + 1 >= exercise.sets;
        const isLastExercise = currentExerciseIdx + 1 >= selectedWorkout.exercises.length;
        const nextExerciseName = (!isLastExercise && isLastSetOfExercise)
            ? selectedWorkout.exercises[currentExerciseIdx + 1].name
            : null;

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

                {nextExerciseName && (
                    <Text style={styles.nextExercise}>
                        Next: {nextExerciseName}
                    </Text>
                )}

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

                <View style={styles.actionRow}>
                    <Pressable
                        style={[styles.secondaryBtn, !canGoBack && { opacity: 0.3 }]}
                        onPress={handleGoBack}
                        disabled={!canGoBack}
                    >
                        <FontAwesome name="arrow-left" size={14} color={theme.colors.primary} />
                        <Text style={styles.secondaryBtnText}>Back</Text>
                    </Pressable>
                    <Pressable style={styles.skipBtn} onPress={handleSkipSet}>
                        <Text style={styles.skipBtnText}>Skip Set</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryBtn} onPress={handleExitWorkout}>
                        <FontAwesome name="sign-out" size={14} color={theme.colors.primary} />
                        <Text style={styles.secondaryBtnText}>Exit</Text>
                    </Pressable>
                </View>

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
                                        {s.skipped
                                            ? `Set ${si + 1}: X (skipped)`
                                            : `Set ${si + 1}: ${s.reps} reps × ${s.weight} lbs`}
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
                                {s.skipped
                                    ? `Set ${si + 1}: X (skipped)`
                                    : `Set ${si + 1}: ${s.reps} reps × ${s.weight} lbs`}
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
    // --- Resume banner ---
    resumeBanner: {
        backgroundColor: theme.colors.surfaceElevated,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    resumeText: {
        color: theme.colors.text,
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 8,
    },
    resumeActions: {
        flexDirection: "row",
        gap: 10,
    },
    resumeBtn: {
        flex: 1,
        alignItems: "center",
        borderRadius: theme.borderRadius.sm,
        backgroundColor: theme.colors.primary,
        paddingVertical: 10,
    },
    resumeBtnText: {
        color: theme.colors.text,
        fontWeight: "600",
    },
    discardBtn: {
        flex: 1,
        alignItems: "center",
        borderRadius: theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingVertical: 10,
    },
    discardBtnText: {
        color: theme.colors.textSecondary,
        fontWeight: "600",
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
        marginBottom: 4,
    },
    nextExercise: {
        fontSize: 14,
        color: theme.colors.textTertiary,
        textAlign: "center",
        marginBottom: 12,
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
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginHorizontal: 16,
        marginTop: 10,
        gap: 8,
    },
    secondaryBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        borderWidth: 1,
        borderRadius: theme.borderRadius.sm,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    secondaryBtnText: {
        color: theme.colors.primary,
        fontWeight: "600",
        fontSize: 14,
    },
    skipBtn: {
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderRadius: theme.borderRadius.sm,
        borderColor: theme.colors.warning,
        backgroundColor: theme.colors.surface,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    skipBtnText: {
        color: theme.colors.warning,
        fontWeight: "600",
        fontSize: 14,
    },
    stopwatchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
        gap: 8,
    },
    stopwatchText: {
        fontSize: 28,
        fontWeight: "700",
        color: theme.colors.primary,
    },
    loggedSummary: {
        marginTop: 12,
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
