import { Argon2id } from "oslo/password";
import { generateIdFromEntropySize } from "lucia";
import { eq } from "drizzle-orm";
import type { Database } from "~/db";
import { users, type User, type NewUser } from "~/db/schema";

// Oslo Argon2id instance for password hashing (Cloudflare Workers compatible)
const argon2id = new Argon2id();

export async function hashPassword(password: string): Promise<string> {
  return await argon2id.hash(password);
}

export async function verifyPassword(
  hashedPassword: string,
  password: string
): Promise<boolean> {
  return await argon2id.verify(hashedPassword, password);
}

export function generateUserId(): string {
  return generateIdFromEntropySize(10); // 16 characters
}

export async function createUser(
  db: Database,
  data: {
    email: string;
    username: string;
    password: string;
  }
): Promise<User> {
  const id = generateUserId();
  const hashedPassword = await hashPassword(data.password);
  const now = new Date();

  const newUser: NewUser = {
    id,
    email: data.email.toLowerCase(),
    username: data.username,
    hashedPassword,
    isPremium: false,
    role: "user",
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(users).values(newUser);

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) {
    throw new Error("Failed to create user");
  }

  return user;
}

export async function getUserByEmail(
  db: Database,
  email: string
): Promise<User | undefined> {
  return await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });
}

export async function getUserByUsername(
  db: Database,
  username: string
): Promise<User | undefined> {
  return await db.query.users.findFirst({
    where: eq(users.username, username),
  });
}

export async function getUserById(
  db: Database,
  id: string
): Promise<User | undefined> {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function updateUserPremiumStatus(
  db: Database,
  userId: string,
  isPremium: boolean,
  expiresAt?: Date
): Promise<void> {
  await db
    .update(users)
    .set({
      isPremium,
      premiumExpiresAt: expiresAt ?? null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function updateUserLemonSqueezy(
  db: Database,
  userId: string,
  customerId: string,
  subscriptionId: string
): Promise<void> {
  await db
    .update(users)
    .set({
      lemonSqueezyCustomerId: customerId,
      lemonSqueezySubscriptionId: subscriptionId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
