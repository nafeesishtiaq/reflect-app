import { Stack } from "expo-router";

export default function RootLayout(){
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="CreateGoal" options={{ title: "New Goal" }} />
      <Stack.Screen name="goal/[id]" options={{ title: "Goal" }} />
      <Stack.Screen name="goal/[id]/checkin" options={{ title: "Check In" }} />
    </Stack>
  );
}