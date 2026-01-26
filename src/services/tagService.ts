import {
  collection,
  addDoc,
  writeBatch,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  where,
  getDocs,
} from "firebase/firestore";

import { db } from "../config/firebase";
import { DB_LOGS, DB_TAGS, DB_USERS, Tag } from "../types";

// Path: users/{userId}/tags
const getTagCollection = (userId: string) =>
  collection(db, DB_USERS, userId, DB_TAGS);

export const TagService = {
  addTag: async (userId: string, name: string, color: string) => {
    try {
      await addDoc(getTagCollection(userId), {
        name,
        color,
        userId,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding tag:", error);
      throw error;
    }
  },

  updateTag: async (userId: string, tagId: string, updates: Partial<Tag>) => {
    try {
      const tagRef = doc(db, DB_USERS, userId, DB_TAGS, tagId);
      await updateDoc(tagRef, updates);
    } catch (error) {
      console.error("Error updating tag:", error);
      throw error;
    }
  },

  deleteTag: async (userId: string, tagId: string) => {
    try {
      const batch = writeBatch(db);

      const tagRef = doc(db, DB_USERS, userId, DB_TAGS, tagId);
      batch.delete(tagRef);

      const logsRef = collection(db, DB_USERS, userId, DB_LOGS);
      const q = query(logsRef, where("tagIds", "array-contains", tagId));
      const snapshot = await getDocs(q);

      snapshot.docs.forEach((docSnap) => {
        const logData = docSnap.data();
        const updatedTags = logData.tagIds.filter((id: string) => id !== tagId);

        batch.update(docSnap.ref, { tagIds: updatedTags });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error deleting tag:", error);
      throw error;
    }
  },

  subscribeTags: (userId: string, onUpdate: (tags: Tag[]) => void) => {
    const q = query(getTagCollection(userId), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tags = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Tag[];

      onUpdate(tags);
    });

    return unsubscribe;
  },
};
