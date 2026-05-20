import { useGoalStore } from "@/src/store/goalStore";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native";
export default function Index() {
  const router = useRouter();
  const goals = useGoalStore((state) => state.goals);

  return (
    <View>
      <Text>My Goals</Text>

      {goals.length === 0 ? (
        <Text>No goals added yet.</Text>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <Text>{item.title}</Text>
              <Text>Deadline: {new Date(item.deadline).toDateString()}</Text>
              <Text>{item.reminder}</Text>
            </View>
          )}
        />
      )}
      <TouchableOpacity onPress={() => router.push("/CreateGoal")}>
        <Text>Create New Goal</Text>
      </TouchableOpacity>
    </View>
  );
}
