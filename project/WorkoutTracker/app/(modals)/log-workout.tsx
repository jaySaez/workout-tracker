import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Pressable, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import { BASE_URL } from "../../src/config";
import { scheduleWorkoutReminder } from "../../src/notifications";
import { Workout } from "../../src/components/types";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { theme } from "../../src/theme";

export default function CreateWorkoutLog() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
    const [notes, setNotes] = useState("");

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

    const handleAdd = async () => {
        if (!selectedWorkoutId) return;
        const trimmedNotes = notes.trim();

        try {
            const res = await fetch(`${BASE_URL}/api/workoutLogs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    workoutId: selectedWorkoutId,
                    notes: trimmedNotes || undefined,
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

            <Text style={styles.label}>Notes (optional):</Text>
            <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="How did your workout feel? Any comments?"
                placeholderTextColor={theme.colors.textTertiary}
                style={styles.notesBox}
                multiline
                textAlignVertical="top"
            />

            <Pressable
                style={[styles.save, !selectedWorkoutId && { opacity: 0.5 }]}
                onPress={handleAdd}
                disabled={!selectedWorkoutId}
            >
                <Text style={styles.saveText}>Log workout</Text>
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
        maxHeight: 220,
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
    notesBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginHorizontal: 16,
        marginVertical: 10,
        fontSize: 16,
        minHeight: 120,
        color: theme.colors.text,
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
        fontSize: 16,
        marginBottom: 10,
    },
    saveText: {
        color: theme.colors.text,
        fontWeight: "600",
    },
});
