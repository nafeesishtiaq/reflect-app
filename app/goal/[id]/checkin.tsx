import { useGoalStore } from "@/src/store/goalStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ACCENT = "#FF6B35";

const RATINGS: { value: 1 | 2 | 3 | 4 | 5; emoji: string; label: string }[] = [
  { value: 1, emoji: "😞", label: "Rough" },
  { value: 2, emoji: "😕", label: "Meh" },
  { value: 3, emoji: "🙂", label: "Okay" },
  { value: 4, emoji: "💪", label: "Good" },
  { value: 5, emoji: "🔥", label: "Crushed it" },
];

export default function CheckIn() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const goal = useGoalStore((state) => state.goals.find((g) => g.id === id));
  const addCheckIn = useGoalStore((state) => state.addCheckIn);

  const [progress, setProgress] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [journal, setJournal] = useState("");

  if (!goal) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#fff" }}>Goal not found.</Text>
      </View>
    );
  }

  function handleSubmit() {
    if (!journal.trim()) {
      Alert.alert(
        "Missing entry",
        "Write at least a few words about your progress."
      );
      return;
    }
    addCheckIn(id as string, {
      date: new Date(),
      progress,
      journal: journal.trim(),
    });
    router.back();
  }

  const selected = RATINGS.find((r) => r.value === progress)!;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Check-in</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Goal label */}
        <View style={styles.goalBadge}>
          <Ionicons name="flag-outline" size={13} color={ACCENT} />
          <Text style={styles.goalBadgeText} numberOfLines={1}>
            {goal.title}
          </Text>
        </View>

        {/* Motivation message */}
        {goal.message ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageLabel}>A message from past you</Text>
            <Text style={styles.messageText}>"{goal.message}"</Text>
          </View>
        ) : null}

        {/* Progress rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How's your progress?</Text>
          <View style={styles.ratingRow}>
            {RATINGS.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[
                  styles.ratingBtn,
                  progress === r.value && styles.ratingBtnActive,
                ]}
                onPress={() => setProgress(r.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.ratingEmoji}>{r.emoji}</Text>
                <Text
                  style={[
                    styles.ratingLabel,
                    progress === r.value && styles.ratingLabelActive,
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.selectedRating}>
            <Text style={styles.selectedRatingText}>
              {selected.emoji} {selected.label} · {selected.value}/5
            </Text>
          </View>
        </View>

        {/* Journal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's happening?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Reflect on your progress, struggles, or wins..."
            placeholderTextColor="#444"
            value={journal}
            onChangeText={setJournal}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
          <Text style={styles.submitText}>Save Check-in</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: -0.3,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  goalBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  goalBadgeText: {
    color: "#ccc",
    fontSize: 13,
    fontWeight: "500",
    maxWidth: 220,
  },
  messageCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
  },
  messageLabel: {
    fontSize: 11,
    color: "#555",
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  messageText: {
    color: "#aaa",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 8,
  },
  ratingBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  ratingBtnActive: {
    backgroundColor: "#1E1E1E",
    borderColor: ACCENT,
  },
  ratingEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 10,
    color: "#555",
    fontWeight: "500",
  },
  ratingLabelActive: {
    color: ACCENT,
  },
  selectedRating: {
    marginTop: 12,
    alignItems: "center",
  },
  selectedRatingText: {
    color: "#666",
    fontSize: 13,
  },
  textInput: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 16,
    color: "#fff",
    fontSize: 14,
    lineHeight: 22,
    minHeight: 130,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
});
