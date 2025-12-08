import { Tabs } from "expo-router";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="(decks)" options={{ title: "Decks", tabBarIcon: ({ color, size, focused }) => <MaterialCommunityIcons color={color} size={size} name={focused ? 'cards' : 'cards-outline'} /> }} />
            <Tabs.Screen name="(study)/index" options={{ title: "Study", tabBarIcon: ({ color, size }) => <FontAwesome color={color} size={size} name={'graduation-cap'} /> }} />
        </Tabs>
    );
}