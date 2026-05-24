import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { requestPermissions } from "@/src/utils/notifications";

export default function RootLayout(){
  const router = useRouter();

  useEffect(() => {
    requestPermissions();

    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const goalId = response.notification.request.content.data?.goalId;
        if (goalId) {
          router.push(`/goal/${goalId}`);
        }
      }
    );

    return () => sub.remove();
  }, []);
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="CreateGoal" options={{ title: "New Goal" }} />
      <Stack.Screen name="goal/[id]" options={{ title: "Goal" }} />
      <Stack.Screen name="goal/[id]/checkin" options={{ title: "Check In" }} />
    </Stack>
  );
}