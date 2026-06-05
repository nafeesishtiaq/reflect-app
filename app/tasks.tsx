import { useGoalStore } from "@/src/store/goalStore";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ACCENT = "#FF6B35";

export default function AllTasks() {
  const goals = useGoalStore((state) => state.goals);
  const toggleTask = useGoalStore((state) => state.toggleTask);
  const deleteTask = useGoalStore((state) => state.deleteTask);

  const allTasks = goals.flatMap((g) =>
    g.tasks.map((t) => ({ ...t, goalId: g.id, goalTitle: g.title }))
  );

  const dueDates = allTasks.map((t) => new Date(t.due_date).toDateString());
  const uniqueDates = [...new Set(dueDates)];
  const dates = uniqueDates.sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  function handleDelete(goalId: string, taskId: string, taskTitle: string) {
    Alert.alert("Delete Task", `Delete "${taskTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTask(goalId, taskId),
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {allTasks.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-done-outline" size={44} color="#2A2A2A" />
          <Text style={styles.emptyText}>No tasks yet.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {dates.map((date) => (
            <View key={date}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateHeaderText}>{date}</Text>
              </View>
              {allTasks
                .filter((t) => new Date(t.due_date).toDateString() === date)
                .map((item) => (
                  <View key={item.id} style={styles.taskRow}>
                    <TouchableOpacity
                      onPress={() => toggleTask(item.goalId, item.id)}
                      style={[
                        styles.checkbox,
                        item.completed && styles.checkboxDone,
                      ]}
                    >
                      {item.completed && (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      )}
                    </TouchableOpacity>
                    <View style={styles.taskInfo}>
                      <Text
                        style={[
                          styles.taskTitle,
                          item.completed && styles.taskTitleDone,
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.taskGoal}>{item.goalTitle}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        handleDelete(item.goalId, item.id, item.title)
                      }
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#333" />
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: {
    color: "#333",
    fontSize: 15,
  },
  dateHeader: {
    paddingVertical: 10,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E1E",
    marginBottom: 4,
  },
  dateHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    color: ACCENT,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    color: "#ddd",
    fontWeight: "500",
  },
  taskTitleDone: {
    color: "#444",
    textDecorationLine: "line-through",
  },
  taskGoal: {
    fontSize: 12,
    color: "#444",
    marginTop: 2,
  },
});
