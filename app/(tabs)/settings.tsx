import React, { useState, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Button,
  Text,
  useTheme,
  List,
  Divider,
  Switch,
  Dialog,
  Portal,
  Banner,
} from "react-native-paper";
import { useFocusEffect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useUI } from "../../src/context/UIContext";
import { useAppTheme } from "../../src/context/ThemeContext";
import { UserService } from "../../src/services/userService";
import { exportLogsToText } from "../../src/utils/exportUtils";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { db } from "../../src/config/firebase";
import { Log } from "../../src/types";

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();
  const { showToast } = useUI();

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [accountStatus, setAccountStatus] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number>(0);

  const checkAccountStatus = useCallback(async () => {
    if (!user) return;

    try {
      const result = await UserService.getAccountStatus(user.uid);

      if (result && result.status === "scheduled_for_deletion") {
        setAccountStatus("scheduled_for_deletion");

        if (result.scheduledDate) {
          const today = new Date();
          const diffTime = result.scheduledDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          // Ensure we don't show negative days
          setDaysLeft(diffDays > 0 ? diffDays : 0);
        }
      } else {
        setAccountStatus(null);
      }
    } catch (error) {
      console.error("Failed to check status", error);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      checkAccountStatus();
    }, [checkAccountStatus]),
  );

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
      setAccountStatus("scheduled_for_deletion");
      await checkAccountStatus();
      setDeleteDialogVisible(false);
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

  const handleReactivate = async () => {
    if (!user) return;
    setLoadingStatus(true);
    try {
      await UserService.cancelDeletion(user.uid);
      setAccountStatus(null);
      showToast("Account Reactivated!", "info");
    } catch (error) {
      showToast("Failed to reactivate", "error");
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text
          variant="headlineLarge"
          style={{ fontWeight: "bold", color: theme.colors.primary }}
        >
          Settings
        </Text>
      </View>

      <Banner
        visible={accountStatus === "scheduled_for_deletion"}
        icon="alert"
        style={{
          marginBottom: 10,
          borderRadius: 8,
          backgroundColor: theme.colors.errorContainer,
        }}
      >
        {`Your account is scheduled for deletion in ${daysLeft} days.`}
      </Banner>

      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => <Switch value={isDark} onValueChange={toggleTheme} />}
        />
      </List.Section>

      <Divider />

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
      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item
          title="Sign Out"
          left={(props) => (
            <List.Icon
              {...props}
              icon="logout"
              color={theme.colors.onSurface}
            />
          )}
          onPress={logout}
        />

        {accountStatus === "scheduled_for_deletion" ? (
          <List.Item
            title="Reactivate Account"
            titleStyle={{ color: theme.colors.primary, fontWeight: "bold" }}
            description="Cancel the pending deletion"
            left={(props) => (
              <List.Icon
                {...props}
                icon="restore"
                color={theme.colors.primary}
              />
            )}
            onPress={handleReactivate}
            right={(props) =>
              loadingStatus ? (
                <Button loading compact>
                  Wait
                </Button>
              ) : null
            }
          />
        ) : (
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
        )}
      </List.Section>
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
