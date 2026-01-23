import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import {
  Text,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  Chip,
  useTheme,
  IconButton,
  ActivityIndicator,
  Searchbar,
} from "react-native-paper";
import { useAuth } from "../../src/context/AuthContext";
import { TagService } from "../../src/services/tagService";
import { Tag } from "../../src/types";
import { useUI } from "../../src/context/UIContext";
import { useRouter } from "expo-router";

export default function TagsScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const { showToast } = useUI();

  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedForFilter, setSelectedForFilter] = useState<string[]>([]);

  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#6200ee");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = TagService.subscribeTags(user.uid, (data) => {
      setTags(data);
      setLoadingInitial(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredTags = useMemo(() => {
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [tags, searchQuery]);

  const handleNameChange = (text: string) => {
    const cleaned = text.replace(/\s/g, "").slice(0, 10);
    setTagName(cleaned);
  };

  const handleChipPress = (tag: Tag) => {
    if (isSelectMode) {
      setSelectedForFilter((prev) =>
        prev.includes(tag.id)
          ? prev.filter((id) => id !== tag.id)
          : [...prev, tag.id],
      );
    } else {
      openModal(tag);
    }
  };

  const handleApplyFilter = () => {
    router.push({
      pathname: "/(tabs)",
      params: { filterTags: selectedForFilter.join(",") },
    });
    setIsSelectMode(false);
    setSelectedForFilter([]);
  };

  const openModal = (tag?: Tag) => {
    if (tag) {
      setEditingId(tag.id);
      setTagName(tag.name);
      setTagColor(tag.color);
    } else {
      setEditingId(null);
      setTagName("");
      setTagColor("#6200ee");
    }
    setVisible(true);
  };

  const handleSave = async () => {
    if (!tagName.trim()) return;
    setLoading(true);

    try {
      if (editingId) {
        await TagService.updateTag(user!.uid, editingId, {
          name: tagName,
          color: tagColor,
        });
      } else {
        await TagService.addTag(user!.uid, tagName, tagColor);
      }
      setVisible(false);
    } catch (err) {
      showToast("Could not save tag", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (tagId: string) => {
    if (isSelectMode) return;

    const title = "Delete Tag";
    const message = "Are you sure? This cannot be undone.";

    if (Platform.OS === "web") {
      // Web-specific confirmation
      if (window.confirm(`${title}\n${message}`)) {
        TagService.deleteTag(user!.uid, tagId);
      }
    } else {
      // Mobile-native confirmation
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => TagService.deleteTag(user!.uid, tagId),
        },
      ]);
    }
  };

  const colors = [
    "#f44336",
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#009688",
    "#4CAF50",
    "#FFC107",
    "#FF9800",
    "#795548",
    "#607D8B",
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Text
            variant="headlineMedium"
            style={{ color: theme.colors.primary, fontWeight: "bold" }}
          >
            {isSelectMode ? "Select Tags" : "Manage Tags"}
          </Text>

          <Button
            mode={isSelectMode ? "contained-tonal" : "text"}
            onPress={() => {
              setIsSelectMode(!isSelectMode);
              setSelectedForFilter([]); // Clear selection when toggling
            }}
          >
            {isSelectMode ? "Cancel" : "Select"}
          </Button>
        </View>
        <Text variant="bodyMedium" style={{ opacity: 0.7, paddingBottom: 10 }}>
          Create tags to organize your logs.
        </Text>
        <Searchbar
          placeholder="Search tags..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={{ minHeight: 0 }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loadingInitial ? (
          <ActivityIndicator size="large" style={{ marginTop: 50 }} />
        ) : filteredTags.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 50, opacity: 0.5 }}>
            No Tags yet, Tap + to add one.
          </Text>
        ) : (
          <View style={styles.grid}>
            {filteredTags.map((tag) => {
              const isSelected = selectedForFilter.includes(tag.id);
              return (
                <Chip
                  key={tag.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelectMode
                        ? isSelected
                          ? tag.color
                          : theme.colors.surfaceVariant
                        : tag.color + "20",
                    },
                  ]}
                  textStyle={{
                    color:
                      isSelectMode && isSelected
                        ? "white"
                        : theme.dark
                          ? "white"
                          : "black",
                  }}
                  onClose={
                    isSelectMode ? undefined : () => handleDelete(tag.id)
                  }
                  onPress={() => handleChipPress(tag)}
                  icon="tag"
                  showSelectedOverlay={isSelectMode}
                  selected={isSelectMode && isSelected}
                >
                  {tag.name}
                </Chip>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.elevation.level3 },
          ]}
        >
          <Text
            variant="titleLarge"
            style={{ marginBottom: 15, textAlign: "center" }}
          >
            {editingId ? "Edit Tag" : "New Tag"}
          </Text>

          <TextInput
            label="Tag Name"
            value={tagName}
            onChangeText={handleNameChange}
            maxLength={10}
            onKeyPress={(e) => e.nativeEvent.key === " " && e.preventDefault()}
            mode="outlined"
            style={{ marginBottom: 15 }}
          />

          <View style={styles.colorGrid}>
            {colors.map((c) => (
              <IconButton
                key={c}
                icon={tagColor === c ? "check-circle" : "circle"}
                iconColor={c}
                size={24}
                onPress={() => setTagColor(c)}
              />
            ))}
          </View>

          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            style={{ marginTop: 20 }}
          >
            {editingId ? "Save Changes" : "Create Tag"}
          </Button>
        </Modal>
      </Portal>

      <FAB
        icon={isSelectMode ? "filter-check" : "plus"}
        label={
          isSelectMode ? `Filter (${selectedForFilter.length})` : undefined
        }
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={isSelectMode ? handleApplyFilter : () => openModal()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  searchBar: { backgroundColor: "rgba(0,0,0,0.05)" },
  scrollContent: { padding: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { marginBottom: 4 },
  fab: { position: "absolute", margin: 20, right: 0, bottom: 0, zIndex: 100 },
  modal: { padding: 24, margin: 24, borderRadius: 12 },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});
