import React, { useState } from "react";
import { View, StyleSheet, Alert, Platform } from "react-native";
import {
  Button,
  Text,
  useTheme,
  List,
  Divider,
  Switch,
  Dialog,
  Portal,
} from "react-native-paper";
import { useAuth } from "../../src/context/AuthContext";
import { useUI } from "../../src/context/UIContext";
import { useAppTheme } from "../../src/context/ThemeContext"; // <--- Required for Dark Mode
import { UserService } from "../../src/services/userService";
import { exportLogsToText } from "../../src/utils/exportUtils";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { db } from "../../src/config/firebase";
import { Log } from "../../src/types";

export default function SettingsScreen() {
  const theme = useTheme();

  // 1. Get Auth functions (Sign Out)
  const { user, logout } = useAuth();

  // 2. Get Theme functions (Dark Mode)
  const { isDark, toggleTheme } = useAppTheme();

  const { showToast } = useUI();

  // State
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // --- ACTIONS ---

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const logsRef = collection(db, "users", user.uid, "logs");
      const q = query(logsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map((doc) => doc.data() as Log);

      if (logs.length === 0) {
        showToast("No logs to export.", "info");
        return;
      }

      const success = await exportLogsToText(logs);
      if (success) showToast("Export successful!", "info");
    } catch (error) {
      showToast("Failed to export logs", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await UserService.scheduleDeletion(user.uid);
      Alert.alert(
        "Account Scheduled for Deletion",
        "Your account will be permanently deleted in 30 days. Log in anytime before then to cancel this request.",
        [{ text: "OK", onPress: () => logout() }],
      );
      setDeleteDialogVisible(false);
    } catch (error) {
      showToast("Failed to schedule deletion", "error");
      setDeleting(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* HEADER: Simple and Clean */}
      <View style={styles.header}>
        <Text
          variant="headlineLarge"
          style={{ fontWeight: "bold", color: theme.colors.primary }}
        >
          Settings
        </Text>
      </View>

      {/* SECTION 1: APPEARANCE (Dark Mode) */}
      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => <Switch value={isDark} onValueChange={toggleTheme} />}
        />
      </List.Section>

      <Divider />

      {/* SECTION 2: DATA (Export) */}
      <List.Section>
        <List.Subheader>Data Management</List.Subheader>
        <List.Item
          title="Export Data"
          description="Download all logs as a text file"
          left={(props) => <List.Icon {...props} icon="file-export" />}
          onPress={handleExport}
          right={(props) =>
            exporting ? (
              <Button loading compact>
                Running
              </Button>
            ) : null
          }
        />
      </List.Section>

      <Divider />

      {/* SECTION 3: ACCOUNT (Sign Out & Delete) */}
      <List.Section>
        <List.Subheader>Account</List.Subheader>

        {/* Sign Out Option */}
        <List.Item
          title="Sign Out"
          left={(props) => (
            <List.Icon
              {...props}
              icon="logout"
              color={theme.colors.onSurface}
            />
          )}
          onPress={logout} // <--- Calls AuthContext logout
        />

        {/* Delete Account Option */}
        <List.Item
          title="Delete Account"
          titleStyle={{ color: theme.colors.error }}
          description="Permanently delete logs and tags"
          descriptionStyle={{ color: theme.colors.error }}
          left={(props) => (
            <List.Icon
              {...props}
              icon="delete-forever"
              color={theme.colors.error}
            />
          )}
          onPress={() => setDeleteDialogVisible(true)}
        />
      </List.Section>

      {/* DELETE CONFIRMATION POPUP */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete Account?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This action will schedule your account for permanent deletion.
            </Text>
            <Text
              variant="bodyMedium"
              style={{ marginTop: 10, fontWeight: "bold" }}
            >
              You have a 30-day grace period to undo this by simply logging back
              in.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              Cancel
            </Button>
            <Button
              textColor={theme.colors.error}
              onPress={handleDeleteAccount}
              loading={deleting}
            >
              Confirm Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 10, marginTop: 10 },
});
