import { useGoalStore } from "@/src/store/goalStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";

export default function GoalCompleted() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
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
      <Text>🎉 You did it!</Text>
      <Text>{goal.title}</Text>
      <Text>Completed on {new Date(goal.completedAt!).toDateString()}</Text>

      <Text>Your journey</Text>
      {goal.checkIns.length === 0 ? (
        <Text>No reflections recorded.</Text>
      ) : (
        goal.checkIns
          .slice()
          .reverse()
          .map((checkIn) => (
            <View key={checkIn.id}>
              <Text>{new Date(checkIn.date).toDateString()}</Text>
              <Text>Progress: {checkIn.progress}/5</Text>
              <Text>{checkIn.journal}</Text>
            </View>
          ))
      )}

      <TouchableOpacity onPress={() => router.push("/")}>
        <Text>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
