import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ==================== USER & AUTH TABLES ====================

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  username: text("username").notNull().unique(),
  isPremium: integer("is_premium", { mode: "boolean" }).notNull().default(false),
  premiumExpiresAt: integer("premium_expires_at", { mode: "timestamp" }),
  lemonSqueezyCustomerId: text("lemon_squeezy_customer_id"),
  lemonSqueezySubscriptionId: text("lemon_squeezy_subscription_id"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  // Security fields
  mustChangePassword: integer("must_change_password", { mode: "boolean" }).notNull().default(false),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: integer("password_reset_expires", { mode: "timestamp" }),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: integer("locked_until", { mode: "timestamp" }),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  lastLoginIp: text("last_login_ip"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

// ==================== CONTENT TABLES ====================

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  videoCount: integer("video_count").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const actresses = sqliteTable("actresses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  bio: text("bio"),
  image: text("image"),
  videoCount: integer("video_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const videos = sqliteTable("videos", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  abyssEmbed: text("abyss_embed").notNull(), // e.g., https://abyss.to/embed/abc123
  thumbnail: text("thumbnail"),
  duration: integer("duration"), // in seconds
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  dislikes: integer("dislikes").notNull().default(0),
  actressId: text("actress_id").references(() => actresses.id, { onDelete: "set null" }),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Track user interactions (likes/dislikes) to prevent duplicate votes
export const videoInteractions = sqliteTable(
  "video_interactions",
  {
    id: text("id").primaryKey(),
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    visitorId: text("visitor_id").notNull(), // IP hash or session ID for anonymous users
    interactionType: text("interaction_type", { enum: ["like", "dislike"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  }
);

export const videoCategories = sqliteTable(
  "video_categories",
  {
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.videoId, table.categoryId] }),
  })
);

export const videoActresses = sqliteTable(
  "video_actresses",
  {
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    actressId: text("actress_id")
      .notNull()
      .references(() => actresses.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.videoId, table.actressId] }),
  })
);

// ==================== SUBSCRIPTION TABLES ====================

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lemonSqueezySubscriptionId: text("lemon_squeezy_subscription_id").notNull().unique(),
  lemonSqueezyOrderId: text("lemon_squeezy_order_id"),
  lemonSqueezyProductId: text("lemon_squeezy_product_id"),
  lemonSqueezyVariantId: text("lemon_squeezy_variant_id"),
  status: text("status", { 
    enum: ["active", "cancelled", "expired", "paused", "past_due", "unpaid", "on_trial"] 
  }).notNull(),
  currentPeriodStart: integer("current_period_start", { mode: "timestamp" }),
  currentPeriodEnd: integer("current_period_end", { mode: "timestamp" }),
  cancelledAt: integer("cancelled_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ==================== RELATIONS ====================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  subscriptions: many(subscriptions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  actress: one(actresses, {
    fields: [videos.actressId],
    references: [actresses.id],
  }),
  videoCategories: many(videoCategories),
  videoActresses: many(videoActresses),
  videoInteractions: many(videoInteractions),
}));

export const actressesRelations = relations(actresses, ({ many }) => ({
  videos: many(videos),
  videoActresses: many(videoActresses),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  videoCategories: many(videoCategories),
}));

export const videoCategoriesRelations = relations(videoCategories, ({ one }) => ({
  video: one(videos, {
    fields: [videoCategories.videoId],
    references: [videos.id],
  }),
  category: one(categories, {
    fields: [videoCategories.categoryId],
    references: [categories.id],
  }),
}));

export const videoActressesRelations = relations(videoActresses, ({ one }) => ({
  video: one(videos, {
    fields: [videoActresses.videoId],
    references: [videos.id],
  }),
  actress: one(actresses, {
    fields: [videoActresses.actressId],
    references: [actresses.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const videoInteractionsRelations = relations(videoInteractions, ({ one }) => ({
  video: one(videos, {
    fields: [videoInteractions.videoId],
    references: [videos.id],
  }),
}));

// ==================== TYPE EXPORTS ====================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Actress = typeof actresses.$inferSelect;
export type NewActress = typeof actresses.$inferInsert;
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type VideoCategory = typeof videoCategories.$inferSelect;
export type VideoActress = typeof videoActresses.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type VideoInteraction = typeof videoInteractions.$inferSelect;
export type NewVideoInteraction = typeof videoInteractions.$inferInsert;
