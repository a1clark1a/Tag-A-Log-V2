import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";
import { DB_LOGS, DB_USERS, Log } from "../types";

const getLogCollection = (userId: string) =>
  collection(db, DB_USERS, userId, DB_LOGS);

export const LogService = {
  addLog: async (
    userId: string,
    title: string,
    content: string,
    tagIds: string[],
  ) => {
    try {
      await addDoc(getLogCollection(userId), {
        title,
        content,
        tagIds,
        userId,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding Log:", error);
      throw error;
    }
  },

  updateLog: async (
    userId: string,
    logId: string,
    title: string,
    content: string,
    tagIds: string[],
  ) => {
    try {
      const logRef = doc(db, DB_USERS, userId, DB_LOGS, logId);

      await updateDoc(logRef, {
        title,
        content,
        tagIds,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating Log", error);
      throw error;
    }
  },

  subscribeLogs: (userId: string, onUpdate: (logs: Log[]) => void) => {
    const q = query(getLogCollection(userId), orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Log[];

      onUpdate(logs);
    });
  },

  deleteLog: async (userId: string, logId: string) => {
    await deleteDoc(doc(db, DB_USERS, userId, DB_LOGS, logId));
  },
};
