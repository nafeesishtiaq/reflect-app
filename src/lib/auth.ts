import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "./supabase";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.revokeAccess();
    } catch (_) {}

    let userInfo;
    try {
      userInfo = await GoogleSignin.signIn();
    } catch (e: any) {
      if (
        e.code === statusCodes.SIGN_IN_REQUIRED ||
        e.message === "SIGN_IN_REQUIRED"
      ) {
        try {
          await GoogleSignin.signOut();
        } catch (_) {}
        userInfo = await GoogleSignin.signIn();
      } else {
        throw e;
      }
    }

    const idToken = userInfo?.data?.idToken;

    if (!idToken) {
      // console.error("No id token");
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
