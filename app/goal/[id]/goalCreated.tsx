import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ACCENT = "#FF6B35";

export default function GoalCreated() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.hero}>
        <View style={styles.iconWrapper}>
          <Ionicons name="flag" size={40} color={ACCENT} />
        </View>
        <Text style={styles.title}>Goal Set!</Text>
        <Text style={styles.subtitle}>
          Now let's break down your goal into tasks
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace(`/goal/${id}`)}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#111" />
          <Text style={styles.primaryBtnText}>Let's Do It</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    marginBottom: 60,
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,107,53,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  secondaryBtn: {
    alignItems: "center",
    paddingVertical: 16,
  },
  secondaryBtnText: {
    fontSize: 15,
    color: "#444",
    fontWeight: "500",
  },
});
