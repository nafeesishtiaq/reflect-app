import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";

const ACCENT = "#FF6B35";

export default function Profile() {
  const { user, signOut } = useAuth();
  console.log("user metadata:", JSON.stringify(user?.user_metadata));
  console.log("app metadata:", JSON.stringify(user?.app_metadata));
  console.log("user:", JSON.stringify(user));
  const [notifications, setNotifications] = useState(true);

  const name =
    user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "User";
  const email = user?.email ?? "";
  const provider = user?.app_metadata?.provider ?? "email";

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.heading}>Profile</Text>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="person-outline" size={18} color="#888" />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Name</Text>
              <Text style={styles.rowValue}>{name}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Ionicons name="mail-outline" size={18} color="#888" />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.rowValue}>{email}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Ionicons name="logo-google" size={18} color="#888" />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Connected with</Text>
              <Text style={styles.rowValue}>
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="notifications-outline" size={18} color="#888" />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#2A2A2A", true: ACCENT }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={18} color="#ff4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
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
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 24,
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginLeft: 46,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  signOutText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "600",
  },
});
