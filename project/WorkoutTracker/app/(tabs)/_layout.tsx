import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../src/theme";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textTertiary,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    borderTopWidth: 1,
                },
                headerStyle: {
                    backgroundColor: theme.colors.surface,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    color: theme.colors.text,
                },
            }}
        >
            <Tabs.Screen name="(workouts)" options={{ title: "Workouts", tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} size={size} name={'weight-lifter'} /> }} />
            <Tabs.Screen name="(log)/index" options={{ title: "Log", tabBarIcon: ({ color, size, focused }) => <MaterialCommunityIcons color={color} size={size} name={focused ? 'notebook-edit' : 'notebook-edit-outline'} /> }} />
        </Tabs>
    );
}