import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Link } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BASE_URL } from "../config";

type Props = {
    id: string;
    title: string;
    isFavorite: boolean;
};

export default function WorkoutCard({ id, title, isFavorite }: Props) {
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

    return (
        <View style={styles.row}>
            <Link
                href={{ pathname: "/(workouts)/workout/[id]", params: { id } }}
                asChild
            >
                <Pressable style={styles.textWrap}>
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
                    color={"black"}
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
        color: "#202020",
    },
    starButton: {
        marginLeft: 12,
    },
});
