import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../src/config/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "expo-router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password)
      return Alert.alert("Error", "Please fill in all fields");

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: serverTimestamp(),
      });

      // Note: No need to redirect manually.
      // The AuthContext will detect the new user and auto-redirect to Tabs.
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Create Account
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          style={styles.button}
        >
          Sign Up
        </Button>

        <Button mode="text" onPress={() => router.back()} style={styles.link}>
          Back to Login
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  title: { textAlign: "center", marginBottom: 40, fontWeight: "bold" },
  input: { marginBottom: 16 },
  button: { marginTop: 12 },
  link: { marginTop: 24 },
});
