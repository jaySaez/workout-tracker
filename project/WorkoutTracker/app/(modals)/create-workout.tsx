import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable, Text } from "react-native";
import { router } from "expo-router";
import { BASE_URL } from "../../src/config";
import { theme } from "../../src/theme";

export default function CreateWorkout() {
    const [title, setTitle] = useState("");
    const [exercises, setExercises] = useState("");

    const handleAdd = async () => {
        const t = title.trim();
        const e = exercises.trim();
        if (!t || !e) return;

        try {
            const res = await fetch(`${BASE_URL}/api/workouts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: t,
                    exercises: e,
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
        <View style={styles.container}>
            <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Workout name"
                placeholderTextColor={theme.colors.textTertiary}
                style={styles.qbox}
            />
            <TextInput
                value={exercises}
                onChangeText={setExercises}
                placeholder={"Exercises e.g. \n- Curls 3x12\n- Squats 4x6"}
                placeholderTextColor={theme.colors.textTertiary}
                style={styles.abox}
                multiline
                textAlignVertical="top"
            />
            <Pressable style={styles.save} onPress={handleAdd}>
                <Text style={styles.saveText}>Save</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    qbox: {
        flexDirection: "row",
        alignItems: "center",
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
    abox: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginHorizontal: 16,
        marginBottom: 10,
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
    },
    saveText: {
        color: theme.colors.text,
        fontWeight: "600",
    },
});
