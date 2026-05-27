import { useGoalStore } from "@/src/store/goalStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
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

function progressEmoji(rating: number) {
  if (rating >= 5) return "🔥";
  if (rating >= 4) return "💪";
  if (rating >= 3) return "🙂";
  if (rating >= 2) return "😕";
  return "😞";
}

function daysLeft(deadline: Date) {
  const diff = new Date(deadline).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function GoalDetail() {
  const { id } = useLocalSearchParams();
  const goal = useGoalStore((state) => state.goals.find((g) => g.id === id));
  const toggleTask = useGoalStore((state) => state.toggleTask);
  const addTask = useGoalStore((state) => state.addTask);
  const router = useRouter();

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
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Goal not found.</Text>
      </View>
    );
  }

  const completedTasks = goal.tasks.filter((t) => t.completed).length;
  const days = daysLeft(goal.deadline);
  const sortedCheckIns = goal.checkIns
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* Goal Header */}
        <View style={styles.goalHeader}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                goal.status === "completed" && styles.statusBadgeDone,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  goal.status === "completed" && styles.statusTextDone,
                ]}
              >
                {goal.status === "completed" ? "Completed" : "Active"}
              </Text>
            </View>
            <Text style={styles.deadlineText}>
              {goal.status === "completed"
                ? `Due ${new Date(goal.deadline).toDateString().slice(4, 10)}`
                : days === 0
                ? "Due today"
                : `${days} days left`}
            </Text>
          </View>

          <Text style={styles.goalTitle}>{goal.title}</Text>

          {goal.description ? (
            <Text style={styles.goalDescription}>{goal.description}</Text>
          ) : null}

          {goal.message ? (
            <View style={styles.motivationBox}>
              <Ionicons
                name="sparkles-outline"
                size={14}
                color={ACCENT}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.motivationText}>{goal.message}</Text>
            </View>
          ) : null}

          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="calendar-outline" size={13} color="#555" />
              <Text style={styles.metaText}>
                {new Date(goal.deadline).toDateString().slice(4)}
              </Text>
            </View>
            {goal.reminder ? (
              <View style={styles.metaChip}>
                <Ionicons name="alarm-outline" size={13} color="#555" />
                <Text style={styles.metaText}>{goal.reminder}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Tasks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.sectionTitle}>Tasks</Text>
            </View>
            <Text style={styles.sectionCount}>
              {completedTasks}/{goal.tasks.length}
            </Text>
          </View>

          {/* Add task */}
          <View style={styles.addTaskRow}>
            <TextInput
              style={styles.taskInput}
              placeholder="Add a task..."
              placeholderTextColor="#444"
              value={taskTitle}
              onChangeText={setTaskTitle}
              onSubmitEditing={handleAddTask}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.datePickerBtn}
              onPress={() => setShowTaskDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={14} color="#888" />
              <Text style={styles.datePickerText}>
                {taskDate.toDateString().slice(4, 10)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.addBtn,
                !taskTitle.trim() && styles.addBtnDisabled,
              ]}
              onPress={handleAddTask}
              disabled={!taskTitle.trim()}
            >
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

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

          {/* Task list */}
          {goal.tasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks yet.</Text>
          ) : (
            goal.tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskRow}
                onPress={() => toggleTask(goal.id, task.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    task.completed && styles.checkboxDone,
                  ]}
                >
                  {task.completed && (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  )}
                </View>
                <View style={styles.taskInfo}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.completed && styles.taskTitleDone,
                    ]}
                  >
                    {task.title}
                  </Text>
                  <Text style={styles.taskDate}>
                    {new Date(task.dueDate).toDateString().slice(4, 10)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Check In Button */}
        <TouchableOpacity
          style={styles.checkInBtn}
          onPress={() => router.push(`/goal/${goal.id}/checkin`)}
          activeOpacity={0.85}
        >
          <Ionicons
            name="journal-outline"
            size={18}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.checkInBtnText}>Log a Check-in</Text>
        </TouchableOpacity>

        {/* Check-ins Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name="journal-outline"
                size={16}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.sectionTitle}>Check-ins</Text>
            </View>
            <Text style={styles.sectionCount}>{goal.checkIns.length}</Text>
          </View>

          {goal.checkIns.length === 0 ? (
            <Text style={styles.emptyText}>No check-ins yet.</Text>
          ) : (
            sortedCheckIns.map((checkIn, index) => (
              <View key={checkIn.id} style={styles.checkInCard}>
                {/* Timeline line */}
                {index < sortedCheckIns.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
                <View style={styles.timelineDot} />

                <View style={styles.checkInContent}>
                  <View style={styles.checkInHeader}>
                    <Text style={styles.checkInDate}>
                      {new Date(checkIn.date).toDateString()}
                    </Text>
                    <View style={styles.progressPill}>
                      <Text style={styles.progressPillText}>
                        {progressEmoji(checkIn.progress)} {checkIn.progress}/5
                      </Text>
                    </View>
                  </View>
                  {checkIn.journal ? (
                    <Text style={styles.checkInJournal}>{checkIn.journal}</Text>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>

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
    paddingTop: 56,
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

  // Goal header
  goalHeader: {
    marginBottom: 32,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(255,107,53,0.15)",
  },
  statusBadgeDone: {
    backgroundColor: "#1E1E1E",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: ACCENT,
  },
  statusTextDone: {
    color: "#555",
  },
  deadlineText: {
    fontSize: 13,
    color: "#555",
  },
  goalTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 10,
    lineHeight: 32,
  },
  goalDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 21,
    marginBottom: 12,
  },
  motivationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,107,53,0.08)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 2,
    borderLeftColor: ACCENT,
  },
  motivationText: {
    flex: 1,
    fontSize: 13,
    color: "#999",
    lineHeight: 19,
    fontStyle: "italic",
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#555",
  },

  // Section
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 13,
    color: "#444",
    fontWeight: "600",
  },
  emptyText: {
    color: "#333",
    fontSize: 13,
    paddingVertical: 8,
  },

  // Add task
  addTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 4,
    marginBottom: 10,
    gap: 6,
  },
  taskInput: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#222",
    borderRadius: 8,
  },
  datePickerText: {
    fontSize: 12,
    color: "#666",
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDisabled: {
    backgroundColor: "#2A2A2A",
  },

  // Tasks
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
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
  taskDate: {
    fontSize: 12,
    color: "#444",
    marginTop: 2,
  },

  // Check in button
  checkInBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 28,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  checkInBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

  // Check-ins timeline
  checkInCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    position: "relative",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT,
    marginTop: 4,
    marginRight: 14,
    flexShrink: 0,
  },
  timelineLine: {
    position: "absolute",
    left: 4,
    top: 14,
    width: 2,
    bottom: -16,
    backgroundColor: "#1E1E1E",
  },
  checkInContent: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 14,
  },
  checkInHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  checkInDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
  },
  progressPill: {
    backgroundColor: "#222",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  progressPillText: {
    fontSize: 12,
    color: "#777",
  },
  checkInJournal: {
    fontSize: 13,
    color: "#666",
    lineHeight: 19,
  },
});
