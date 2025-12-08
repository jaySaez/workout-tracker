import { useState, useCallback } from "react";
import { FlatList, View, Text, Pressable, StyleSheet } from "react-native";
import { Link, useFocusEffect } from 'expo-router';
import SearchBar from '../../../src/components/SearchBar';
import DeckCard from "../../../src/components/DeckCard";
import { BASE_URL } from "../../../src/config";


type Deck = {
    _id: string;
    title: string;
    cardCount: number;
};

export default function Home() {

    const [decks, setDecks] = useState<Deck[]>([]);
    const [query, setQuery] = useState("");

    const filtered = decks.filter((n) => {
        const q = query.trim().toLowerCase();
        return !q || (n.title.toLowerCase().includes(q) || n.title.toLowerCase().includes(q));
    });

    useFocusEffect(
        useCallback(() => {
            async function fetchDecks() {
                try {
                    const res = await fetch(`${BASE_URL}/api/decks`);
                    if (!res.ok) {
                        throw new Error(`Failed to load decks: ${res.status}`);
                    }
                    const decks: Deck[] = await res.json();
                    const withCounts = await Promise.all(
                        decks.map(async (d) => {
                            const cardsRes = await fetch(`${BASE_URL}/api/decks/${d._id}/cards`);
                            if (!cardsRes.ok) {
                                throw new Error(`Failed to load cards for deck ${d._id}`);
                            }
                            const cards = await cardsRes.json();
                            return {
                                ...d,
                                cardCount: cards.length
                            };
                        })
                    );
                    setDecks(withCounts);
                } catch (err) {
                    console.error(err);
                }
            }
            fetchDecks();
        }, [])
    );


    return (
        <>
            <View>
                <SearchBar value={query} onChangeText={setQuery} />
                <FlatList
                    data={filtered}
                    keyExtractor={(d) => d._id}
                    renderItem={({ item }) => (
                        <DeckCard id={item._id} title={item.title} count={item.cardCount} />
                    )}
                    contentContainerStyle={{ paddingBottom: 24 }}
                    style={{ height: "94%" }}
                />
                <Link href="/(modals)/create-deck" asChild>
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