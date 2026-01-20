import { Timestamp } from "firebase/firestore";

export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Timestamp;
}

export interface Log {
  id: string;
  title: string;
  content: string;
  tagIds: string[];
  userId: string;
  createdAt: Timestamp;
}

export const DB_TAGS = "tags";
export const DB_LOGS = "logs";
export const DB_USERS = "users";
