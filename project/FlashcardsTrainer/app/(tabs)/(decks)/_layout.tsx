import { Stack } from "expo-router";

export default function DecksLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Decks", headerShown: false }} />
            <Stack.Screen name="deck/[id]" options={{ title: "Deck" }} />
        </Stack>
    );
}