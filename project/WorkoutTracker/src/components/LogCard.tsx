import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { BASE_URL } from "../config";
import { WorkoutLog, Workout } from "./types";
import { theme } from "../theme";

type Props = WorkoutLog & {
    onDeleted?: (id: string) => void;
};

export default function LogCard({ _id, workoutId, performedAt, notes, onDeleted }: Props) {
    const [workoutTitle, setWorkoutTitle] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        async function fetchWorkout() {
            try {
                setError(null);
                const res = await fetch(`${BASE_URL}/api/workouts/${workoutId}`);
                if (!res.ok) {
                    throw new Error(`Failed to load workout: ${res.status}`);
                }
                const data: Workout = await res.json();
                setWorkoutTitle(data.title);
            } catch (err) {
                console.error(err);
            }
        }

        if (workoutId) {
            fetchWorkout();
        }
    }, [workoutId]);

    async function handleLongPress() {
        if (deleting || !_id) return;
        try {
            setDeleting(true);
            setError(null);

            const res = await fetch(`${BASE_URL}/api/workoutLogs/${_id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error(`Failed to delete log: ${res.status}`);
            }

            if (onDeleted) {
                onDeleted(_id);
            }
        } catch (err) {
            console.error(err);
            setError("Could not delete log");
            setDeleting(false);
        }
    }

    const performedLabel = new Date(performedAt).toLocaleString();

    return (
        <Pressable onLongPress={handleLongPress} disabled={deleting}>
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
        </Pressable>

    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.colors.surface,
        width: "90%",
        borderRadius: theme.borderRadius.lg,
        borderColor: theme.colors.border,
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
        color: theme.colors.text,
    },
    subtitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    notes: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    error: {
        fontSize: 12,
        color: theme.colors.error,
        marginTop: 4,
    },
});
