import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text, useTheme, Button } from "react-native-paper";
import { Stack, useRouter } from "expo-router";

export default function PrivacyPolicy() {
  const theme = useTheme();
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Privacy Policy" }} />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text variant="headlineMedium" style={styles.header}>
          Privacy Policy
        </Text>
        <Text variant="bodyMedium" style={styles.text}>
          Privacy policy here
        </Text>
        <Button
          mode="contained"
          onPress={handleBack}
          style={{ marginVertical: 20 }}
        >
          Back
        </Button>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontWeight: "bold", marginBottom: 20 },
  text: { lineHeight: 24 },
});
