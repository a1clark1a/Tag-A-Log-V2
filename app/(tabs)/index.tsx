import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, FAB, useTheme, ActivityIndicator } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { Log, Tag } from "../../src/types";
import { LogService } from "../../src/services/logService";
import { TagService } from "../../src/services/tagService";
import { LogCard } from "../../src/components/LogCard";

export default function LogsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();

  const [logs, setLogs] = useState<Log[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(true);
  const [loadingTags, setLoadingTags] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;

    const unSubLogs = LogService.subscribeLogs(user.uid, (data) => {
      setLogs(data);
      setLoadingLogs(false);
    });

    const unSubTags = TagService.subscribeTags(user.uid, (data) => {
      setTags(data);
      setLoadingTags(false);
    });

    return () => {
      unSubLogs();
      unSubTags();
    };
  }, [user]);

  const handleEdit = (log: Log) => {
    router.push({
      pathname: "/logs/create",
      params: {
        id: log.id,
        title: log.title,
        content: log.content,
        tagIds: log.tagIds.join(","),
      },
    });
  };

  const getLogTags = (logTagIds: string[]) => {
    return tags.filter((tag) => logTagIds.includes(tag.id));
  };

  const isLoading = loadingLogs || loadingTags;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text
          variant="headlineLarge"
          style={{ fontWeight: "bold", color: theme.colors.primary }}
        >
          Timeline
        </Text>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      ) : logs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="bodyLarge" style={{ opacity: 0.5 }}>
            {" "}
            No Logs yet.
          </Text>
          <Text variant="bodyMedium" style={{ opacity: 0.5 }}>
            Tap the + button to add one.
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item: Log) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }: { item: Log }) => (
            <LogCard
              log={item}
              tags={getLogTags(item.tagIds)}
              onPress={() => handleEdit(item)}
            />
          )}
        />
      )}

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
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  list: { padding: 20, paddingBottom: 100 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
  fab: { position: "absolute", margin: 20, right: 0, bottom: 0 },
});
