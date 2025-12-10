import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import Entypo from '@expo/vector-icons/Entypo';
import { theme } from "../theme";


export default function SearchBar({
    value, onChangeText, placeholder = "Search..."
}: {
    value: string;
    onChangeText: (t: string) => void;
    placeholder?: string;
}) {
    return (
        <View style={styles.box}>
            <Entypo name="magnifying-glass" size={24} color={theme.colors.primary} />
            <TextInput
                keyboardAppearance="dark"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textTertiary}
                style={styles.input}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 4
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 8,
        marginLeft: 8,
        color: theme.colors.text
    }
});