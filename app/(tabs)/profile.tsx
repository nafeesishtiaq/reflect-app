import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  return (
    <View style={styles.container}>
      <Ionicons name="person-circle-outline" size={48} color="#333" />
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.sub}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  sub: {
    color: "#555",
    fontSize: 14,
  },
});
