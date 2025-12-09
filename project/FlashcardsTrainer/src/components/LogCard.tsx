import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { BASE_URL } from "../config";
import { WorkoutLog, Workout } from "./types";

type Props = WorkoutLog;

export default function LogCard({ workoutId, performedAt, notes }: Props) {
    const [workoutTitle, setWorkoutTitle] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchWorkout() {
            try {
                setError(null);
                const res = await fetch(`${BASE_URL}/api/workouts/${workoutId}`);
                if (!res.ok) {
                    throw new Error(`Failed to load workout: ${res.status}`);
                }
                const data: Workout = await res.json();
                if (!cancelled) {
                    setWorkoutTitle(data.title);
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) {
                    setError("Could not load workout name");
                }
            }
        }

        if (workoutId) {
            fetchWorkout();
        }

        return () => {
            cancelled = true;
        };
    }, [workoutId]);


    const performedLabel = new Date(performedAt).toLocaleString();

    return (
        <View style={styles.row}>
            <View style={styles.textWrap}>
                <Text style={styles.title}>
                    {workoutTitle}
                </Text>
                <Text style={styles.subtitle}>
                    Performed at: {performedLabel}
                </Text>
                {notes ? (
                    <Text style={styles.notes}>
                        Notes: {notes}
                    </Text>
                ) : null}
                {error && (
                    <Text style={styles.error}>
                        {error}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
    textWrap: {
        flexShrink: 1,
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: 17,
        fontWeight: "700",
        color: "#202020",
    },
    subtitle: {
        fontSize: 13,
        color: "#505050",
    },
    notes: {
        fontSize: 14,
        color: "#202020",
        marginTop: 4,
    },
    error: {
        fontSize: 12,
        color: "red",
        marginTop: 4,
    },
});
