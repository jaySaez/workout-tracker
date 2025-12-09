import { Stack } from "expo-router";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";
import { theme } from "../src/theme";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowList: true,
    }),
});


export default function RootLayout() {
    useEffect(() => {
        async function requestPermissions() {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== "granted") {
                await Notifications.requestPermissionsAsync();
            }
            if (Platform.OS === "android") {
                await Notifications.setNotificationChannelAsync("default", {
                    name: "default",
                    importance: Notifications.AndroidImportance.DEFAULT,
                });
            }
        }
        requestPermissions();
    }, []);
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