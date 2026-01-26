import { Platform } from "react-native";
import { Auth, GoogleAuthProvider } from "firebase/auth";

import * as FirebaseAuth from "firebase/auth";

export const performGoogleSignIn = async (auth: Auth) => {
  if (Platform.OS === "web") {
    const { signInWithPopup } = FirebaseAuth as any;

    const provider = new GoogleAuthProvider();

    return await signInWithPopup(auth, provider);
  } else {
    throw new Error("Google Sign-In on mobile requires native configuration.");
  }
};
