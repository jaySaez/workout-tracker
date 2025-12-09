import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="(workouts)" options={{ title: "Workouts", tabBarIcon: ({ color, size }) => <MaterialCommunityIcons color={color} size={size} name={'weight-lifter'} /> }} />
            <Tabs.Screen name="(log)/index" options={{ title: "Log", tabBarIcon: ({ color, size, focused }) => <MaterialCommunityIcons color={color} size={size} name={focused ? 'notebook-edit' : 'notebook-edit-outline'} /> }} />
        </Tabs>
    );
}