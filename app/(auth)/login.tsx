import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import { auth } from "../../src/config/firebase";
import { useUI } from "../../src/context/UIContext";
import { useAuth } from "../../src/context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const theme = useTheme();
  const router = useRouter();
  const { login, signInWithGoogle } = useAuth();
  const { showToast } = useUI();

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // AuthContext should automatically detect user change and redirect
    } catch (error: any) {
      const errorMessage = error.message || "Something went wrong";
      showToast(errorMessage, "error");
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
          variant="displayMedium"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Tag-A-Log
        </Text>

        <TextInput
          label="email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          left={<TextInput.Icon icon="email" />}
        />

        <TextInput
          label="password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
          left={<TextInput.Icon icon="lock" />}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          style={{ marginTop: 10 }}
        >
          Login
        </Button>

        <Button
          mode="outlined"
          onPress={() => signInWithGoogle()}
          icon="google"
          style={{ marginTop: 15, borderColor: theme.colors.primary }}
        >
          Sign in with Google
        </Button>

        <Link href="/(auth)/register" asChild>
          <Button mode="text" style={styles.link}>
            Don't have an account? Sign up
          </Button>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  title: { textAlign: "center", marginBottom: 48, fontWeight: "bold" },
  input: { marginBottom: 16 },
  button: { marginTop: 12 },
  link: { marginTop: 24 },
});
