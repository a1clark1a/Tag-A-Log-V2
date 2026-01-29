import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, Chip, useTheme } from "react-native-paper";
import { Log, Tag } from "../types";

interface LogCardProps {
  log: Log;
  tags: Tag[];
  onPress: () => void;
}

export const LogCard = ({ log, tags, onPress }: LogCardProps) => {
  const theme = useTheme();

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Just now";
    return timestamp.toDate().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPreview = (text: string) => {
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <Text
          variant="labelSmall"
          style={{ color: theme.colors.outline, marginBottom: 5 }}
        >
          {formatDate(log.createdAt)}
        </Text>

        <Text
          variant="titleMedium"
          style={{ fontWeight: "bold", marginBottom: 5 }}
        >
          {log.title}
        </Text>

        {log.content ? (
          <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
            {getPreview(log.content)}
          </Text>
        ) : (
          <Text
            variant="bodyMedium"
            style={{ fontStyle: "italic", opacity: 0.5 }}
          >
            No content...
          </Text>
        )}

        {tags.length > 0 && (
          <View style={styles.tagRow}>
            {tags.map((tag) => (
              <Chip
                key={tag.id}
                style={[styles.chip, { backgroundColor: tag.color + "80" }]}
                textStyle={{ fontSize: 11 }}
                compact
              >
                {tag.name}
              </Chip>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  chip: { height: 32, alignItems: "center" },
});
