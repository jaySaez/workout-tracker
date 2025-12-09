import { FlatList, View, Text, Pressable, StyleSheet } from "react-native";
import { useState, useCallback } from "react";
import { Link, useFocusEffect } from "expo-router";
import { WorkoutLog } from "../../../src/components/types";
import LogCard from "../../../src/components/LogCard"
import { BASE_URL } from "../../../src/config";
import { theme } from "../../../src/theme";



export default function Home() {
    const [logs, setLogs] = useState<WorkoutLog[]>([]);

    useFocusEffect(useCallback(() => {
        async function fetchWorkoutLogs() {
            try {
                const res = await fetch(`${BASE_URL}/api/workoutLogs`);
                if (!res.ok) {
                    throw new Error(`Failed to load workout log: ${res.status}`);
                }
                const data: WorkoutLog[] = await res.json();
                data.sort(
                    (a, b) =>
                        new Date(b.performedAt).getTime() -
                        new Date(a.performedAt).getTime()
                );
                setLogs(data);
            } catch (err) {
                console.error(err);
            }
        }

        fetchWorkoutLogs();
    }, []));

    if (logs.length == 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No workouts logged!</Text>
                <Link href="/(modals)/log-workout" asChild>
                    <Pressable style={styles.add}>
                        <Text style={styles.addText}>+</Text>
                    </Pressable>
                </Link>
            </View>
        );
    }

    return (
        <>
            <View style={styles.container}>
                <FlatList
                    style={{ marginTop: 8 }}
                    data={logs}
                    keyExtractor={(c) => c._id}
                    renderItem={({ item }) => (
                        <LogCard
                            _id={item._id}
                            workoutId={item.workoutId}
                            performedAt={item.performedAt}
                            notes={item.notes}
                            onDeleted={(id) => {
                                setLogs((prev) => prev.filter((log) => log._id !== id));
                            }}
                        />
                    )}
                    contentContainerStyle={{ paddingBottom: 24 }}
                />
            </View>
            <Link href="/(modals)/log-workout" asChild>
                <Pressable style={styles.add}>
                    <Text style={styles.addText}>+</Text>
                </Pressable>
            </Link>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    emptyContainer: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    emptyText: {
        fontSize: 18,
        color: theme.colors.text,
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
        borderRadius: 40,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary,
        fontSize: 16
    },
    addText: {
        color: theme.colors.text,
        fontWeight: "600",
        fontSize: 20
    }
});
