import { useGoalStore } from "@/src/store/goalStore";
import { cancelGoalNotification } from "@/src/utils/notifications";
import { scheduleGoalNotification } from "@/src/utils/notifications";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";

interface FormState {
  title: string;
  description: string;
  message: string;
  deadline: Date;
  reminder: string;
  reminderInterval: string;
}

export default function EditGoal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const goal = useGoalStore((state) => state.goals.find((g) => g.id === id));
  const updateGoal = useGoalStore((state) => state.updateGoal);
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    message: "",
    deadline: new Date(),
    reminder: "daily",
    reminderInterval: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (goal) {
      setForm({
        title: goal.title,
        description: goal.description ?? "",
        message: goal.message ?? "",
        deadline: new Date(goal.deadline),
        reminder: goal.reminder ?? "daily",
        reminderInterval: goal.reminderInterval?.toString() ?? "",
      });
    }
  }, [goal]);

  function updateField(key: keyof FormState, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.title.trim()) {
      Alert.alert("Missing title", "Please enter a goal title.");
      return;
    }
    if (!form.message.trim()) {
      Alert.alert("Missing message", "Please write a message to yourself.");
      return;
    }
    if (form.reminder === "custom" && !form.reminderInterval.trim()) {
      Alert.alert("Missing reminder", "Please enter the number of days.");
      return;
    }

    if (!goal) return;

    // Cancel old notification and reschedule
    if (goal.notificationId) {
      await cancelGoalNotification(goal.notificationId);
    }
    const notificationId = await scheduleGoalNotification(
      goal.id,
      form.title.trim(),
      form.reminder,
      form.reminder === "custom" ? Number(form.reminderInterval) : undefined
    );

    updateGoal(goal.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      message: form.message.trim(),
      deadline: form.deadline,
      reminder: form.reminder,
      reminderInterval:
        form.reminder === "custom" ? Number(form.reminderInterval) : undefined,
      notificationId,
    });

    router.back();
  }

  if (!goal) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Goal not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.heading}>Edit Goal</Text>
        <Text style={styles.subheading}>Update your goal details.</Text>

        {/* Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Goal Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Spend more time with my mom"
            placeholderTextColor="#444"
            value={form.title}
            onChangeText={(val) => updateField("title", val)}
          />
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Describe your goal..."
            placeholderTextColor="#444"
            value={form.description}
            onChangeText={(val) => updateField("description", val)}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Message to future self */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Message to Your Future Self</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Dear future me, I'm writing this because..."
            placeholderTextColor="#444"
            value={form.message}
            onChangeText={(val) => updateField("message", val)}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Deadline */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Deadline</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {form.deadline.toDateString()}
            </Text>
          </TouchableOpacity>
          {(showDatePicker || Platform.OS === "ios") && (
            <DateTimePicker
              value={form.deadline}
              mode="date"
              minimumDate={new Date()}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) updateField("deadline", selectedDate);
              }}
            />
          )}
        </View>

        {/* Reminder */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Reminder</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={form.reminder}
              onValueChange={(val) => updateField("reminder", val)}
              style={styles.picker}
              dropdownIconColor="#888"
            >
              <Picker.Item label="Daily" value="daily" />
              <Picker.Item label="Weekly" value="weekly" />
              <Picker.Item label="Monthly" value="monthly" />
              <Picker.Item label="Custom" value="custom" />
            </Picker>
          </View>
          {form.reminder === "custom" && (
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Number of days"
              placeholderTextColor="#444"
              keyboardType="numeric"
              value={form.reminderInterval}
              onChangeText={(val) => updateField("reminderInterval", val)}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.submitText}>Save Changes</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  notFound: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    color: "#555",
    fontSize: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: "#555",
    marginBottom: 32,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  dateButton: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  dateButtonText: {
    color: "#fff",
    fontSize: 15,
  },
  pickerWrapper: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  picker: {
    color: "#fff",
    backgroundColor: "#1A1A1A",
  },
  submitButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
