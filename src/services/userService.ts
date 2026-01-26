import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { DB_USERS } from "../types";

export const UserService = {
  /**
   * Schedules account for deletion in 30 days.
   * This sets a flag that your backend (or login logic) checks.
   */
  scheduleDeletion: async (userId: string) => {
    const userRef = doc(db, DB_USERS, userId);

    // Calculate date 30 days from now
    const today = new Date();
    const deletionDate = new Date(today.setDate(today.getDate() + 30));

    await setDoc(userRef, {
      accountStatus: "scheduled_for_deletion",
      scheduledDeletionDate: Timestamp.fromDate(deletionDate),
      updatedAt: serverTimestamp(),
    });
  },
};
