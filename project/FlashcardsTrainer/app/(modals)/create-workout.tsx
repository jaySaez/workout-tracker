import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable, Text } from "react-native";
import { router } from "expo-router";
import { BASE_URL } from "../../src/config";

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
        <View>
            <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Workout name"
                style={styles.qbox}
            />
            <TextInput
                value={exercises}
                onChangeText={setExercises}
                placeholder={"Exercises e.g. \n- Curls 3x12\n- Squats 4x6"}
                style={styles.abox}
                multiline
                textAlignVertical="top"
            />
            <Pressable style={styles.save} onPress={handleAdd}>
                <Text style={{ color: "white" }}>Save</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    qbox: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 15,
        borderColor: "#f6f6f6",
        backgroundColor: "#ffffff",
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginHorizontal: 16,
        marginVertical: 10,
        fontSize: 16,
    },
    abox: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderWidth: 1,
        borderRadius: 15,
        borderColor: "#f6f6f6",
        backgroundColor: "#ffffff",
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginHorizontal: 16,
        marginBottom: 10,
        fontSize: 16,
        minHeight: 120,
    },
    save: {
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 15,
        borderColor: "#f6f6f6",
        backgroundColor: "black",
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginHorizontal: 16,
        fontSize: 16,
    },
});
