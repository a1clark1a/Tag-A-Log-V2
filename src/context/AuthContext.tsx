import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../config/firebase";
import { performGoogleSignIn } from "../utils/authUtils";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { DB_USERS } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("AuthContext: Starting listener...");

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log(
        "AuthContext: Firebase responded!",
        firebaseUser ? "User found" : "No user",
      );
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    console.log("AuthContext: Still loading...");
  }

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      pass,
    );

    await setDoc(doc(db, DB_USERS, userCredential.user.uid), {
      email: userCredential.user.email,
      createdAt: serverTimestamp(),
    });
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const signInWithGoogle = async () => {
    try {
      await performGoogleSignIn(auth);
    } catch (error: any) {
      console.error("Google Sign in Error", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, signInWithGoogle }}
    >
      {children}
    </AuthContext.Provider>
  );
};
