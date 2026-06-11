import { ObjectId } from "mongodb";

export type Role = "admin" | "student";

export interface User {
  _id: ObjectId;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
}

export interface MagicLink {
  _id: ObjectId;
  email: string;
  token: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface Session {
  _id: ObjectId;
  userId: ObjectId;
  token: string;
  expiresAt: Date;
}

export interface Course {
  _id: ObjectId;
  title: string;
  slug: string;
  description: string;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  _id: ObjectId;
  courseId: ObjectId;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  _id: ObjectId;
  sectionId: ObjectId;
  courseId: ObjectId;
  title: string;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Feedback {
  _id: ObjectId;
  resourceId: ObjectId;
  userId: ObjectId;
  rating: number | null;
  comment: string;
  createdAt: Date;
}
