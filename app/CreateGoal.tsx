import { useGoalStore } from "@/src/store/goalStore";
import { scheduleGoalNotification } from "@/src/utils/notifications";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateGoal() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminder, setReminder] = useState("daily");
  const [reminderInterval, setReminderInterval] = useState("");
  const [description, setDescription] = useState("");
  const addGoal = useGoalStore((state) => state.addGoal);
  const updateGoal = useGoalStore((state) => state.updateGoal);
  const router = useRouter();

  async function handleSubmit() {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a goal title.");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Missing message", "Please write a message to yourself.");
      return;
    }
    if (reminder === "custom" && !reminderInterval.trim()) {
      Alert.alert("Missing reminder", "Please enter the number of days.");
      return;
    }
    const id = Date.now().toString();
    addGoal({
      id,
      title: title.trim(),
      description: description.trim(),
      message: message.trim(),
      deadline,
      reminder,
      reminderInterval:
        reminder === "custom" ? Number(reminderInterval) : undefined,
      createdAt: new Date(),
      status: "active",
      checkIns: [],
      tasks: [],
    });

    const notificationId = await scheduleGoalNotification(
      id,
      title.trim(),
      reminder,
      reminder === "custom" ? Number(reminderInterval) : undefined
    );
    updateGoal(id, { notificationId });
    router.replace(`/goal/${id}`);
  }

  return (
    <ScrollView>
      <Text>New Goal</Text>
      <TextInput
        placeholder="e.g. Spend more time with my mom"
        value={title}
        onChangeText={setTitle}
      />
      <Text>Describe your goal</Text>
      <TextInput
        placeholder="Describe your goal..."
        value={description}
        onChangeText={setDescription}
      />
      <Text>Write a message to your future self</Text>
      <TextInput
        placeholder="Dear future me, I'm writing this because..."
        value={message}
        onChangeText={setMessage}
      />
      <Text>Deadline</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text>{deadline.toString()}</Text>
      </TouchableOpacity>

      {(showDatePicker || Platform.OS === "ios") && (
        <DateTimePicker
          value={deadline}
          mode="date"
          minimumDate={new Date()}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDeadline(selectedDate);
            }
          }}
        />
      )}

      <View>
        <Picker
          selectedValue={reminder}
          onValueChange={(val) => setReminder(val)}
        >
          <Picker.Item label="Daily" value="daily" />
          <Picker.Item label="Weekly" value="weekly" />
          <Picker.Item label="Monthly" value="monthly" />
          <Picker.Item label="Custom" value="custom" />
        </Picker>
      </View>
      {reminder === "custom" && (
        <TextInput
          placeholder="Number of days"
          keyboardType="numeric"
          value={reminderInterval}
          onChangeText={setReminderInterval}
        />
      )}
      <TouchableOpacity onPress={handleSubmit}>
        <Text>Create Goal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
