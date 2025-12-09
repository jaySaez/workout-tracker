import { Stack } from "expo-router";
import { theme } from "../../../src/theme";

export default function DecksLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.surface,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    color: theme.colors.text,
                },
                contentStyle: {
                    backgroundColor: theme.colors.background,
                },
            }}
        >
            <Stack.Screen name="index" options={{ title: "Workouts", headerShown: false }} />
            <Stack.Screen name="workout/[id]" options={{ title: "Workout" }} />
        </Stack>
    );
}