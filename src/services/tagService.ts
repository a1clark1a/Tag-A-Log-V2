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
import { DB_TAGS, DB_USERS, Tag } from "../types";

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
      const tagRef = doc(db, DB_USERS, userId, DB_TAGS, tagId);
      await deleteDoc(tagRef);
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
