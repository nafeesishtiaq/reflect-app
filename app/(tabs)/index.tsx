import { useGoalStore } from "@/src/store/goalStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();
  const loading = useGoalStore((state) => state.loading);
  const goals = useGoalStore((state) => state.goals);
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={{ color: "#555", marginTop: 12, fontSize: 14 }}>
          Loading...
        </Text>
      </View>
    );
  }
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
      ? "Good morning ⛅"
      : greetingHour < 18
      ? "Good afternoon 🌄"
      : "Good evening ✨";

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
  const hasNoGoals = goals.length === 0;
  const allCompleted =
    goals.length > 0 && goals.every((g) => g.status === "completed");

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
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.subGreeting}>Let's work on your goals</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {hasNoGoals ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>START YOUR JOURNEY</Text>

            <View style={styles.flowContainer}>
              <View style={styles.flowStep}>
                <Ionicons
                  name="flag-outline"
                  size={20}
                  color="#FF6B35"
                  style={styles.flowIcon}
                />
                <View style={styles.flowText}>
                  <Text style={styles.flowTitle}>Set a goal</Text>
                  <Text style={styles.flowDesc}>
                    Write a message to your future self
                  </Text>
                </View>
              </View>
              <View style={styles.flowDivider} />
              <View style={styles.flowStep}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#FF6B35"
                  style={styles.flowIcon}
                />
                <View style={styles.flowText}>
                  <Text style={styles.flowTitle}>Break it down</Text>
                  <Text style={styles.flowDesc}>Add tasks with due dates</Text>
                </View>
              </View>
              <View style={styles.flowDivider} />
              <View style={styles.flowStep}>
                <Ionicons
                  name="journal-outline"
                  size={20}
                  color="#FF6B35"
                  style={styles.flowIcon}
                />
                <View style={styles.flowText}>
                  <Text style={styles.flowTitle}>Stay accountable</Text>
                  <Text style={styles.flowDesc}>
                    Check in and reflect on progress
                  </Text>
                </View>
              </View>
              <View style={styles.flowDivider} />
              <View style={styles.flowStep}>
                <Ionicons
                  name="trophy-outline"
                  size={20}
                  color="#FF6B35"
                  style={styles.flowIcon}
                />
                <View style={styles.flowText}>
                  <Text style={styles.flowTitle}>Achieve it</Text>
                  <Text style={styles.flowDesc}>
                    Never lose sight of your motivation
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.emptyStateBtn}
              onPress={() => router.push("/CreateGoal")}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyStateBtnText}>
                Create your first goal
              </Text>
            </TouchableOpacity>
          </View>
        ) : allCompleted ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🎉</Text>
            <Text style={styles.emptyStateTitle}>All goals completed!</Text>
            <Text style={styles.emptyStateSubtitle}>
              You've achieved everything you set out to do. Ready for your new
              goals?
            </Text>
            <TouchableOpacity
              style={styles.emptyStateBtn}
              onPress={() => router.push("/CreateGoal")}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyStateBtnText}>Set a new goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
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
                  onPress={() => router.push("/(tabs)/mygoals")}
                >
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>

              {activeGoals.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>
                    You haven't set any goals yet.
                  </Text>
                  <TouchableOpacity onPress={() => router.push("/CreateGoal")}>
                    <Text style={styles.emptyAction}>
                      Create your first goal →
                    </Text>
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
                          <Text style={styles.goalMetaDim}>
                            No check-ins yet
                          </Text>
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
                {upcomingTasks.length > 0 && (
                  <TouchableOpacity onPress={() => router.push("/tasks")}>
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                )}
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
                      <Text style={styles.checkInGoal}>
                        {checkIn.goalTitle}
                      </Text>
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
          </>
        )}

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
    fontSize: 20,
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
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    gap: 12,
  },
  emptyStateEmoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 20,
  },
  emptyStateBtn: {
    marginTop: 16,
    backgroundColor: "#FF6B35",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  emptyStateBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  flowContainer: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    gap: 4,
  },
  flowStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
  },
  flowIcon: {
    width: 32,
    textAlign: "center",
  },
  flowText: {
    flex: 1,
  },
  flowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  flowDesc: {
    fontSize: 12,
    color: "#555",
  },
  flowDivider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginLeft: 46,
  },
});
