import { useGoalStore } from "@/src/store/goalStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function GoalDetail() {
  const { id } = useLocalSearchParams();
  const goal = useGoalStore((state) => state.goals.find((g) => g.id === id));
  const router = useRouter();

  const addTask = useGoalStore((state) => state.addTask);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState(new Date());
  const [showTaskDatePicker, setShowTaskDatePicker] = useState(false);
  function handleAddTask() {
    if (!taskTitle.trim() || !goal) return;
    addTask(goal.id, {
      id: Date.now().toString(),
      title: taskTitle.trim(),
      completed: false,
      dueDate: taskDate,
    });
    setTaskTitle("");
    setTaskDate(new Date());
  }

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

      {/* Tasks */}
      <Text>Tasks</Text>

      {/* Add task input */}
      <TextInput
        placeholder="Add a task..."
        value={taskTitle}
        onChangeText={setTaskTitle}
      />
      <TouchableOpacity onPress={() => setShowTaskDatePicker(true)}>
        <Text>{taskDate.toDateString()}</Text>
      </TouchableOpacity>
      {(showTaskDatePicker || Platform.OS === "ios") && (
        <DateTimePicker
          value={taskDate}
          mode="date"
          minimumDate={new Date()}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selectedDate) => {
            setShowTaskDatePicker(false);
            if (selectedDate) setTaskDate(selectedDate);
          }}
        />
      )}
      <TouchableOpacity onPress={handleAddTask}>
        <Text>Add Task</Text>
      </TouchableOpacity>

      {/* Task list */}
      {goal.tasks.length === 0 ? (
        <Text>No tasks yet.</Text>
      ) : (
        goal.tasks.map((task) => (
          <View key={task.id}>
            <Text>{task.title}</Text>
            <Text>{new Date(task.dueDate).toDateString()}</Text>
          </View>
        ))
      )}

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
