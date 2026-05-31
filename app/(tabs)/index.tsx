import { useGoalStore } from "@/src/store/goalStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";

export default function Index() {
  const router = useRouter();
  const goals = useGoalStore((state) => state.goals);

  const activeGoals = goals.filter((g) => g.status === "active").slice(0, 3);

  const upcomingTasks = goals
    .flatMap((g) => g.tasks.map((t) => ({ ...t, goalTitle: g.title })))
    .filter((t) => !t.completed)
    .sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )
    .slice(0, 5);

  const recentcheck_ins = goals
    .flatMap((g) =>
      g.check_ins.map((c) => ({ ...c, goalTitle: g.title, goalId: g.id }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12
      ? "Good morning"
      : greetingHour < 18
      ? "Good afternoon"
      : "Good evening";

  const progressEmoji = (rating: number) => {
    if (rating >= 5) return "🔥";
    if (rating >= 4) return "💪";
    if (rating >= 3) return "🙂";
    if (rating >= 2) return "😕";
    return "😞";
  };

  const daysLeft = (deadline: Date) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.subGreeting}>Let's work on your goals</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Goals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name="flag-outline"
                size={18}
                color="#fff"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitle}>Your Goals</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/mygoals" as any)}
            >
              <Text style={styles.seeAll}>See all ↗</Text>
            </TouchableOpacity>
          </View>

          {activeGoals.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>You haven't set any goals yet.</Text>
              <TouchableOpacity onPress={() => router.push("/CreateGoal")}>
                <Text style={styles.emptyAction}>Create your first goal →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            activeGoals.map((goal, index) => {
              const lastCheckIn = goal.check_ins
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )[0];
              const colors = ["#FF8C55", "#FFB347", "#FF6B6B"];
              const color = colors[index % colors.length];
              return (
                <TouchableOpacity
                  key={goal.id}
                  style={[styles.goalCard, { backgroundColor: color }]}
                  onPress={() => router.push(`/goal/${goal.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.goalCardTop}>
                    <Text style={styles.goalTitle} numberOfLines={1}>
                      {goal.title}
                    </Text>
                    <View style={styles.daysBadge}>
                      <Text style={styles.daysText}>
                        {daysLeft(goal.deadline)}d left
                      </Text>
                    </View>
                  </View>
                  <View style={styles.goalCardBottom}>
                    <Text style={styles.goalMeta}>
                      {goal.tasks.filter((t) => t.completed).length}/
                      {goal.tasks.length} tasks
                    </Text>
                    {lastCheckIn ? (
                      <Text style={styles.goalMeta}>
                        {progressEmoji(lastCheckIn.progress)}{" "}
                        {new Date(lastCheckIn.date).toDateString()}
                      </Text>
                    ) : (
                      <Text style={styles.goalMetaDim}>No check-ins yet</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#fff"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitle}>Tasks</Text>
            </View>
          </View>

          {upcomingTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No pending tasks.</Text>
            </View>
          ) : (
            upcomingTasks.map((task) => (
              <View key={task.id} style={styles.taskRow}>
                <View style={styles.taskDot} />
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <Text style={styles.taskGoal}>{task.goalTitle}</Text>
                </View>
                <Text style={styles.taskDate}>
                  {new Date(task.due_date).toDateString().slice(4, 10)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Recent Check-ins */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name="journal-outline"
                size={18}
                color="#fff"
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionTitle}>Recent Check-ins</Text>
            </View>
          </View>

          {recentcheck_ins.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No check-ins yet.</Text>
            </View>
          ) : (
            recentcheck_ins.map((checkIn) => (
              <TouchableOpacity
                key={checkIn.id}
                style={styles.checkInCard}
                onPress={() => router.push(`/goal/${checkIn.goalId}`)}
                activeOpacity={0.8}
              >
                <View style={styles.checkInTop}>
                  <Text style={styles.checkInGoal}>{checkIn.goalTitle}</Text>
                  <Text style={styles.checkInProgress}>
                    {progressEmoji(checkIn.progress)} {checkIn.progress}/5
                  </Text>
                </View>
                <Text style={styles.checkInJournal} numberOfLines={2}>
                  {checkIn.journal}
                </Text>
                <Text style={styles.checkInDate}>
                  {new Date(checkIn.date).toDateString()}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 30 }} />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "center",
  },
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
  sectionIcon: {
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 13,
    color: "#FF6B35",
  },
  emptyCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#555",
    fontSize: 14,
  },
  emptyAction: {
    color: "#FF6B35",
    fontSize: 14,
    marginTop: 8,
  },
  goalCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  goalCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  goalTitle: {
    color: "#1A1A1A",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
  },
  daysBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  daysText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  goalCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goalMeta: {
    color: "#333",
    fontSize: 12,
  },
  goalMetaDim: {
    color: "#555",
    fontSize: 12,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  taskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B35",
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  taskGoal: {
    color: "#555",
    fontSize: 12,
    marginTop: 2,
  },
  taskDate: {
    color: "#666",
    fontSize: 12,
  },
  checkInCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  checkInTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  checkInGoal: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  checkInProgress: {
    color: "#888",
    fontSize: 13,
  },
  checkInJournal: {
    color: "#666",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  checkInDate: {
    color: "#444",
    fontSize: 12,
  },
});
