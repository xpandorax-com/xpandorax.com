import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const videoSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug is too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  abyssEmbed: z
    .string()
    .url("Must be a valid URL")
    .refine(
      (url) => url.includes("abyss.to/embed/"),
      "Must be an Abyss.to embed URL"
    ),
  thumbnailUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  duration: z.number().int().positive().optional(),
  premiumOnly: z.boolean().default(false),
  actressId: z.string().optional(),
  categoryIds: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug is too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  thumbnailUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  sortOrder: z.number().int().default(0),
});

export const actressSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug is too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  bio: z.string().optional(),
  thumbnailUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VideoInput = z.infer<typeof videoSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ActressInput = z.infer<typeof actressSchema>;
