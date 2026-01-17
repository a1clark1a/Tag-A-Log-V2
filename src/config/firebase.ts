import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Singleton pattern
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let auth: any;

try {
  auth = getAuth(app);
} catch (e) {
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
