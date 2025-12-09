import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import Entypo from '@expo/vector-icons/Entypo';


export default function SearchBar({
    value, onChangeText, placeholder = "Search..."
}: {
    value: string;
    onChangeText: (t: string) => void;
    placeholder?: string;
}) {
    return (
        <View style={styles.box}>
            <Entypo name="magnifying-glass" size={24} color="black" />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                style={styles.input}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f1f1f1",
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginHorizontal: 16,
        marginTop: 4
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 8,
        marginLeft: 8
    }
});