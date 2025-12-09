import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Link } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BASE_URL } from "../config";
import { theme } from "../theme";

type Props = {
    id: string;
    title: string;
    isFavorite: boolean;
    onDeleted?: (id: string) => void;
};

export default function WorkoutCard({ id, title, isFavorite, onDeleted }: Props) {
    const [favorite, setFavorite] = useState(isFavorite);

    async function toggleFavorite() {
        try {
            const res = await fetch(`${BASE_URL}/api/workouts/${id}/favorite`, {
                method: "PATCH",
            });
            if (!res.ok) {
                throw new Error("Failed to toggle favorite");
            }
            const data = await res.json();
            setFavorite(data.isFavorite);
        } catch (err) {
            console.error(err);
        }
    }

    function confirmDelete() {
        Alert.alert(
            "Delete workout",
            "Delete this workout and all its logs?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await fetch(`${BASE_URL}/api/workouts/${id}`, {
                                method: "DELETE",
                            });
                            if (!res.ok) {
                                throw new Error(`Failed to delete workout: ${res.status}`);
                            }
                            onDeleted?.(id);
                        } catch (err) {
                            console.error(err);
                        }
                    },
                },
            ]
        );
    }

    return (
        <View style={styles.row}>
            <Link
                href={{ pathname: "/(workouts)/workout/[id]", params: { id } }}
                asChild
            >
                <Pressable
                    style={styles.textWrap}
                    onLongPress={confirmDelete}
                    delayLongPress={500}
                >
                    <Text style={styles.title}>{title}</Text>
                </Pressable>
            </Link>

            <Pressable
                onPress={toggleFavorite}
                style={styles.starButton}
            >
                <FontAwesome
                    name={favorite ? "star" : "star-o"}
                    size={22}
                    color={favorite ? theme.colors.primary : theme.colors.iconSecondary}
                />
            </Pressable>
        </View>
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
    starButton: {
        marginLeft: 12,
    },
});
