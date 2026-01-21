import React, { useEffect, useState } from "react";
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
} from "react-native-paper";
import { useAuth } from "../../src/context/AuthContext";
import { TagService } from "../../src/services/tagService";
import { Tag } from "../../src/types";
import { useUI } from "../../src/context/UIContext";

export default function TagsScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { showToast } = useUI();

  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const openModal = (tag?: Tag) => {
    if (tag) {
      // Edit Mode
      setEditingId(tag.id);
      setTagName(tag.name);
      setTagColor(tag.color);
    } else {
      // Create Mode
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
      {/* Header */}

      <View style={styles.header}>
        <Text
          variant="headlineMedium"
          style={{ color: theme.colors.primary, fontWeight: "bold" }}
        >
          My Tags
        </Text>
        <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
          Create tags to organize your logs.
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loadingInitial ? (
          <ActivityIndicator size="large" style={{ marginTop: 50 }} />
        ) : tags.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 50, opacity: 0.5 }}>
            No Tags yet, Tap + to add one.
          </Text>
        ) : (
          <View style={styles.grid}>
            {tags.map((tag) => (
              <Chip
                key={tag.id}
                style={[styles.chip, { backgroundColor: tag.color + "20" }]}
                textStyle={{ color: theme.dark ? "white" : "black" }}
                onClose={() => handleDelete(tag.id)}
                onPress={() => openModal(tag)}
                icon="tag"
              >
                {tag.name}
              </Chip>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Modal */}
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
            onChangeText={setTagName}
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

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => openModal()}
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
