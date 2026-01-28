import { Platform } from "react-native";
import { Auth, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import * as FirebaseAuth from "firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const performGoogleSignIn = async (auth: Auth) => {
  if (Platform.OS === "web") {
    const { signInWithPopup } = FirebaseAuth as any;
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  } else {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await GoogleSignin.signIn();

      const idToken = response.data?.idToken;

      if (!idToken) throw new Error("No ID Token received from Google Sign-In");

      const googleCredential = GoogleAuthProvider.credential(idToken);

      return await signInWithCredential(auth, googleCredential);
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      if (error.code === "12501" || error.code === "-5") {
        throw new Error("Google Sign-In was cancelled");
      } else if (error.code === "SIGN_IN_CANCELLED") {
        throw new Error("Sign-in was cancelled");
      } else if (error.code === "IN_PROGRESS") {
        throw new Error("Sign-in already in progress");
      } else if (error.code === "PLAY_SERVICES_NOT_AVAILABLE") {
        throw new Error("Google Play Services not available");
      }

      throw error;
    }
  }
};
