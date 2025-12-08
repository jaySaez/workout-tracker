import { Pressable, FlatList, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Link, useFocusEffect } from "expo-router";
import CardRow from "../../../../src/components/CardRow";
import { useState, useCallback } from "react";
import { BASE_URL } from "../../../../src/config";
import { WorkoutLog, Workout } from "../../../../src/components/types";

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

                    // Fetch workout details + logs in parallel
                    const [workoutRes, logsRes] = await Promise.all([
                        fetch(`${BASE_URL}/api/workouts/${id}`),
                        fetch(`${BASE_URL}/api/workoutLogs/${id}`), // adjust if your route differs
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
        <View style={{ flex: 1 }}>
            {workout ? (
                <>
                    {/* Workout card with favorite star + exercises */}
                    <View style={{ marginTop: 8, alignItems: "center" }}>
                        <CardRow
                            _id={workout._id}
                            title={workout.title}
                            exercises={workout.exercises}
                            isFavorite={workout.isFavorite}
                            createdAt={workout.createdAt}
                        />
                    </View>

                    {/* Stats about completions */}
                    <View style={styles.statsCard}>
                        <Text style={styles.statsTitle}>Workout History</Text>
                        <Text style={styles.statsText}>
                            Completed: <Text style={styles.statsValue}>{completedCount}</Text>
                        </Text>
                        <Text style={styles.statsText}>
                            Last completed:{" "}
                            <Text style={styles.statsValue}>{lastPerformedDisplay}</Text>
                        </Text>
                    </View>
                </>
            ) : loading ? (
                <View style={{ marginTop: 20 }}>
                    <ActivityIndicator />
                </View>
            ) : (
                <View style={{ marginTop: 20, alignItems: "center" }}>
                    <Text>Workout not found.</Text>
                </View>
            )}

            {/* List of individual logs */}
            <FlatList
                style={{ marginTop: 8, height: "100%" }}
                data={workoutLogs}
                keyExtractor={(log) => log._id}
                renderItem={({ item }) => (
                    <View style={styles.logRow}>
                        <Text style={styles.logDate}>
                            {new Date(item.performedAt).toLocaleString()}
                        </Text>
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
    statsCard: {
        backgroundColor: "#ffffff",
        width: "90%",
        borderRadius: 16,
        borderColor: "#f6f6f6",
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: "5%",
        marginTop: 8,
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#202020",
        marginBottom: 4,
    },
    statsText: {
        fontSize: 14,
        color: "#505050",
        marginTop: 2,
    },
    statsValue: {
        fontWeight: "600",
        color: "#202020",
    },
    logRow: {
        backgroundColor: "#ffffff",
        width: "90%",
        borderRadius: 12,
        borderColor: "#f6f6f6",
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginHorizontal: "5%",
        marginVertical: 4,
    },
    logDate: {
        fontSize: 14,
        fontWeight: "600",
        color: "#202020",
    },
    logNotes: {
        fontSize: 14,
        color: "#404040",
        marginTop: 4,
    },
    add: {
        position: "absolute",
        bottom: 30,
        right: 20,
        width: 80,
        height: 80,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderRadius: 40, // half of width/height
        borderColor: "#f6f6f6",
        backgroundColor: "black",
    },
    addText: {
        color: "white",
        fontWeight: "600",
        fontSize: 32,
        marginTop: -2,
    },
});
