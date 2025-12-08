import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CardItem } from './types'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BASE_URL } from '../config';
import { useState } from 'react';

export default function CardRow({ _id, question, answer, isFavorite, deckId }: CardItem) {
    const [favorite, setFavorite] = useState(isFavorite);

    async function toggle() {
        try {
            const res = await fetch(`${BASE_URL}/api/cards/${_id}/favorite`, {
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
            <View style={styles.textWrap}>
                <Text style={styles.question}>{question}</Text>
                <Text style={styles.answer}>{answer}</Text>
            </View>
            <Pressable
                onPress={() => toggle()}
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
        flex: 1
    },
    question: {
        fontSize: 16,
        fontWeight: "700",
        color: "#202020",
    },
    answer: {
        fontSize: 16,
        color: "#202020",
        marginTop: 4,
    },
    starButton: {
        marginLeft: 12,
    },
});