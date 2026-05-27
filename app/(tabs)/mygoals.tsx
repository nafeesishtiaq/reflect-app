import { useGoalStore } from "@/src/store/goalStore";
import { Goal } from "@/src/store/goalStore";
import { cancelGoalNotification } from "@/src/utils/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ACCENT = "#FF6B35";

function daysLeft(deadline: Date) {
  const diff = new Date(deadline).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function GoalCard({
  item,
  onPress,
  onDelete,
  isCompleted,
}: {
  item: Goal;
  onPress: () => void;
  onDelete: () => void;
  isCompleted: boolean;
}) {
  const completedTasks = item.tasks.filter((t) => t.completed).length;
  const totalTasks = item.tasks.length;
  const checkInCount = item.checkIns.length;
  const days = daysLeft(item.deadline);

  return (
    <TouchableOpacity
      style={styles.goalCard}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, isCompleted && styles.accentBarDone]} />

      <View style={styles.cardBody}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.goalTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={16} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Deadline */}
        <Text style={styles.deadline}>
          {isCompleted
            ? `Completed · due ${new Date(item.deadline)
                .toDateString()
                .slice(4, 10)}`
            : days === 0
            ? "Due today"
            : `${days} days left · ${new Date(item.deadline)
                .toDateString()
                .slice(4, 10)}`}
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons
              name="checkmark-done-outline"
              size={14}
              color={isCompleted ? "#444" : ACCENT}
            />
            <Text style={styles.statText}>
              {completedTasks}/{totalTasks} tasks
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Ionicons
              name="journal-outline"
              size={14}
              color={isCompleted ? "#444" : ACCENT}
            />
            <Text style={styles.statText}>
              {checkInCount} check-in{checkInCount !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MyGoals() {
  const router = useRouter();
  const goals = useGoalStore((state) => state.goals);
  const deleteGoal = useGoalStore((state) => state.deleteGoal);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  const filtered = goals.filter((g) => g.status === activeTab);

  async function handleDelete(item: Goal) {
    Alert.alert(
      "Delete Goal",
      `Delete "${item.title}"? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (item.notificationId) {
              await cancelGoalNotification(item.notificationId);
            }
            deleteGoal(item.id);
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Goals</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/CreateGoal")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.tabActive]}
          onPress={() => setActiveTab("active")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.tabTextActive,
            ]}
          >
            Active
          </Text>
          <Text
            style={[
              styles.tabCount,
              activeTab === "active" && styles.tabCountActive,
            ]}
          >
            {goals.filter((g) => g.status === "active").length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.tabActive]}
          onPress={() => setActiveTab("completed")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "completed" && styles.tabTextActive,
            ]}
          >
            Completed
          </Text>
          <Text
            style={[
              styles.tabCount,
              activeTab === "completed" && styles.tabCountActive,
            ]}
          >
            {goals.filter((g) => g.status === "completed").length}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="flag-outline" size={44} color="#2A2A2A" />
          <Text style={styles.emptyTitle}>No {activeTab} goals</Text>
          {activeTab === "active" && (
            <TouchableOpacity onPress={() => router.push("/CreateGoal")}>
              <Text style={styles.emptyAction}>Create your first goal →</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GoalCard
              item={item}
              isCompleted={activeTab === "completed"}
              onPress={() => router.push(`/goal/${item.id}`)}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
  },
  tabActive: {
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: ACCENT,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
  },
  tabTextActive: {
    color: "#fff",
  },
  tabCount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },
  tabCountActive: {
    color: ACCENT,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  goalCard: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    marginBottom: 10,
    overflow: "hidden",
  },
  accentBar: {
    width: 4,
    backgroundColor: ACCENT,
  },
  accentBarDone: {
    backgroundColor: "#2E2E2E",
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
    marginRight: 10,
    letterSpacing: -0.2,
  },
  deadline: {
    fontSize: 12,
    color: "#555",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 10,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: "#2E2E2E",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 16,
    color: "#444",
    fontWeight: "500",
  },
  emptyAction: {
    color: ACCENT,
    fontSize: 14,
    marginTop: 4,
  },
});
