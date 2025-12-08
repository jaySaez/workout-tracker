import React from "react";
import { View, TextInput, StyleSheet, Pressable, Text } from "react-native";
import { useState } from "react";
import { router, useLocalSearchParams } from 'expo-router'
import { BASE_URL } from "../../src/config";

export default function CreateCard() {
    const { deckId } = useLocalSearchParams<{ deckId?: string }>();
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    const handleAdd = async () => {
        const q = question.trim();
        const a = answer.trim();
        if (!q || !a || !deckId) return;
        try {
            const res = await fetch(`${BASE_URL}/api/decks/${deckId}/cards`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    question: q,
                    answer: a,
                }),
            });
            if (!res.ok) {
                throw new Error(`Failed to create card: ${res.status}`);
            }
            router.dismiss();
        } catch (err) {
            console.error(err);
        }
    };


    return (
        <View >
            <TextInput
                value={question}
                onChangeText={setQuestion}
                placeholder={"Question"}
                style={styles.qbox}
            />
            <TextInput
                value={answer}
                onChangeText={setAnswer}
                placeholder={"Answer"}
                style={styles.abox}
            />
            <Pressable style={styles.save} onPress={handleAdd} >
                <Text style={{ color: "white" }}>Save</Text>
            </Pressable>

        </View >

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
        fontSize: 16
    },
    abox: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 15,
        borderColor: "#f6f6f6",
        backgroundColor: "#ffffff",
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 100,
        marginHorizontal: 16,
        marginBottom: 10,
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