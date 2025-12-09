import { Stack } from "expo-router";

export default function DecksLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Workouts", headerShown: false }} />
            <Stack.Screen name="workout/[id]" options={{ title: "Workout" }} />
        </Stack>
    );
}