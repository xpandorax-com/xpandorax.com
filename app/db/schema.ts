import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ==================== USER & AUTH TABLES ====================
// D1 is used for user data only. Content (videos, categories, etc.) is managed by Sanity CMS.

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  username: text("username").notNull().unique(),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  isPremium: integer("is_premium", { mode: "boolean" }).notNull().default(false),
  premiumExpiresAt: integer("premium_expires_at", { mode: "timestamp" }),
  lemonSqueezyCustomerId: text("lemon_squeezy_customer_id"),
  lemonSqueezySubscriptionId: text("lemon_squeezy_subscription_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  // Security & password reset fields
  mustChangePassword: integer("must_change_password", { mode: "boolean" }).notNull().default(false),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: integer("password_reset_expires", { mode: "timestamp" }),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: integer("locked_until", { mode: "timestamp" }),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  lastLoginIp: text("last_login_ip"),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
});

// ==================== USER INTERACTION TABLES ====================
// These track user interactions with Sanity-managed content (videos)
// Note: No foreign key to videos table since videos are in Sanity CMS

export const videoInteractions = sqliteTable("video_interactions", {
  id: text("id").primaryKey(),
  videoId: text("video_id").notNull(), // Sanity video _id
  visitorId: text("visitor_id").notNull(), // IP hash or session ID for anonymous users
  interactionType: text("interaction_type", { enum: ["like", "dislike"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  videoId: text("video_id").notNull(), // Sanity video _id
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  parentId: text("parent_id"), // For replies
  isEdited: integer("is_edited", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ==================== CONTENT VIEWS TABLE ====================
// Tracks view counts for videos, pictures, cuts, and actresses (content managed by Sanity)

export const contentViews = sqliteTable("content_views", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  contentId: text("content_id").notNull(), // Sanity content _id
  contentType: text("content_type", { enum: ["video", "picture", "actress", "cut"] }).notNull(),
  views: integer("views").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ==================== WATCH HISTORY TABLE ====================
// Tracks user watch history for videos

export const watchHistory = sqliteTable("watch_history", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  videoId: text("video_id").notNull(), // Sanity video _id
  watchedAt: integer("watched_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  watchDuration: integer("watch_duration").notNull().default(0), // seconds watched
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  lastPosition: integer("last_position").notNull().default(0), // resume position
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ==================== BOOKMARKS TABLE ====================
// User saved/favorited videos

export const bookmarks = sqliteTable("bookmarks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  videoId: text("video_id").notNull(), // Sanity video _id
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ==================== RELATIONS ====================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  comments: many(comments),
  watchHistory: many(watchHistory),
  bookmarks: many(bookmarks),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "replies",
  }),
  replies: many(comments, {
    relationName: "replies",
  }),
}));

export const watchHistoryRelations = relations(watchHistory, ({ one }) => ({
  user: one(users, {
    fields: [watchHistory.userId],
    references: [users.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
}));

// ==================== TYPE EXPORTS ====================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type VideoInteraction = typeof videoInteractions.$inferSelect;
export type NewVideoInteraction = typeof videoInteractions.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type ContentView = typeof contentViews.$inferSelect;
export type NewContentView = typeof contentViews.$inferInsert;
export type WatchHistory = typeof watchHistory.$inferSelect;
export type NewWatchHistory = typeof watchHistory.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
