import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Workout } from "./types";
import { BASE_URL } from "../config";

type WorkoutLog = {
    _id: string;
    workoutId: string;
    performedAt: string;
    notes?: string;
};

type Props = Workout;

export default function WorkoutDetails({ _id, title, exercises }: Props) {
    const [logs, setLogs] = useState<WorkoutLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchLogs() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(
                    `${BASE_URL}/api/workoutLogs?workoutId=${_id}`
                );

                if (!res.ok) {
                    throw new Error("Failed to load workout logs");
                }

                const data: WorkoutLog[] = await res.json();
                if (!cancelled) {
                    setLogs(data);
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) {
                    setError("Could not load workout history");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchLogs();
        return () => {
            cancelled = true;
        };
    }, [_id]);

    const count = logs.length;

    let lastPerformedDisplay = "Never completed";
    if (count > 0) {
        const latest = logs.reduce((latestSoFar, log) => {
            const currentTime = new Date(log.performedAt).getTime();
            const latestTime = new Date(latestSoFar.performedAt).getTime();
            return currentTime > latestTime ? log : latestSoFar;
        }, logs[0]);

        lastPerformedDisplay = new Date(latest.performedAt).toLocaleString();
    }

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>

            <Text style={styles.exercises}>{exercises}</Text>

            <View style={styles.divider} />

            {loading ? (
                <ActivityIndicator />
            ) : error ? (
                <Text style={styles.error}>{error}</Text>
            ) : (
                <View style={styles.statsRow}>
                    <Text style={styles.statText}>
                        Completed: <Text style={styles.statValue}>{count}</Text>
                    </Text>
                    <Text style={styles.statText}>
                        Last completed:{" "}
                        <Text style={styles.statValue}>{lastPerformedDisplay}</Text>
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#ffffff",
        width: "90%",
        borderRadius: 16,
        borderColor: "#f6f6f6",
        borderWidth: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginHorizontal: "5%",
        marginVertical: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#202020",
        marginBottom: 8,
    },
    exercises: {
        fontSize: 16,
        color: "#202020",
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: "#f0f0f0",
        marginVertical: 10,
    },
    statsRow: {
        gap: 4,
    },
    statText: {
        fontSize: 14,
        color: "#505050",
    },
    statValue: {
        fontWeight: "600",
        color: "#202020",
    },
    error: {
        color: "red",
        fontSize: 14,
    },
});
