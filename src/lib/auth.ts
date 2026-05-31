import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { supabase } from "./supabase";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.data?.idToken;

    if (!idToken) {
      console.error("No id token");
      return null;
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) {
      console.error("Supabase sign in error:", error);
      return null;
    }
    return data.user;
  } catch (error) {
    console.error("Google sign in error:", error);
    return null;
  }
}
