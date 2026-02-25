import { Pressable, FlatList, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Link, useFocusEffect } from "expo-router";
import WorkoutDetails from "../../../../src/components/WorkoutDetails";
import { useState, useCallback } from "react";
import { BASE_URL } from "../../../../src/config";
import { WorkoutLog, Workout } from "../../../../src/components/types";
import { theme } from "../../../../src/theme";

export default function WorkoutDetailPage() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [workout, setWorkout] = useState<Workout | null>(null);
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            if (!id) return;

            let cancelled = false;

            async function fetchData() {
                try {
                    setLoading(true);
                    const [workoutRes, logsRes] = await Promise.all([
                        fetch(`${BASE_URL}/api/workouts/${id}`),
                        fetch(`${BASE_URL}/api/workoutLogs/${id}`),
                    ]);

                    if (!workoutRes.ok) {
                        throw new Error(`Failed to load workout: ${workoutRes.status}`);
                    }
                    if (!logsRes.ok) {
                        throw new Error(`Failed to load workout logs: ${logsRes.status}`);
                    }

                    const workoutData: Workout = await workoutRes.json();
                    const logsData: WorkoutLog[] = await logsRes.json();

                    if (!cancelled) {
                        setWorkout(workoutData);
                        setWorkoutLogs(logsData);
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    if (!cancelled) {
                        setLoading(false);
                    }
                }
            }

            fetchData();

            return () => {
                cancelled = true;
            };
        }, [id])
    );

    const completedCount = workoutLogs.length;

    let lastPerformedDisplay = "Never completed";
    if (completedCount > 0) {
        const latestLog = workoutLogs.reduce((latest, log) => {
            const currTime = new Date(log.performedAt).getTime();
            const latestTime = new Date(latest.performedAt).getTime();
            return currTime > latestTime ? log : latest;
        }, workoutLogs[0]);

        lastPerformedDisplay = new Date(latestLog.performedAt).toLocaleString();
    }

    return (
        <View style={styles.container}>
            {workout ? (
                <>
                    <View style={{ marginTop: 8, alignItems: "center" }}>
                        <WorkoutDetails
                            _id={workout._id}
                            title={workout.title}
                            exercises={workout.exercises}
                            isFavorite={workout.isFavorite}
                            createdAt={workout.createdAt}
                        />
                    </View>
                    <Link
                        href={{ pathname: "/(modals)/edit-workout", params: { id: workout._id } }}
                        asChild
                    >
                        <Pressable style={styles.editBtn}>
                            <Text style={styles.editBtnText}>Edit Workout</Text>
                        </Pressable>
                    </Link>
                    <View>
                        <Text style={styles.statsTitle}>Workout History</Text>
                    </View>
                </>
            ) : loading ? (
                <View style={{ marginTop: 20 }}>
                    <ActivityIndicator color={theme.colors.primary} />
                </View>
            ) : (
                <View style={{ marginTop: 20, alignItems: "center" }}>
                    <Text style={styles.errorText}>Workout not found.</Text>
                </View>
            )}

            <FlatList
                style={{ marginTop: 8, height: "100%" }}
                data={workoutLogs}
                keyExtractor={(log) => log._id}
                renderItem={({ item }) => (
                    <View style={styles.logRow}>
                        <Text style={styles.logDate}>
                            {new Date(item.performedAt).toLocaleString()}
                        </Text>
                        {item.exercises && item.exercises.length > 0 && item.exercises.map((ex, ei) => (
                            <View key={ei} style={styles.logExerciseBlock}>
                                <Text style={styles.logExerciseName}>{ex.name}</Text>
                                {ex.sets.map((s, si) => (
                                    <Text key={si} style={styles.logSetText}>
                                        {s.skipped
                                            ? `Set ${si + 1}: X (skipped)`
                                            : `Set ${si + 1}: ${s.reps} reps × ${s.weight} lbs`}
                                    </Text>
                                ))}
                            </View>
                        ))}
                        {item.notes ? (
                            <Text style={styles.logNotes}>{item.notes}</Text>
                        ) : null}
                    </View>
                )}

            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    statsTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: theme.colors.text,
        paddingVertical: 10,
        paddingBottom: 0,
        paddingHorizontal: 10,
        marginHorizontal: "5%",
    },
    editBtn: {
        alignItems: "center",
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        borderColor: theme.colors.primaryDark,
        backgroundColor: theme.colors.surfaceElevated,
        paddingVertical: 10,
        marginHorizontal: "5%",
        marginTop: 8,
    },
    editBtnText: {
        color: theme.colors.primary,
        fontWeight: "600",
        fontSize: 15,
    },
    statsValue: {
        fontWeight: "600",
        color: theme.colors.primary,
    },
    logRow: {
        backgroundColor: theme.colors.surface,
        width: "90%",
        borderRadius: theme.borderRadius.md,
        borderColor: theme.colors.border,
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginHorizontal: "5%",
        marginVertical: 4,
    },
    logDate: {
        fontSize: 14,
        fontWeight: "600",
        color: theme.colors.text,
    },
    logNotes: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    logExerciseBlock: {
        marginTop: 6,
    },
    logExerciseName: {
        fontSize: 14,
        fontWeight: "600",
        color: theme.colors.text,
    },
    logSetText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginLeft: 8,
    },
    errorText: {
        color: theme.colors.text,
    },
});
