import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { useUI } from "../../src/context/UIContext";
import { useAuth } from "../../src/context/AuthContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const { showToast } = useUI();
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email || !password) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setLoading(true);
    try {
      await register(email, password);

      // Note: No need to redirect manually.
      // The AuthContext will detect the new user and auto-redirect to Tabs.
    } catch (error: any) {
      showToast("Registration Failed", "error");
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
