import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { requestPermissions } from "@/src/utils/notifications";
import { useGoalStore } from "@/src/store/goalStore";
export default function RootLayout(){
  const router = useRouter();
  const fetchGoals = useGoalStore((state) => state.fetchGoals);
  useEffect(() => {
    requestPermissions();
    fetchGoals();
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
      <Stack.Screen name="CreateGoal" options={{ title: "Set Your Goal" }} />
      <Stack.Screen name="goal/[id]" options={{ title: "Goal" }} />
      <Stack.Screen name="goal/[id]/checkin" options={{ title: "Check In" }} />
      <Stack.Screen
        name="goal/[id]/goalCompleted"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}