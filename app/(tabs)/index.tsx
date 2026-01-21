import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, FAB, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";

export default function LogsScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text variant="headlineMedium" style={{ opacity: 0.5 }}>
          Your logs will appear here.
        </Text>
      </View>

      {/* The + Button */}
      <FAB
        icon="plus"
        label="New Log"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => router.push("/logs/create")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  fab: { position: "absolute", margin: 20, right: 0, bottom: 0 },
});
