import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ title: "Home", headerShown: false }} />
            <Stack.Screen
                name="(modals)/create-workout"
                options={{ presentation: "modal", title: "New Workout" }}
            />
            <Stack.Screen
                name="(modals)/log-workout"
                options={{ presentation: "modal", title: "Log Workout" }}
            />
        </Stack>
    );
}