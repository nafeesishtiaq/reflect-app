import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleGoalNotification(
  goalId: string,
  title: string,
  reminder: string,
  reminderInterval?: number
) {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to reflect 🌱",
      body: title,
      data: { goalId },
    },
    trigger: getTrigger(reminder, reminderInterval),
  });

  return notificationId;
}

export async function cancelGoalNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

function getTrigger(
  reminder: string,
  reminderInterval?: number
): Notifications.NotificationTriggerInput {
  switch (reminder) {
    case "daily":
      return {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      };
    case "weekly":
      return {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60 * 24 * 7,
        repeats: true,
      };
    case "monthly":
      return {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60 * 24 * 30,
        repeats: true,
      };
    case "custom":
      return {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60 * 24 * (reminderInterval ?? 1),
        repeats: true,
      };
    default:
      return {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      };
  }
}
