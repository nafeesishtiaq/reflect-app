import { useGoalStore } from "@/src/store/goalStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ACCENT = "#FF6B35";

const progressEmoji = (rating: number) => {
  if (rating >= 5) return "🔥";
  if (rating >= 4) return "💪";
  if (rating >= 3) return "🙂";
  if (rating >= 2) return "😕";
  return "😞";
};

export default function GoalCompleted() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const goal = useGoalStore((state) => state.goals.find((g) => g.id === id));

  if (!goal) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#fff" }}>Goal not found.</Text>
      </View>
    );
  }

  const completedTasks = goal.tasks.filter((t) => t.completed).length;
  const avgProgress =
    goal.check_ins.length > 0
      ? (
          goal.check_ins.reduce((sum, c) => sum + c.progress, 0) /
          goal.check_ins.length
        ).toFixed(1)
      : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push("/")}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🎉</Text>
          <Text style={styles.heroTitle}>You did it!</Text>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          <Text style={styles.completedDate}>
            Completed {new Date(goal.completed_at!).toDateString()}
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{goal.check_ins.length}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
          <View style={[styles.statCard, styles.statCardCenter]}>
            <Text style={styles.statValue}>
              {completedTasks}/{goal.tasks.length}
            </Text>
            <Text style={styles.statLabel}>Tasks done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{avgProgress ?? "—"}</Text>
            <Text style={styles.statLabel}>Avg mood</Text>
          </View>
        </View>

        {/* Journey */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="journal-outline" size={16} color="#fff" />
            <Text style={styles.sectionTitle}>Your Journey</Text>
          </View>

          {goal.check_ins.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No reflections recorded.</Text>
            </View>
          ) : (
            goal.check_ins
              .slice()
              .reverse()
              .map((checkIn, index) => (
                <View key={checkIn.id} style={styles.timelineItem}>
                  {/* Timeline line */}
                  {index < goal.check_ins.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                  <View style={styles.timelineDot} />
                  <View style={styles.checkInCard}>
                    <View style={styles.checkInTop}>
                      <Text style={styles.checkInDate}>
                        {new Date(checkIn.date).toDateString().slice(4, 10)}
                      </Text>
                      <Text style={styles.checkInProgress}>
                        {progressEmoji(checkIn.progress)} {checkIn.progress}/5
                      </Text>
                    </View>
                    <Text style={styles.checkInJournal}>{checkIn.journal}</Text>
                  </View>
                </View>
              ))
          )}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.push("/")}
          activeOpacity={0.85}
        >
          <Ionicons name="home-outline" size={18} color="#fff" />
          <Text style={styles.homeBtnText}>Back to Home</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  hero: {
    alignItems: "center",
    paddingVertical: 32,
  },
  heroEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: ACCENT,
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  completedDate: {
    fontSize: 13,
    color: "#555",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  statCardCenter: {
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#555",
    fontWeight: "500",
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: -0.3,
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
  timelineItem: {
    flexDirection: "row",
    marginBottom: 12,
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 6,
    top: 24,
    bottom: -12,
    width: 1,
    backgroundColor: "#2A2A2A",
  },
  timelineDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: ACCENT,
    marginTop: 6,
    marginRight: 14,
    flexShrink: 0,
  },
  checkInCard: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 14,
  },
  checkInTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  checkInDate: {
    fontSize: 12,
    color: "#555",
    fontWeight: "500",
  },
  checkInProgress: {
    fontSize: 12,
    color: "#888",
  },
  checkInJournal: {
    fontSize: 13,
    color: "#888",
    lineHeight: 19,
  },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  homeBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
