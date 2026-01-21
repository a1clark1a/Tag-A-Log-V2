import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let auth: any;

try {
  auth = getAuth(app);
} catch (e) {
  // Initial with Manual Persistence since getReactNativePersistence no longer accessible in imports
  auth = initializeAuth(app, {
    persistence: {
      type: "LOCAL",
      _isAvailable: () => true,
      _setPersistence: async () => {},
      _shouldInProcrastinate: () => true,
      addListener: (key: any, listener: any) => {},
      removeListener: (key: any, listener: any) => {},

      _setItem: async (key: string, value: string) => {
        return AsyncStorage.setItem(key, value);
      },
      _getItem: async (key: string) => {
        return AsyncStorage.getItem(key);
      },
      _removeItem: async (key: string) => {
        return AsyncStorage.removeItem(key);
      },
    } as any,
  });
}

const db = getFirestore(app);

export { auth, db };
