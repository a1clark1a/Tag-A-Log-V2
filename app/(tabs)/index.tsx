import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, FlatList, ScrollView } from "react-native";
import {
  Text,
  FAB,
  useTheme,
  ActivityIndicator,
  Searchbar,
  Chip,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { Log, Tag } from "../../src/types";
import { LogService } from "../../src/services/logService";
import { TagService } from "../../src/services/tagService";
import { LogCard } from "../../src/components/LogCard";

export default function LogsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  const [logs, setLogs] = useState<Log[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

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

  useEffect(() => {
    if (params.filterTags) {
      const ids = (params.filterTags as string).split(",");
      setSelectedTagIds(ids);
    }

    router.setParams({ filterTags: undefined });
  }, [params.filterTags]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = log.title?.toLowerCase().includes(query);

      let matchesTag = true;

      if (selectedTagIds.length > 0) {
        if (selectedTagIds.includes("UNTAGGED")) {
          matchesTag = log.tagIds.length === 0;
        } else {
          matchesTag = log.tagIds.some((id) => selectedTagIds.includes(id));
        }
      }

      return matchesSearch && matchesTag;
    });
  }, [logs, searchQuery, selectedTagIds]);

  const toggleFilter = (id: string | null) => {
    if (id === null) {
      setSelectedTagIds([]);
      return;
    }
    setSelectedTagIds([id]);
  };

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

        <Searchbar
          placeholder="Search logs..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            marginBottom: 10,
            backgroundColor: theme.colors.elevation.level2,
          }}
          inputStyle={{ minHeight: 0 }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ maxHeight: 40 }}
        >
          <Chip
            selected={selectedTagIds.length === 0}
            onPress={() => toggleFilter(null)}
            style={{ marginRight: 8 }}
          >
            All
          </Chip>

          <Chip
            selected={selectedTagIds.includes("UNTAGGED")}
            onPress={() => toggleFilter("UNTAGGED")}
            style={{ marginRight: 8 }}
            showSelectedOverlay
          >
            Untagged
          </Chip>

          {tags.map((tag) => (
            <Chip
              key={tag.id}
              selected={selectedTagIds.includes(tag.id)}
              onPress={() => toggleFilter(tag.id)}
              style={{
                marginRight: 8,
                backgroundColor: selectedTagIds.includes(tag.id)
                  ? tag.color
                  : undefined,
              }}
              textStyle={{
                color: selectedTagIds.includes(tag.id) ? "white" : undefined,
              }}
              showSelectedOverlay
            >
              {tag.name}
            </Chip>
          ))}
        </ScrollView>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      ) : filteredLogs.length === 0 ? (
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
          data={filteredLogs}
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
