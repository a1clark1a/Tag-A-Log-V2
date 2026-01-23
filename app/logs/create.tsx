import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  TextInput,
  Button,
  Chip,
  Text,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useUI } from "../../src/context/UIContext";
import { TagService } from "../../src/services/tagService";
import { LogService } from "../../src/services/logService";
import { Tag } from "../../src/types";

export default function CreateLogScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { showToast } = useUI();

  const params = useLocalSearchParams();
  const editingId = params.id as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSafeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // If there's no history, force send them to the main tabs
      router.replace("/(tabs)");
    }
  };

  useEffect(() => {
    if (!user) return;

    const unsubscribe = TagService.subscribeTags(user.uid, (data) => {
      setTags(data);
      setLoadingTags(false);
    });

    if (editingId) {
      setTitle((params.title as string) || "");
      setContent((params.content as string) || "");

      if (params.tagIds) {
        const ids =
          typeof params.tagIds === "string"
            ? params.tagIds.split(",")
            : params.tagIds;
        setSelectedTagIds(ids);
      }
    }

    return () => unsubscribe();
  }, [user, editingId]);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
    } else {
      setSelectedTagIds((prev) => [...prev, tagId]);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      showToast("Please add a title and some log.", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await LogService.updateLog(
          user!.uid,
          editingId,
          title,
          content,
          selectedTagIds,
        );
      } else {
        await LogService.addLog(user!.uid, title, content, selectedTagIds);
      }
      showToast("Log saved successfully!", "info");

      handleSafeBack();
    } catch (error) {
      showToast("Failed to save log. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            variant="titleMedium"
            style={{ marginBottom: 15, opacity: 0.5 }}
          >
            {editingId ? "Editing Log" : "New Log"}
          </Text>
          <Text
            variant="labelSmall"
            style={{
              opacity: 0.5,
              color: title.length >= 20 ? theme.colors.error : undefined,
            }}
          >
            {title.length}/20
          </Text>
        </View>

        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          maxLength={20}
          mode="flat"
          style={[
            styles.input,
            { backgroundColor: "tranparent", fontSize: 24, fontWeight: "bold" },
          ]}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />

        <View style={styles.tagContainer}>
          {loadingTags ? (
            <ActivityIndicator size="small" />
          ) : (
            tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <Chip
                  key={tag.id}
                  selected={isSelected}
                  showSelectedOverlay
                  onPress={() => toggleTag(tag.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected
                        ? tag.color
                        : theme.colors.surfaceVariant,
                    },
                  ]}
                  textStyle={{
                    color: isSelected ? "white" : theme.colors.onSurfaceVariant,
                  }}
                >
                  {tag.name}
                </Chip>
              );
            })
          )}
        </View>

        <TextInput
          placeholder="Start writing..."
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={500}
          mode="flat"
          style={[styles.contentInput, { backgroundColor: "transparent" }]}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.colors.elevation.level2 },
        ]}
      >
        <Button mode="text" onPress={handleSafeBack}>
          Cancel
        </Button>
        <Button mode="contained" onPress={handleSave} loading={saving}>
          {editingId ? "Update" : "Save"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  input: { marginBottom: 10, paddingHorizontal: 0 },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 29,
  },
  chip: { marginBottom: 4 },
  contentInput: { minHeight: 200, fontSize: 16 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
});
