import * as Notifications from "expo-notifications";

export async function scheduleWorkoutReminder() {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "You're losing gains!",
            body: "Have you worked out today? Tap here to log it.",
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 5,
            // 60 * 60 * 24,
            repeats: false,
        },
    });
}