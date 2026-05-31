import { signInWithGoogle } from "@/src/lib/auth";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Login() {
  const router = useRouter();

  async function handleGoogleSignIn() {
    const user = await signInWithGoogle();
    if (user) router.replace("/(tabs)" as any);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Sign in to start tracking your goals</Text>

      <TouchableOpacity
        style={styles.googleBtn}
        onPress={handleGoogleSignIn}
        activeOpacity={0.85}
      >
        <Text style={styles.googleBtnText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    marginBottom: 48,
    textAlign: "center",
  },
  googleBtn: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  googleBtnText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "700",
  },
});
