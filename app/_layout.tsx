import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { requestPermissions } from "@/src/utils/notifications";
import { useGoalStore } from "@/src/store/goalStore";
import { supabase } from "@/src/lib/supabase";

export default function RootLayout(){
  const router = useRouter();
  const segments = useSegments();
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState(false);

  const fetchGoals = useGoalStore((state) => state.fetchGoals);

  useEffect(() => {
    requestPermissions();

    // Check if user is already logged in when app opens
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setReady(true);
    });

    // Listen for login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const goalId = response.notification.request.content.data?.goalId;
        if (goalId) {
          router.push(`/goal/${goalId}`);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      sub.remove();
    };
  }, []);

  // Redirect based on auth state
  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === "login";

    if (!user && !inAuthGroup) {
      router.replace("/login");
    } else if (user && inAuthGroup) {
      fetchGoals();
      router.replace("/(tabs)");
    } else if (user) {
      fetchGoals();
    }
  }, [user, ready]);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
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