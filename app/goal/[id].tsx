import { useGoalStore } from "@/src/store/goalStore";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
export default function GoalDetail() {
  const { id } = useLocalSearchParams();
  const goal = useGoalStore((state) => state.goals.find((g) => g.id === id));
  const router = useRouter();

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
      <TouchableOpacity onPress={() => router.push(`/goal/${goal.id}/checkin`)}>
        <Text>Check In</Text>
      </TouchableOpacity>
      {/* Check-ins timeline */}
      {goal.checkIns.length === 0 ? (
        <Text>No check-ins yet.</Text>
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
    </ScrollView>
  );
}
