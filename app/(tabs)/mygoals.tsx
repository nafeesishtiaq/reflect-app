import { useGoalStore } from "@/src/store/goalStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import {View, FlatList, TouchableOpacity, Text} from "react-native";
import { cancelGoalNotification } from "@/src/utils/notifications";
import { Goal } from "@/src/store/goalStore";

export default function MyGoals(){
  const router = useRouter();
  const goals = useGoalStore((state) => state.goals);
  const deleteGoal = useGoalStore((state) => state.deleteGoal);
  const [activeTab, setActiveTab] = useState("active");

  const filtered = goals.filter((g) => g.status === activeTab);

  async function handleDelete(item: Goal) {
    if (item.notificationId) {
      await cancelGoalNotification(item.notificationId);
    }
    deleteGoal(item.id);
  }
  return (
    <View>
      <View>
        <TouchableOpacity onPress={() => setActiveTab("active")}>
          <Text>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("completed")}>
          <Text>Completed</Text>
        </TouchableOpacity>
      </View>

      {/* Goal List */}
      {filtered.length === 0 ? (
        <Text>No {activeTab} goals yet.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <TouchableOpacity onPress={() => router.push(`/goal/${item.id}`)}>
                <Text>{item.title}</Text>
                <Text>{item.description}</Text>
                <Text>Due: {new Date(item.deadline).toDateString()}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)}>
                <Text>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
  
}