import { useGoalStore } from "@/src/store/goalStore";
import { useState } from "react";
import { useRouter } from "expo-router";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  StyleSheet,
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
    </ScrollView>
  );
}


