import { FlatList, View, Text } from "react-native";
import CardRow from "../../../src/components/CardRow";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { CardItem } from "../../../src/components/types";
import { BASE_URL } from "../../../src/config";



export default function Home() {
    const [starredCards, setStarredCards] = useState<CardItem[]>([]);

    useFocusEffect(useCallback(() => {
        async function fetchFavorites() {
            try {
                const res = await fetch(`${BASE_URL}/api/cards/favorites`);
                if (!res.ok) {
                    throw new Error(`Failed to load favorites: ${res.status}`);
                }
                const data = await res.json();
                setStarredCards(data);
            } catch (err) {
                console.error(err);
            }
        }

        fetchFavorites();
    }, []));

    if (starredCards.length == 0) {
        return (
            <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
                <Text style={{ fontSize: 18 }}>No favorites!</Text>
            </View>
        );
    }

    return (
        <>
            <View>
                <FlatList
                    style={{ marginTop: 8 }}
                    data={starredCards}
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
            </View>
        </>
    );
}