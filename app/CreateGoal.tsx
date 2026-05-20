import { useGoalStore } from "@/src/store/goalStore";
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

  const addGoal = useGoalStore((state) => state.addGoal);

  const router = useRouter();

  function handleSubmit() {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a goal title.");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Missing message", "Please write a message to yourself.");
      return;
    }

    addGoal({
      id: Date.now().toString(),
      title: title.trim(),
      message: message.trim(),
      deadline,
      reminder,
      createdAt: new Date(),
    });
    router.back();
  }

  return (
    <ScrollView>
      <Text>New Goal</Text>
      <TextInput
        placeholder="e.g. Spend more time with my mom"
        value={title}
        onChangeText={setTitle}
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
          <Picker.Item label="None" value="none" />
        </Picker>
      </View>

      <TouchableOpacity onPress={handleSubmit}>
        <Text>Create Goal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
