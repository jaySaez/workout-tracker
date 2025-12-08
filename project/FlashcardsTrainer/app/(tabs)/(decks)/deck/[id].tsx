import { Pressable, FlatList, View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, Link, useFocusEffect } from "expo-router";
import CardRow from "../../../../src/components/CardRow";
import { useState, useCallback } from "react";
import { BASE_URL } from "../../../../src/config";

type Card = {
    _id: string;
    question: string;
    answer: string;
    isFavorite: boolean;
    deckId: string;
};

export default function Home() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [cards, setCards] = useState<Card[]>([]);

    useFocusEffect(
        useCallback(() => {
            if (!id) return;
            async function fetchCards() {
                try {
                    const res = await fetch(`${BASE_URL}/api/decks/${id}/cards`);
                    if (!res.ok) {
                        throw new Error(`Failed to load cards: ${res.status}`);
                    }
                    const data: Card[] = await res.json();
                    setCards(data);
                } catch (err) {
                    console.error(err);
                }
            }
            fetchCards();
        }, [id])
    );

    return (
        <>
            <View>
                <FlatList
                    style={{ marginTop: 8, height: "100%" }}
                    data={cards}
                    keyExtractor={(c) => c._id}
                    renderItem={({ item }) => (
                        <CardRow
                            _id={item._id}
                            question={item.question}
                            answer={item.answer}
                            isFavorite={item.isFavorite}
                            deckId={item.deckId} />
                    )}
                    contentContainerStyle={{ paddingBottom: 24 }}
                />
                <Link href={{ pathname: "/(modals)/create-card", params: { deckId: id } }} asChild>
                    <Pressable style={styles.add}>
                        <Text style={{ color: "white", fontWeight: 600, fontSize: 20 }}>+</Text>
                    </Pressable>
                </Link>
            </View>
        </>

    );
}

const styles = StyleSheet.create({
    add: {
        position: "absolute",
        bottom: 30,
        right: 20,
        width: 80,
        height: 80,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderRadius: "50%",
        borderColor: "#f6f6f6",
        backgroundColor: "black",
        fontSize: 16
    }
});
