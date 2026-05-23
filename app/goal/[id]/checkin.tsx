import { useGoalStore } from "@/src/store/goalStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CheckIn() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const goal = useGoalStore((state) => state.goals.find((g) => g.id === id));
  const addCheckIn = useGoalStore((state) => state.addCheckIn);

  const [progress, setProgress] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [journal, setJournal] = useState("");

  if (!goal) {
    return (
      <View>
        <Text>Goal not found.</Text>
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
      id: Date.now().toString(),
      date: new Date(),
      progress,
      journal: journal.trim(),
    });

    router.back();
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
      {/* Motivation message — re-read before checking in */}
      <View>
        <Text>A message from past you</Text>
        <Text>"{goal.message}"</Text>
      </View>

      {/* Progress rating */}
      <View>
        <Text>How's your progress?</Text>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setProgress(n)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                borderWidth: 2,
                borderColor: progress === n ? "#000" : "#ccc",
                backgroundColor: progress === n ? "#000" : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: progress === n ? "#fff" : "#000" }}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
      </View>

      {/* Journal */}
      <View>
        <Text>What's happening?</Text>
        <TextInput
          placeholder="Reflect on your progress, struggles, or wins..."
          value={journal}
          onChangeText={setJournal}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 12,
            marginTop: 8,
            minHeight: 120,
          }}
        />
      </View>

      <TouchableOpacity onPress={handleSubmit}>
        <Text>Save Check-in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
