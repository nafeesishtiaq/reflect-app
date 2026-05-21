import { useGoalStore } from "@/src/store/goalStore";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
export default function GoalDetail() {
  const { id } = useLocalSearchParams();
  const goal = useGoalStore((state) => state.goals.find((g) => g.id === id));

  if (!goal) {
    return (
      <View>
        <Text>Goal not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <Text>{goal.title}</Text>
      <Text>{goal.status}</Text>
      <Text>{goal.description}</Text>
      <Text>{goal.message}</Text>
      <Text>{new Date(goal.deadline).toString()}</Text>
      <Text>{goal.reminder}</Text>
    </ScrollView>
  );
}
