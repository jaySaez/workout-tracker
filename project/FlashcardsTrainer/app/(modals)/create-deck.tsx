import React from "react";
import { View, TextInput, StyleSheet, Pressable, Text } from "react-native";
import { useState, useEffect } from "react";
import { router } from 'expo-router'
import { BASE_URL } from "../../src/config";


export default function CreateDeck() {
    const [name, setName] = useState("");
    const handleAdd = async () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        try {
            const res = await fetch(`${BASE_URL}/api/decks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title: trimmed }),
            });
            if (!res.ok) {
                throw new Error(`Failed to create deck: ${res.status}`);
            }
            router.dismiss();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <View >
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder={"Deck name..."}
                style={styles.box}
            />
            <Pressable style={styles.save} onPress={handleAdd} >
                <Text style={{ color: "white" }}>Save</Text>
            </Pressable>

        </View >

    );
}

const styles = StyleSheet.create({
    box: {
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
        fontSize: 16
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
        fontSize: 16
    }
});