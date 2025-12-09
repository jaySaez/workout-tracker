import { useState, useCallback } from "react";
import { FlatList, View, Text, Pressable, StyleSheet } from "react-native";
import { Link, useFocusEffect } from 'expo-router';
import SearchBar from '../../../src/components/SearchBar';
import WorkoutCard from "../../../src/components/WorkoutCard";
import { BASE_URL } from "../../../src/config";

import { Workout } from "../../../src/components/types";

export default function Home() {

    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [query, setQuery] = useState("");

    const filtered = workouts.filter((n) => {
        const q = query.trim().toLowerCase();
        return !q || (n.title.toLowerCase().includes(q) || n.title.toLowerCase().includes(q));
    });

    useFocusEffect(
        useCallback(() => {
            async function fetchWorkouts() {
                try {
                    const res = await fetch(`${BASE_URL}/api/workouts`);
                    if (!res.ok) {
                        throw new Error(`Failed to load workouts: ${res.status}`);
                    }
                    const workouts: Workout[] = await res.json();
                    setWorkouts(workouts);
                } catch (err) {
                    console.error(err);
                }
            }
            fetchWorkouts();
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
                        <WorkoutCard
                            id={item._id}
                            title={item.title}
                            isFavorite={item.isFavorite}
                            onDeleted={(deletedId) =>
                                setWorkouts((prev) => prev.filter((w) => w._id !== deletedId))
                            } />
                    )}
                    contentContainerStyle={{ paddingBottom: 24 }}
                    style={{ height: "94%" }}
                />
                <Link href="/(modals)/create-workout" asChild>
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