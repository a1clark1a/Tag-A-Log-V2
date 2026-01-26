import { Platform } from "react-native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { Log } from "../types";

/**
 * Formats logs into a readable text string and triggers a download/share.
 */
export const exportLogsToText = async (logs: Log[]) => {
  // 1. Format the Data
  const textContent = logs
    .map((log) => {
      let dateStr = "Unknown Date";
      if (log.createdAt) {
        if ("seconds" in log.createdAt) {
          dateStr = new Date(log.createdAt.seconds * 1000).toLocaleString();
        } else {
          dateStr = new Date(log.createdAt).toLocaleString();
        }
      }

      return `[${dateStr}] ${log.title || "(No Title)"}\n${log.content}\n-------------------------`;
    })
    .join("\n\n");

  const fileName = "tag-a-log-export.txt";

  if (Platform.OS === "web") {
    // --- WEB DOWNLOAD LOGIC ---
    try {
      const blob = new Blob([textContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (e) {
      console.error("Web export failed", e);
      return false;
    }
  } else {
    // --- MOBILE SHARE LOGIC ---
    try {
      const FS = FileSystem as any;
      const fileUri = (FS.cacheDirectory || "") + fileName;

      await FS.writeAsStringAsync(fileUri, textContent, {
        encoding: "utf8",
      });

      if (!(await Sharing.isAvailableAsync())) {
        alert("Sharing is not available on this device");
        return false;
      }

      await Sharing.shareAsync(fileUri);
      return true;
    } catch (e) {
      console.error("Mobile export failed", e);
      return false;
    }
  }
};
