import { signInWithGoogle } from "@/src/lib/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ACCENT = "#FF6B35";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function handleGoogleSignIn() {
    setLoading(true);
    const user = await signInWithGoogle();
    if (user) router.replace("/(tabs)");
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Reflect</Text>
        <Text style={styles.subtitle}>Never Lose Sight of Your Motivation</Text>
      </View>

      <View style={styles.signin}>
        <Text style={styles.prompt}>Sign in to get started</Text>
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleGoogleSignIn}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#111" />
          ) : (
            <Image
              source={require("../assets/images/google.png")}
              style={styles.googleIcon}
            />
          )}
          <Text style={styles.googleBtnText}>
            {loading ? "Signing in..." : "Continue with Google"}
          </Text>
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
    alignItems: "center",
    justifyContent: "center",
    gap: 48,
  },
  hero: {
    alignItems: "center",
  },
  signin: {
    width: "100%",
    gap: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: ACCENT,
    textAlign: "center",
    lineHeight: 22,
  },

  prompt: {
    fontSize: 13,
    color: "#444",
    textAlign: "center",
    marginBottom: 4,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleBtnText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "600",
  },
  terms: {
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    lineHeight: 17,
  },
});
