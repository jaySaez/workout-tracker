import { Tabs } from "expo-router";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="(workouts)" options={{ title: "Workouts", tabBarIcon: ({ color, size, focused }) => <MaterialCommunityIcons color={color} size={size} name={focused ? 'cards' : 'cards-outline'} /> }} />
            <Tabs.Screen name="(log)/index" options={{ title: "Log", tabBarIcon: ({ color, size }) => <FontAwesome color={color} size={size} name={'graduation-cap'} /> }} />
        </Tabs>
    );
}