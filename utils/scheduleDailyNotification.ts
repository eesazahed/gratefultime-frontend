import * as Notifications from "expo-notifications";

export const scheduleDailyNotification = async (hour: number) => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  Notifications.scheduleNotificationAsync({
    content: {
      title: "What are 3 things you're grateful for?",
      body: "Open your gratitude journal!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  });
};
