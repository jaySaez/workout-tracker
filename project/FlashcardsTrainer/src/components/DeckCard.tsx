import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Link } from "expo-router";

type Props = {
    id: string;
    title: string;
    count: number;
};

export default function DeckCard({ id, title, count }: Props) {
    const label = count + " " + (count === 1 ? "card" : "cards");

    return (
        <Link href={{ pathname: "/(decks)/deck/[id]", params: { id } }} asChild>
            <Pressable
                style={styles.row}>
                <View style={styles.textWrap}>
                    <Text style={styles.title}>
                        {title}
                    </Text>
                    <Text style={styles.subtitle}>{label}</Text>
                </View>
            </Pressable>
        </Link>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        backgroundColor: "#ffffff",
        width: '90%',
        borderRadius: 16,
        borderColor: "#f6f6f6",
        borderWidth: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginHorizontal: "5%",
        marginVertical: 4,
    },
    rowPressed: { opacity: 0.9 },
    textWrap: { gap: 4 },
    title: {
        fontSize: 17,
        fontWeight: "700",
        color: "#202020",
    },
    subtitle: {
        fontSize: 13,
        color: "#202020",
    }
});
